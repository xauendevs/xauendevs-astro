import type { APIRoute } from "astro";
import { turso } from "@/lib/turso";
import { Resend } from "resend";
import { buildRsvpConfirmationEmail } from "@/lib/rsvp-email";
import { getEventDetails } from "@/lib/rsvp-event";

const RATE_LIMIT = 5;
const RATE_WINDOW_MINUTES = 10;
const RSVP_CODE_LENGTH = 10;
const RSVP_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const json = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...extraHeaders } });

const ensureTables = async () => {
  await turso.batch([
    {
      sql: `CREATE TABLE IF NOT EXISTS event_rsvps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        rsvp_code_hash TEXT,
        confirm_code_hash TEXT,
        status TEXT NOT NULL DEFAULT 'confirmed',
        expires_at TEXT,
        confirmed_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, email)
      )`,
      args: [],
    },
    {
      sql: "CREATE TABLE IF NOT EXISTS rsvp_rate_limits (id INTEGER PRIMARY KEY AUTOINCREMENT, ip_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
      args: [],
    },
    {
      sql: "CREATE TABLE IF NOT EXISTS rsvp_cancel_rate_limits (id INTEGER PRIMARY KEY AUTOINCREMENT, ip_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
      args: [],
    },
    {
      sql: "CREATE TABLE IF NOT EXISTS rsvp_confirm_rate_limits (id INTEGER PRIMARY KEY AUTOINCREMENT, ip_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
      args: [],
    },
  ]);

  for (const statement of [
    "ALTER TABLE event_rsvps ADD COLUMN rsvp_code_hash TEXT",
    "ALTER TABLE event_rsvps ADD COLUMN confirm_code_hash TEXT",
    "ALTER TABLE event_rsvps ADD COLUMN status TEXT NOT NULL DEFAULT 'confirmed'",
    "ALTER TABLE event_rsvps ADD COLUMN expires_at TEXT",
    "ALTER TABLE event_rsvps ADD COLUMN confirmed_at TEXT",
  ]) {
    try {
      await turso.execute({ sql: statement, args: [] });
    } catch {}
  }

  await turso.batch([
    { sql: "CREATE UNIQUE INDEX IF NOT EXISTS idx_event_rsvps_code_hash ON event_rsvps(rsvp_code_hash)", args: [] },
    { sql: "CREATE UNIQUE INDEX IF NOT EXISTS idx_event_rsvps_confirm_code_hash ON event_rsvps(confirm_code_hash)", args: [] },
  ]);
};

const normalizeEmail = (value: unknown) => {
  const email = String(value ?? "").trim().toLowerCase();
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return email;
  if (domain === "gmail.com" || domain === "googlemail.com") return localPart.split("+")[0].replace(/\./g, "") + "@gmail.com";
  return email;
};

const normalizeName = (value: unknown) => String(value ?? "").trim().replace(/\s+/g, " ");

const getClientIp = (request: Request) =>
  request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  request.headers.get("x-real-ip")?.trim() ||
  "unknown";

const generateRsvpCode = () => {
  const bytes = new Uint8Array(RSVP_CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => RSVP_CODE_ALPHABET[byte % RSVP_CODE_ALPHABET.length]).join("");
};

export const hashValue = async (value: string) => {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const rateLimited = async (table: string, ipHash: string) => {
  const result = await turso.execute({
    sql: `SELECT COUNT(*) AS count FROM ${table} WHERE ip_hash = ? AND created_at >= datetime('now', ?)`,
    args: [ipHash, `-${RATE_WINDOW_MINUTES} minutes`],
  });
  return Number(result.rows[0]?.count ?? 0) >= RATE_LIMIT;
};

const registerRateAttempt = async (table: string, ipHash: string) => {
  await turso.execute({ sql: `INSERT INTO ${table} (ip_hash) VALUES (?)`, args: [ipHash] });
  await turso.execute({ sql: `DELETE FROM ${table} WHERE created_at < datetime('now', '-1 day')` });
};

const toSqlDate = (date: Date) => date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "");

export const GET: APIRoute = async ({ url }) => {
  const rsvpCode = url.searchParams.get("rsvpid")?.trim().toUpperCase();

  if (rsvpCode) {
    if (!/^[A-Z2-9]{10}$/.test(rsvpCode)) return json({ error: "Código de inscripción no válido." }, 400);
    try {
      await ensureTables();
      const codeHash = await hashValue(rsvpCode);
      const result = await turso.execute({
        sql: "SELECT name, event_id, status FROM event_rsvps WHERE rsvp_code_hash = ? LIMIT 1",
        args: [codeHash],
      });
      if (result.rows.length === 0) return json({ error: "La inscripción no existe o ya ha sido cancelada." }, 404);
      return json({ ok: true, name: result.rows[0].name, eventId: result.rows[0].event_id, status: result.rows[0].status });
    } catch (error) {
      console.error("RSVP lookup error:", error);
      return json({ error: "No se pudo consultar la inscripción." }, 500);
    }
  }

  const eventId = url.searchParams.get("eventId")?.trim();
  if (!eventId) return json({ error: "Falta el evento." }, 400);

  try {
    await ensureTables();
    const result = await turso.execute({
      sql: "SELECT COUNT(*) AS count FROM event_rsvps WHERE event_id = ? AND status = 'confirmed'",
      args: [eventId],
    });
    return json({ count: Number(result.rows[0]?.count ?? 0) });
  } catch (error) {
    console.error("RSVP count error:", error);
    return json({ error: "No se pudo consultar el evento." }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const eventId = String(body.eventId ?? "").trim();
    const name = normalizeName(body.name);
    const email = normalizeEmail(body.email);
    const consent = body.consent === true;

    if (!eventId || !name || !email || !consent) return json({ error: "Nombre, email y consentimiento son obligatorios." }, 400);
    if (name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Revisa los datos introducidos." }, 400);

    await ensureTables();

    const event = await getEventDetails(eventId, request.url);
    if (!event) return json({ error: "El evento no existe." }, 404);

    const ipHash = await hashValue(getClientIp(request));
    if (await rateLimited("rsvp_rate_limits", ipHash)) {
      return json({ error: "Has realizado demasiados intentos. Espera unos minutos y vuelve a intentarlo." }, 429, { "Retry-After": String(RATE_WINDOW_MINUTES * 60) });
    }
    await registerRateAttempt("rsvp_rate_limits", ipHash);

    await turso.execute({
      sql: "DELETE FROM event_rsvps WHERE event_id = ? AND email = ? AND status = 'pending' AND expires_at <= CURRENT_TIMESTAMP",
      args: [eventId, email],
    });

    const existing = await turso.execute({
      sql: "SELECT id FROM event_rsvps WHERE event_id = ? AND email = ? LIMIT 1",
      args: [eventId, email],
    });
    if (existing.rows.length > 0) return json({ error: "Este email ya está apuntado a este evento." }, 409);

    const cancelCode = generateRsvpCode();
    const confirmCode = generateRsvpCode();
    const cancelHash = await hashValue(cancelCode);
    const confirmHash = await hashValue(confirmCode);
    const expiresAt = toSqlDate(new Date(event.eventEndDate.getTime() + 24 * 60 * 60 * 1000));

    await turso.execute({
      sql: "INSERT INTO event_rsvps (event_id, name, email, rsvp_code_hash, confirm_code_hash, status, expires_at) VALUES (?, ?, ?, ?, ?, 'pending', ?)",
      args: [eventId, name, email, cancelHash, confirmHash, expiresAt],
    });

    let emailSent = false;
    const resendApiKey = import.meta.env.RESEND_API_KEY;
    const resendFromEmail = import.meta.env.RESEND_FROM_EMAIL;

    if (resendApiKey && resendFromEmail) {
      try {
        const resend = new Resend(resendApiKey);
        const html = buildRsvpConfirmationEmail({
          name,
          eventTitle: event.eventTitle,
          eventDate: event.eventDate,
          eventTime: event.eventTime,
          eventPlace: event.eventPlace,
          eventUrl: event.eventUrl,
          calendarUrl: event.calendarUrl,
          confirmUrl: `${new URL("/rsvp/confirmar", event.eventUrl).toString()}?rsvpid=${confirmCode}`,
          cancelUrl: `${new URL("/rsvp/cancelar", event.eventUrl).toString()}?rsvpid=${cancelCode}`,
        });
        const { error } = await resend.emails.send(
          {
            from: resendFromEmail,
            to: [email],
            subject: `Confirma tu asistencia · ${event.eventTitle} · XauenDevs`,
            html,
          },
          { idempotencyKey: `rsvp-pending/${eventId}/${await hashValue(email + "\n" + confirmCode)}` },
        );
        if (error) console.error("RSVP confirmation email error:", error);
        else emailSent = true;
      } catch (error) {
        console.error("RSVP confirmation email error:", error);
      }
    }

    const result = await turso.execute({
      sql: "SELECT COUNT(*) AS count FROM event_rsvps WHERE event_id = ? AND status = 'confirmed'",
      args: [eventId],
    });

    return json({ ok: true, status: "pending", count: Number(result.rows[0]?.count ?? 0), emailSent }, 201);
  } catch (error) {
    console.error("RSVP error:", error);
    return json({ error: "No se pudo completar la inscripción." }, 500);
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const rsvpCode = String(body.rsvpid ?? "").trim().toUpperCase();
    if (!/^[A-Z2-9]{10}$/.test(rsvpCode)) return json({ error: "Código de inscripción no válido." }, 400);
    await ensureTables();

    const ipHash = await hashValue(getClientIp(request));
    if (await rateLimited("rsvp_cancel_rate_limits", ipHash)) {
      return json({ error: "Demasiados intentos. Espera unos minutos y vuelve a intentarlo." }, 429, { "Retry-After": String(RATE_WINDOW_MINUTES * 60) });
    }
    await registerRateAttempt("rsvp_cancel_rate_limits", ipHash);

    const codeHash = await hashValue(rsvpCode);
    const result = await turso.execute({ sql: "SELECT id FROM event_rsvps WHERE rsvp_code_hash = ? LIMIT 1", args: [codeHash] });
    if (result.rows.length === 0) return json({ error: "La inscripción no existe o ya ha sido cancelada." }, 404);

    await turso.execute({ sql: "DELETE FROM event_rsvps WHERE id = ?", args: [result.rows[0].id] });
    return json({ ok: true });
  } catch (error) {
    console.error("RSVP cancellation error:", error);
    return json({ error: "No se pudo cancelar la inscripción." }, 500);
  }
};
