import type { APIRoute } from "astro";
import { turso } from "@/lib/turso";
import { getEventDetails } from "@/lib/rsvp-event";
import { hashValue } from "../rsvp";

const RATE_LIMIT = 5;
const RATE_WINDOW_MINUTES = 10;
const CODE_REGEX = /^[A-Z2-9]{10}$/;

const json = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...extraHeaders } });

const getClientIp = (request: Request) =>
  request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  request.headers.get("x-real-ip")?.trim() ||
  "unknown";

const ensureRateTable = async () => {
  await turso.execute({
    sql: "CREATE TABLE IF NOT EXISTS rsvp_confirm_rate_limits (id INTEGER PRIMARY KEY AUTOINCREMENT, ip_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    args: [],
  });
};

const confirmFromCode = async (code: string, request: Request) => {
  const codeHash = await hashValue(code);
  const current = await turso.execute({
    sql: "SELECT name, email, event_id, status, expires_at FROM event_rsvps WHERE confirm_code_hash = ? LIMIT 1",
    args: [codeHash],
  });

  if (current.rows.length === 0) {
    return { response: json({ error: "La confirmación no existe o ya ha sido utilizada." }, 404) };
  }

  const row = current.rows[0];
  if (row.status !== "pending") {
    return { response: json({ error: "Esta inscripción ya no está pendiente de confirmación." }, 409) };
  }

  if (!row.expires_at || new Date(String(row.expires_at).replace(" ", "T") + "Z").getTime() <= Date.now()) {
    await turso.execute({ sql: "DELETE FROM event_rsvps WHERE confirm_code_hash = ?", args: [codeHash] });
    return { response: json({ error: "El plazo para confirmar esta inscripción ha caducado." }, 410) };
  }

  const updated = await turso.execute({
    sql: "UPDATE event_rsvps SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP, confirm_code_hash = NULL WHERE confirm_code_hash = ? AND status = 'pending' AND expires_at > CURRENT_TIMESTAMP",
    args: [codeHash],
  });

  if (Number(updated.rowsAffected ?? 0) !== 1) {
    return { response: json({ error: "La confirmación ya no está disponible." }, 409) };
  }

  const event = await getEventDetails(String(row.event_id), request.url);
  if (!event) {
    return { response: json({ ok: true, name: row.name, eventId: row.event_id, status: "confirmed" }) };
  }

  return {
    response: json({
      ok: true,
      name: row.name,
      eventId: row.event_id,
      status: "confirmed",
      ...event,
    }),
  };
};

export const GET: APIRoute = async ({ url, request }) => {
  const code = url.searchParams.get("rsvpid")?.trim().toUpperCase();
  if (!code || !CODE_REGEX.test(code)) return json({ error: "Código de confirmación no válido." }, 400);

  try {
    await ensureRateTable();

    const ipHash = await hashValue(getClientIp(request));
    const attempts = await turso.execute({
      sql: "SELECT COUNT(*) AS count FROM rsvp_confirm_rate_limits WHERE ip_hash = ? AND created_at >= datetime('now', ?)",
      args: [ipHash, `-${RATE_WINDOW_MINUTES} minutes`],
    });
    if (Number(attempts.rows[0]?.count ?? 0) >= RATE_LIMIT) {
      return json({ error: "Demasiados intentos. Espera unos minutos y vuelve a intentarlo." }, 429, {
        "Retry-After": String(RATE_WINDOW_MINUTES * 60),
      });
    }
    await turso.execute({ sql: "INSERT INTO rsvp_confirm_rate_limits (ip_hash) VALUES (?)", args: [ipHash] });
    await turso.execute({ sql: "DELETE FROM rsvp_confirm_rate_limits WHERE created_at < datetime('now', '-1 day')" });

    return (await confirmFromCode(code, request)).response;
  } catch (error) {
    console.error("RSVP confirmation error:", error);
    return json({ error: "No se pudo confirmar la inscripción." }, 500);
  }
};

// Kept for backwards compatibility with old links/forms. Confirmation is still immediate
// and never sends a follow-up email.
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const code = String(body.rsvpid ?? "").trim().toUpperCase();
    if (!CODE_REGEX.test(code)) return json({ error: "Código de confirmación no válido." }, 400);

    await ensureRateTable();
    const ipHash = await hashValue(getClientIp(request));
    const attempts = await turso.execute({
      sql: "SELECT COUNT(*) AS count FROM rsvp_confirm_rate_limits WHERE ip_hash = ? AND created_at >= datetime('now', ?)",
      args: [ipHash, `-${RATE_WINDOW_MINUTES} minutes`],
    });
    if (Number(attempts.rows[0]?.count ?? 0) >= RATE_LIMIT) {
      return json({ error: "Demasiados intentos. Espera unos minutos y vuelve a intentarlo." }, 429, {
        "Retry-After": String(RATE_WINDOW_MINUTES * 60),
      });
    }
    await turso.execute({ sql: "INSERT INTO rsvp_confirm_rate_limits (ip_hash) VALUES (?)", args: [ipHash] });
    await turso.execute({ sql: "DELETE FROM rsvp_confirm_rate_limits WHERE created_at < datetime('now', '-1 day')" });

    return (await confirmFromCode(code, request)).response;
  } catch (error) {
    console.error("RSVP confirmation POST error:", error);
    return json({ error: "No se pudo confirmar la inscripción." }, 500);
  }
};
