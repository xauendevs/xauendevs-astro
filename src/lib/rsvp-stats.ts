import { turso } from "@/lib/turso";
import { getPivosStrapi } from "@/lib/get-info-pivos";
import { slugify } from "@/lib/event-slug";

export type RsvpStats = { id: string; title: string; date: Date | null; confirmed: number; pending: number };

export type SignupCurve = { title: string; points: number[] };

export type Dashboard = {
  events: RsvpStats[];
  next: (RsvpStats & { daysLeft: number; confirmRate: number | null }) | null;
  totals: {
    confirmed: number;
    people: number;
    recurrentPeople: number;
    avgPerPivo: number | null;
    reminded: number;
    confirmedAfterReminder: number;
    medianHoursToConfirm: number | null;
  };
  // Inscripciones acumuladas por día, de CURVE_DAYS días antes del evento hasta el día del evento.
  curves: { current: SignupCurve | null; previous: SignupCurve | null };
  // heatmap[díaSemana lunes=0][franja de 3 h] = inscripciones, en hora de Madrid.
  heatmap: number[][];
};

export const CURVE_DAYS = 21;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
// Una Pivo sigue siendo «la próxima» hasta unas horas después de empezar.
const NEXT_GRACE_HOURS = 4;

// SQLite guarda CURRENT_TIMESTAMP en UTC y sin zona: «2026-10-23 17:05:00».
const parseSqlDate = (value: unknown) => (value ? new Date(`${String(value).replace(" ", "T")}Z`) : null);

// Días de calendario (en Madrid) entre hoy y la fecha: 0 si es hoy, aunque falten unas horas.
const madridDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" });
const calendarDaysUntil = (date: Date, now: number) => Math.round((Date.parse(madridDay.format(date)) - Date.parse(madridDay.format(now))) / DAY);

const madridParts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", weekday: "short", hour: "2-digit", hourCycle: "h23" });
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const median = (values: number[]) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// Solo agregados: los emails no salen nunca de la base (se agrupan en SQL) y los nombres ni se leen.
export const getDashboard = async (): Promise<Dashboard> => {
  const [rowsResult, peopleResult, pivos] = await Promise.all([
    turso.execute(
      `SELECT event_id, status, created_at, confirmed_at, reminder_sent_at FROM event_rsvps
      WHERE status = 'confirmed' OR expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP`,
    ),
    turso.execute(
      "SELECT COUNT(*) AS people, COALESCE(SUM(n >= 2), 0) AS recurrent FROM (SELECT email, COUNT(*) AS n FROM event_rsvps WHERE status = 'confirmed' GROUP BY email)",
    ),
    getPivosStrapi().then((data) => data ?? []),
  ]);

  const rows = rowsResult.rows.map((row) => ({
    eventId: String(row.event_id),
    confirmed: row.status === "confirmed",
    createdAt: parseSqlDate(row.created_at),
    confirmedAt: parseSqlDate(row.confirmed_at),
    remindedAt: parseSqlDate(row.reminder_sent_at),
  }));

  const byEvent = new Map<string, { confirmed: number; pending: number }>();
  for (const row of rows) {
    const count = byEvent.get(row.eventId) ?? { confirmed: 0, pending: 0 };
    if (row.confirmed) count.confirmed++;
    else count.pending++;
    byEvent.set(row.eventId, count);
  }

  const known = new Set<string>();
  const events: RsvpStats[] = pivos.map((pivo) => {
    const id = slugify(pivo.title);
    known.add(id);
    return { id, title: pivo.title, date: Number.isNaN(pivo.date.getTime()) ? null : pivo.date, ...(byEvent.get(id) ?? { confirmed: 0, pending: 0 }) };
  });
  // Inscripciones de eventos que ya no están en Strapi (p. ej. si se renombró el título).
  for (const [id, count] of byEvent) if (!known.has(id)) events.push({ id, title: id, date: null, ...count });
  events.sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));

  const now = Date.now();
  const upcoming = events
    .filter((event) => event.date && event.date.getTime() > now - NEXT_GRACE_HOURS * HOUR)
    .sort((a, b) => a.date!.getTime() - b.date!.getTime());
  const nextEvent = upcoming[0] ?? null;
  const next = nextEvent
    ? {
        ...nextEvent,
        daysLeft: Math.max(0, calendarDaysUntil(nextEvent.date!, now)),
        confirmRate: nextEvent.confirmed + nextEvent.pending > 0 ? nextEvent.confirmed / (nextEvent.confirmed + nextEvent.pending) : null,
      }
    : null;

  // Pivos ya celebradas con inscripciones: la base de las medias y de la curva de comparación.
  const past = events.filter((event) => event.date && event.date.getTime() <= now - NEXT_GRACE_HOURS * HOUR && event.confirmed + event.pending > 0);

  const curveFor = (event: RsvpStats | undefined | null): SignupCurve | null => {
    if (!event?.date) return null;
    const points = new Array(CURVE_DAYS + 1).fill(0);
    for (const row of rows) {
      if (row.eventId !== event.id || !row.createdAt) continue;
      const daysBefore = Math.floor((event.date.getTime() - row.createdAt.getTime()) / DAY);
      // Lo apuntado antes de la ventana cuenta desde el primer día; lo apuntado el mismo día, en el último.
      const index = CURVE_DAYS - Math.min(CURVE_DAYS, Math.max(0, daysBefore));
      for (let i = index; i <= CURVE_DAYS; i++) points[i]++;
    }
    // La Pivo en curso solo se pinta hasta hoy: el futuro no es una línea plana.
    const today = CURVE_DAYS - Math.floor((event.date.getTime() - now) / DAY);
    return { title: event.title, points: today < CURVE_DAYS ? points.slice(0, Math.max(1, today + 1)) : points };
  };

  const heatmap = Array.from({ length: 7 }, () => new Array(8).fill(0));
  for (const row of rows) {
    if (!row.createdAt) continue;
    const parts = madridParts.formatToParts(row.createdAt);
    const day = WEEKDAYS.indexOf(parts.find((part) => part.type === "weekday")?.value ?? "");
    const hour = Number(parts.find((part) => part.type === "hour")?.value);
    if (day >= 0 && hour >= 0) heatmap[day][Math.floor(hour / 3)]++;
  }

  const reminded = rows.filter((row) => row.remindedAt);
  const confirmed = rows.filter((row) => row.confirmed);
  const people = peopleResult.rows[0];

  return {
    events,
    next,
    totals: {
      confirmed: confirmed.length,
      people: Number(people?.people ?? 0),
      recurrentPeople: Number(people?.recurrent ?? 0),
      avgPerPivo: past.length ? past.reduce((sum, event) => sum + event.confirmed, 0) / past.length : null,
      reminded: reminded.length,
      confirmedAfterReminder: reminded.filter((row) => row.confirmedAt && row.confirmedAt >= row.remindedAt!).length,
      medianHoursToConfirm: median(
        confirmed.filter((row) => row.createdAt && row.confirmedAt).map((row) => (row.confirmedAt!.getTime() - row.createdAt!.getTime()) / HOUR),
      ),
    },
    curves: { current: curveFor(nextEvent), previous: curveFor(past[0]) },
    heatmap,
  };
};
