import type { APIRoute } from "astro";
import { turso } from "@/lib/turso";
import { Resend } from "resend";
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

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/\x27/g, "&#039;");

const sendAdminNotification = async ({
  name,
  email,
  eventTitle,
  eventDate,
  eventTime,
  eventPlace,
}: {
  name: string;
  email: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventPlace: string;
}) => {
  const resendApiKey = import.meta.env.RESEND_API_KEY;
  const resendFromEmail = import.meta.env.RESEND_FROM_EMAIL;
  const adminEmail = import.meta.env.RESEND_ADMIN_EMAIL;

  if (!resendApiKey || !resendFromEmail || !adminEmail) return;

  try {
    const resend = new Resend(resendApiKey);
    const safe = {
      name: escapeHtml(name),
      email: escapeHtml(email),
      eventTitle: escapeHtml(eventTitle),
      eventDate: escapeHtml(eventDate),
      eventTime: escapeHtml(eventTime),
      eventPlace: escapeHtml(eventPlace),
    };

    const { error } = await resend.emails.send(
      {
        from: resendFromEmail,
        to: [adminEmail],
        subject: `Nueva asistencia confirmada · ${eventTitle}`,
        html: `<!doctype html><html lang="es"><body style="margin:0;background:#f3f1eb;color:#111;font-family:Arial,Helvetica,sans-serif;"><div style="padding:32px 16px;"><div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e2d9;border-radius:24px;overflow:hidden;"><div style="height:8px;background:#f4d400"></div><div style="padding:32px"><div style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">XauenDevs · RSVP</div><h1 style="font-size:30px;line-height:1.1;margin:28px 0 12px">Nueva asistencia confirmada 🎉</h1><p style="font-size:16px;line-height:1.6;margin:0 0 24px"><strong>${safe.name}</strong> ha confirmado su asistencia.</p><div style="background:#f7f7f5;border-radius:18px;padding:22px;font-size:15px;line-height:1.8"><strong style="font-size:20px">${safe.eventTitle}</strong><br>📅 ${safe.eventDate}<br>⏰ ${safe.eventTime}<br>📍 ${safe.eventPlace}<br>✉️ ${safe.email}</div><p style="font-size:13px;color:#777;margin-top:28px">Notificación automática de XauenDevs.</p></div></div></div></body></html>`,
      },
      { idempotencyKey: `rsvp-admin-confirmed/${String(email)}/${String(eventTitle)}/${new Date().toISOString().slice(0, 16)}` },
    );

    if (error) console.error("RSVP admin notification error:", error);
  } catch (error) {
    console.error("RSVP admin notification error:", error);
  }
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

    const codeHash = await hashValue(code);
    const current = await turso.execute({
      sql: "SELECT name, email, event_id, status, expires_at FROM event_rsvps WHERE confirm_code_hash = ? LIMIT 1",
      args: [codeHash],
    });

    if (current.rows.length === 0) return json({ error: "La confirmación no existe o ya ha sido utilizada." }, 404);

    const row = current.rows[0];
    if (row.status !== "pending") return json({ error: "Esta inscripción ya no está pendiente de confirmación." }, 409);

    if (!row.expires_at || new Date(String(row.expires_at).replace(" ", "T") + "Z").getTime() <= Date.now()) {
      await turso.execute({ sql: "DELETE FROM event_rsvps WHERE confirm_code_hash = ?", args: [codeHash] });
      return json({ error: "El plazo para confirmar esta inscripción ha caducado." }, 410);
    }

    const updated = await turso.execute({
      sql: "UPDATE event_rsvps SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP, confirm_code_hash = NULL WHERE confirm_code_hash = ? AND status = 'pending' AND expires_at > CURRENT_TIMESTAMP",
      args: [codeHash],
    });

    if (Number(updated.rowsAffected ?? 0) !== 1) return json({ error: "La confirmación ya no está disponible." }, 409);

    const event = await getEventDetails(String(row.event_id), request.url);
    if (!event) return json({ ok: true, name: row.name, eventId: row.event_id, status: "confirmed" });

    await sendAdminNotification({
      name: String(row.name),
      email: String(row.email),
      eventTitle: event.eventTitle,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      eventPlace: event.eventPlace,
    });

    return json({
      ok: true,
      name: row.name,
      eventId: row.event_id,
      status: "confirmed",
      ...event,
    });
  } catch (error) {
    console.error("RSVP confirmation error:", error);
    return json({ error: "No se pudo confirmar la inscripción." }, 500);
  }
};
