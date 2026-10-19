import type { APIRoute } from "astro";
import { turso } from "@/lib/turso";
import { getPivosStrapi } from "@/lib/get-info-pivos";
import { slugify } from "@/lib/event-slug";
import { hashValue } from "../rsvp";
import { Resend } from "resend";

const CODE_LENGTH = 10;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const WINDOW_DAYS = 5;

const generateCode = () => {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/\x27/g, "&#039;");

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export const GET: APIRoute = async ({ request }) => {
  const secret = import.meta.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return json({ error: "No autorizado." }, 401);
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  const fromEmail = import.meta.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    console.error("RSVP reminder cron: faltan RESEND_API_KEY o RESEND_FROM_EMAIL.");
    return json({ error: "Configuración de correo incompleta." }, 500);
  }

  try {
    await turso.batch([
      {
        sql: `CREATE TABLE IF NOT EXISTS event_rsvps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          rsvp_code_hash TEXT,
          confirm_code_hash TEXT,
          reminder_code_hash TEXT,
          reminder_sent_at TEXT,
          status TEXT NOT NULL DEFAULT 'confirmed',
          expires_at TEXT,
          confirmed_at TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(event_id, email)
        )`,
        args: [],
      },
    ]);

    for (const statement of [
      "ALTER TABLE event_rsvps ADD COLUMN reminder_code_hash TEXT",
      "ALTER TABLE event_rsvps ADD COLUMN reminder_sent_at TEXT",
    ]) {
      try {
        await turso.execute({ sql: statement, args: [] });
      } catch {
        // SQLite reports an error if the column already exists.
      }
    }

    const now = new Date();
    const windowEnd = new Date(now.getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const pivos = (await getPivosStrapi()) ?? [];
    const upcoming = pivos
      .filter((pivo) => pivo.date instanceof Date && !Number.isNaN(pivo.date.getTime()))
      .filter((pivo) => pivo.date.getTime() >= now.getTime() && pivo.date.getTime() <= windowEnd.getTime())
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (upcoming.length === 0) return json({ ok: true, message: "No hay Pivo en los próximos cinco días.", sent: 0 });

    const event = upcoming[0];
    const eventId = slugify(event.title);
    const eventStart = event.date;
    const eventDate = eventStart.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Madrid",
    });
    const eventTime = eventStart.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Madrid",
    });
    const eventPlace = event.place || "Jaén, España";
    const eventUrl = new URL(`/eventos/${eventId}`, import.meta.env.SITE || "https://xauendevs.io").toString();

    const pending = await turso.execute({
      sql: "SELECT id, name, email FROM event_rsvps WHERE event_id = ? AND status = 'pending' AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP) AND reminder_sent_at IS NULL",
      args: [eventId],
    });

    if (pending.rows.length === 0) {
      return json({ ok: true, event: event.title, message: "No hay reservas pendientes que recordar.", sent: 0 });
    }

    const resend = new Resend(apiKey);
    let sent = 0;
    const errors: string[] = [];

    for (const row of pending.rows) {
      const code = generateCode();
      const codeHash = await hashValue(code);
      await turso.execute({
        sql: "UPDATE event_rsvps SET reminder_code_hash = ? WHERE id = ? AND status = 'pending' AND reminder_sent_at IS NULL",
        args: [codeHash, row.id],
      });

      const safe = {
        name: escapeHtml(String(row.name)),
        title: escapeHtml(event.title),
        date: escapeHtml(eventDate),
        time: escapeHtml(eventTime),
        place: escapeHtml(eventPlace),
        eventUrl: escapeHtml(eventUrl),
        confirmUrl: escapeHtml(new URL(`/rsvp/confirmar?rsvpid=${code}`, import.meta.env.SITE || "https://xauendevs.io").toString()),
      };

      const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f3f1eb;color:#111;font-family:Arial,Helvetica,sans-serif"><div style="padding:32px 16px"><div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e2d9;border-radius:24px;overflow:hidden"><div style="height:8px;background:#f4d400"></div><div style="padding:32px"><div style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">XauenDevs · Pivo&Code</div><h1 style="font-size:30px;line-height:1.1;margin:28px 0 12px">¡No te olvides de confirmar tu plaza!</h1><p style="font-size:16px;line-height:1.6">Hola <strong>${safe.name}</strong>, tenemos tu inscripción pendiente para la próxima Pivo&Code.</p><div style="background:#f7f7f5;border-radius:18px;padding:22px;font-size:15px;line-height:1.8"><strong style="font-size:22px">${safe.title}</strong><br>📅 ${safe.date}<br>⏰ ${safe.time}<br>📍 ${safe.place}</div><p style="font-size:15px;line-height:1.6">Para asegurar tu plaza, confirma tu asistencia desde el botón:</p><div style="margin-top:24px"><a href="${safe.confirmUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:15px 22px;border-radius:999px;font-weight:800">Confirmar mi plaza →</a></div><p style="font-size:13px;line-height:1.6;color:#777;margin-top:28px">Si prefieres no recibir este recordatorio, puedes confirmar tu plaza en cualquier momento desde el botón. Una vez confirmada, no recibirás más recordatorios de confirmación para esta Pivo.</p><p style="font-size:13px;color:#777;margin-top:24px">¡Nos vemos pronto!<br>El equipo de XauenDevs</p></div></div></div></body></html>`;

      try {
        const { error } = await resend.emails.send(
          {
            from: fromEmail,
            to: [String(row.email)],
            subject: `Recuerda confirmar tu plaza · ${event.title} · XauenDevs`,
            html,
          },
          { idempotencyKey: `rsvp-reminder/${eventId}/${row.id}` },
        );
        if (error) {
          errors.push(String(row.email));
          console.error("RSVP reminder email error:", error);
          continue;
        }

        await turso.execute({
          sql: "UPDATE event_rsvps SET reminder_sent_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'pending'",
          args: [row.id],
        });
        sent += 1;
      } catch (error) {
        errors.push(String(row.email));
        console.error("RSVP reminder email error:", error);
      }
    }

    return json({ ok: errors.length === 0, event: event.title, sent, failed: errors.length });
  } catch (error) {
    console.error("RSVP reminder cron error:", error);
    return json({ error: "No se pudieron enviar los recordatorios." }, 500);
  }
};
