import type { APIRoute } from "astro";
import { Resend } from "resend";
import { turso } from "@/lib/turso";
import { getPivosStrapi } from "@/lib/get-info-pivos";
import { slugify } from "@/lib/event-slug";
import { hashValue } from "../rsvp";

const CODE_LENGTH = 10;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const WINDOW_DAYS = 5;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

const generateCode = () => {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const normalizeEmail = (email: string) => {
  const normalized = email.trim().toLowerCase();
  const separator = normalized.lastIndexOf("@");
  if (separator < 0) return normalized;

  let local = normalized.slice(0, separator);
  let domain = normalized.slice(separator + 1);

  // Gmail ignora los puntos y los sufijos +tag en direcciones @gmail.com/@googlemail.com.
  if (domain === "gmail.com" || domain === "googlemail.com") {
    local = local.split("+", 1)[0].replace(/\\./g, "");
    domain = "gmail.com";
  }

  return `${local}@${domain}`;
};

export const GET: APIRoute = async ({ url }) => {
  const expectedToken = import.meta.env.RSVP_EMAIL_TEST_TOKEN;
  const providedToken = url.searchParams.get("token");

  if (!expectedToken || !providedToken || providedToken !== expectedToken) {
    return json({ error: "No autorizado." }, 401);
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  const fromEmail = import.meta.env.RESEND_FROM_EMAIL;
  const testEmail = import.meta.env.RSVP_EMAIL_TEST_TO?.trim().toLowerCase();

  if (!apiKey || !fromEmail || !testEmail) {
    console.error("RSVP email test: faltan variables de entorno requeridas.");
    return json(
      { error: "Configuración incompleta. Revisa RESEND_API_KEY, RESEND_FROM_EMAIL y RSVP_EMAIL_TEST_TO." },
      500,
    );
  }

  try {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const pivos = (await getPivosStrapi()) ?? [];
    const upcoming = pivos
      .filter((pivo) => pivo.date instanceof Date && !Number.isNaN(pivo.date.getTime()))
      .filter((pivo) => pivo.date.getTime() >= now.getTime() && pivo.date.getTime() <= windowEnd.getTime())
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (upcoming.length === 0) {
      return json({ error: "No hay ninguna Pivo programada en los próximos cinco días." }, 404);
    }

    const event = upcoming[0];
    const eventId = slugify(event.title);

    // Solo permite probar con una inscripción pendiente del propio destinatario de pruebas.
    const pending = await turso.execute({
      sql: "SELECT id, name, email FROM event_rsvps WHERE event_id = ? AND status = 'pending' AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)",
      args: [eventId],
    });
    const matchingRow = pending.rows.find(
      (candidate) => normalizeEmail(String(candidate.email)) === normalizeEmail(testEmail),
    );

    if (!matchingRow) {
      return json(
        {
          error: "No hay una inscripción pendiente para RSVP_EMAIL_TEST_TO en la próxima Pivo. Apunta ese correo a la Pivo y vuelve a probar.",
          event: event.title,
        },
        409,
      );
    }

    const row = matchingRow;
    const code = generateCode();
    const codeHash = await hashValue(code);
    await turso.execute({
      sql: "UPDATE event_rsvps SET reminder_code_hash = ? WHERE id = ? AND status = 'pending'",
      args: [codeHash, row.id],
    });

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
    const siteUrl = import.meta.env.SITE || "https://xauendevs.io";
    const eventUrl = new URL(`/eventos/${eventId}`, siteUrl).toString();
    const confirmUrl = new URL(`/rsvp/confirmar?rsvpid=${code}`, siteUrl).toString();

    const safe = {
      name: escapeHtml(String(row.name)),
      title: escapeHtml(event.title),
      date: escapeHtml(eventDate),
      time: escapeHtml(eventTime),
      place: escapeHtml(eventPlace),
      eventUrl: escapeHtml(eventUrl),
      confirmUrl: escapeHtml(confirmUrl),
    };

    // Mantener este HTML y el asunto idénticos a los del cron de recordatorios.
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f3f1eb;color:#111;font-family:Arial,Helvetica,sans-serif"><div style="padding:32px 16px"><div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e2d9;border-radius:24px;overflow:hidden"><div style="height:8px;background:#f4d400"></div><div style="padding:32px"><div style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">XauenDevs · Pivo&amp;Code</div><h1 style="font-size:30px;line-height:1.1;margin:28px 0 12px">¡No te olvides de confirmar tu plaza!</h1><p style="font-size:16px;line-height:1.6">Hola <strong>${safe.name}</strong>, tenemos tu inscripción pendiente para la próxima Pivo&amp;Code.</p><div style="background:#f7f7f5;border-radius:18px;padding:22px;font-size:15px;line-height:1.8"><strong style="font-size:22px">${safe.title}</strong><br>📅 ${safe.date}<br>⏰ ${safe.time}<br>📍 ${safe.place}</div><p style="font-size:15px;line-height:1.6">Para asegurar tu plaza, confirma tu asistencia desde el botón:</p><div style="margin-top:24px"><a href="${safe.confirmUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:15px 22px;border-radius:999px;font-weight:800">Confirmar mi plaza →</a></div><p style="font-size:13px;line-height:1.6;color:#777;margin-top:28px">Si prefieres no recibir este recordatorio, puedes confirmar tu plaza en cualquier momento desde el botón. Una vez confirmada, no recibirás más recordatorios de confirmación para esta Pivo.</p><p style="font-size:13px;color:#777;margin-top:24px">¡Nos vemos pronto!<br>El equipo de XauenDevs</p></div></div></div></body></html>`;

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send(
      {
        from: fromEmail,
        to: [testEmail],
        subject: `Recuerda confirmar tu plaza · ${event.title} · XauenDevs`,
        html,
      },
      { idempotencyKey: `rsvp-reminder-test/${eventId}/${row.id}/${Date.now()}` },
    );

    if (error) {
      console.error("RSVP email test: Resend ha rechazado el envío.");
      return json({ error: "Resend no ha podido enviar el recordatorio." }, 502);
    }

    return json({
      ok: true,
      message: "Recordatorio real enviado al correo de prueba.",
      event: event.title,
      to: testEmail,
      id: data?.id,
      note: "No se ha marcado reminder_sent_at; el cron podrá enviar el recordatorio habitual.",
    });
  } catch (error) {
    console.error("RSVP email test: error inesperado.", error);
    return json({ error: "No se pudo enviar el recordatorio de prueba." }, 500);
  }
};
