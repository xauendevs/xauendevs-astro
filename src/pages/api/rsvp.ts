import type { APIRoute } from "astro";
import { turso } from "@/lib/turso";
import { Resend } from "resend";
import { buildRsvpConfirmationEmail, buildRsvpIcs } from "@/lib/rsvp-email";
import { getPivosStrapi } from "@/lib/get-info-pivos";
import { slugify } from "@/lib/event-slug";

const RATE_LIMIT = 5;
const RATE_WINDOW_MINUTES = 10;
const RSVP_CODE_LENGTH = 10;
const RSVP_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const ensureTables = async () => {
  await turso.batch([
    {
      sql: `
        CREATE TABLE IF NOT EXISTS event_rsvps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          rsvp_code_hash TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(event_id, email)
        )
      `,
      args: [],
    },
    {
      sql: `
        CREATE TABLE IF NOT EXISTS rsvp_rate_limits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ip_hash TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `,
      args: [],
    },
    {
      sql: "CREATE TABLE IF NOT EXISTS rsvp_cancel_rate_limits (id INTEGER PRIMARY KEY AUTOINCREMENT, ip_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
      args: [],
    },
  ]);

  try {
    await turso.execute({ sql: "ALTER TABLE event_rsvps ADD COLUMN rsvp_code_hash TEXT", args: [] });
  } catch {}
  await turso.execute({ sql: "CREATE UNIQUE INDEX IF NOT EXISTS idx_event_rsvps_code_hash ON event_rsvps(rsvp_code_hash)", args: [] });
};

const normalizeEmail = (value: unknown) => {
  const email = String(value ?? "").trim().toLowerCase();
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) return email;

  if (domain === "gmail.com" || domain === "googlemail.com") {
    return localPart.split("+")[0].replace(/\./g, "") + "@gmail.com";
  }

  return email;
};

const normalizeName = (value: unknown) => String(value ?? "").trim().replace(/\s+/g, " ");

const getEventDetails = async (eventId: string, requestUrl: string) => {
  const events = (await getPivosStrapi()) ?? [];
  const event = events.find((item) => slugify(item.title) === eventId);

  if (!event) return null;

  const eventDate = event.date;
  const eventEnd =
    "endDate" in event && event.endDate
      ? event.endDate
      : new Date(eventDate.getTime() + 60 * 60 * 1000);

  const eventDateLabel = eventDate.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const eventTimeLabel = eventDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  });
  const eventStart = eventDate
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const eventEndValue = eventEnd
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const eventUrl = new URL(`/eventos/${eventId}`, requestUrl).toString();
  const calendarTitle = encodeURIComponent(event.title);
  const calendarDescription = encodeURIComponent(
    event.description || `Charla de XauenDevs: ${event.title}.`,
  );
  const calendarLocation = encodeURIComponent(event.place || "Jaén, España");
  const calendarUrl =
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calendarTitle}&dates=${eventStart}/${eventEndValue}&details=${calendarDescription}&location=${calendarLocation}`;

  return {
    eventTitle: event.title,
    eventDate: eventDateLabel,
    eventTime: eventTimeLabel,
    eventPlace: event.place || "Jaén",
    eventUrl,
    calendarUrl,
    eventStart,
    eventEnd: eventEndValue,
  };
};

const getClientIp = (request: Request) => {
  const trustedVercelIp = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (trustedVercelIp) return trustedVercelIp;

  const forwardedIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwardedIp) return forwardedIp;

  return request.headers.get("x-real-ip")?.trim() || "unknown";
};

const generateRsvpCode = () => {
  const bytes = new Uint8Array(RSVP_CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => RSVP_CODE_ALPHABET[byte % RSVP_CODE_ALPHABET.length]).join("");
};

const hashValue = async (value: string) => {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const isRateLimited = async (ipHash: string) => {
  const result = await turso.execute({
    sql: `
      SELECT COUNT(*) AS count
      FROM rsvp_rate_limits
      WHERE ip_hash = ?
        AND created_at >= datetime('now', ?)
    `,
    args: [ipHash, `-${RATE_WINDOW_MINUTES} minutes`],
  });

  return Number(result.rows[0]?.count ?? 0) >= RATE_LIMIT;
};

const registerRateAttempt = async (ipHash: string) => {
  await turso.execute({
    sql: "INSERT INTO rsvp_rate_limits (ip_hash) VALUES (?)",
    args: [ipHash],
  });

  await turso.execute({
    sql: "DELETE FROM rsvp_rate_limits WHERE created_at < datetime('now', '-1 day')",
  });
};

export const GET: APIRoute = async ({ url }) => {
  const rsvpCode = url.searchParams.get("rsvpid")?.trim().toUpperCase();

  if (rsvpCode) {
    if (!/^[A-Z2-9]{10}$/.test(rsvpCode)) {
      return new Response(JSON.stringify({ error: "Código de inscripción no válido." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    try {
      await ensureTables();
      const codeHash = await hashValue(rsvpCode);
      const result = await turso.execute({ sql: "SELECT name, event_id FROM event_rsvps WHERE rsvp_code_hash = ? LIMIT 1", args: [codeHash] });
      if (result.rows.length === 0) {
        return new Response(JSON.stringify({ error: "La inscripción no existe o ya ha sido cancelada." }), { status: 404, headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ ok: true, name: result.rows[0].name, eventId: result.rows[0].event_id }), { headers: { "Content-Type": "application/json" } });
    } catch (error) {
      console.error("RSVP lookup error:", error);
      return new Response(JSON.stringify({ error: "No se pudo consultar la inscripción." }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  }

  const eventId = url.searchParams.get("eventId")?.trim();

  if (!eventId) {
    return new Response(JSON.stringify({ error: "Falta el evento." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await ensureTables();
    const result = await turso.execute({
      sql: "SELECT COUNT(*) AS count FROM event_rsvps WHERE event_id = ?",
      args: [eventId],
    });

    return new Response(
      JSON.stringify({ count: Number(result.rows[0]?.count ?? 0) }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("RSVP count error:", error);
    return new Response(JSON.stringify({ error: "No se pudo consultar el evento." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const eventId = String(body.eventId ?? "").trim();
    const name = normalizeName(body.name);
    const email = normalizeEmail(body.email);
    const consent = body.consent === true;
    if (!eventId || !name || !email || !consent) {
      return new Response(JSON.stringify({ error: "Nombre, email y consentimiento son obligatorios." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Revisa los datos introducidos." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await ensureTables();

    const eventDetails = await getEventDetails(eventId, request.url);
    if (!eventDetails) {
      return new Response(JSON.stringify({ error: "El evento no existe o no está disponible." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const {
      eventTitle,
      eventDate,
      eventTime,
      eventPlace,
      eventUrl,
      calendarUrl,
      eventStart,
      eventEnd,
    } = eventDetails;

    const rsvpCode = generateRsvpCode();
    const rsvpCodeHash = await hashValue(rsvpCode);

    const ipHash = await hashValue(getClientIp(request));

    if (await isRateLimited(ipHash)) {
      return new Response(
        JSON.stringify({ error: "Has realizado demasiados intentos. Espera unos minutos y vuelve a intentarlo." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(RATE_WINDOW_MINUTES * 60),
          },
        },
      );
    }

    await registerRateAttempt(ipHash);

    const existing = await turso.execute({
      sql: "SELECT id FROM event_rsvps WHERE event_id = ? AND email = ? LIMIT 1",
      args: [eventId, email],
    });

    if (existing.rows.length > 0) {
      return new Response(JSON.stringify({ error: "Este email ya está apuntado a este evento." }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    await turso.execute({
      sql: "INSERT INTO event_rsvps (event_id, name, email, rsvp_code_hash) VALUES (?, ?, ?, ?)",
      args: [eventId, name, email, rsvpCodeHash],
    });

    let emailSent = false;
    const resendApiKey = import.meta.env.RESEND_API_KEY;
    const resendFromEmail = import.meta.env.RESEND_FROM_EMAIL;

    if (resendApiKey && resendFromEmail && eventTitle && eventDate && eventUrl) {
      try {
        const resend = new Resend(resendApiKey);
        const html = buildRsvpConfirmationEmail({
          name,
          eventTitle,
          eventDate,
          eventTime,
          eventPlace,
          eventUrl,
          calendarUrl,
          cancelUrl: `${new URL("/rsvp/cancelar", eventUrl).toString()}?rsvpid=${rsvpCode}`,
        });
        const icsContent =
          eventStart && eventEnd
            ? buildRsvpIcs({
                eventId,
                eventTitle,
                eventStart,
                eventEnd,
                eventPlace: eventPlace || "Jaén, España",
                eventUrl,
              })
            : "";
        const attachment = icsContent
          ? {
              filename: `${eventId}.ics`,
              content: Buffer.from(icsContent).toString("base64"),
            }
          : undefined;
        const idempotencyKey = `rsvp-confirmation/${eventId}/${await hashValue(
          email + "\n" + html + "\n" + icsContent,
        )}`;
        const { error } = await resend.emails.send(
          {
            from: resendFromEmail,
            to: [email],
            subject: `¡Plaza confirmada! ${eventTitle} · XauenDevs`,
            html,
            attachments: attachment ? [attachment] : undefined,
          },
          { idempotencyKey },
        );
        if (error) console.error("RSVP confirmation email error:", error);
        else emailSent = true;
      } catch (error) {
        console.error("RSVP confirmation email error:", error);
      }
    } else {
      console.warn("RSVP confirmation email skipped: missing Resend configuration or event details.");
    }

    const result = await turso.execute({
      sql: "SELECT COUNT(*) AS count FROM event_rsvps WHERE event_id = ?",
      args: [eventId],
    });

    return new Response(
      JSON.stringify({ ok: true, count: Number(result.rows[0]?.count ?? 0), emailSent }),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("RSVP error:", error);
    return new Response(JSON.stringify({ error: "No se pudo completar la inscripción." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};


export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const rsvpCode = String(body.rsvpid ?? "").trim().toUpperCase();
    if (!/^[A-Z2-9]{10}$/.test(rsvpCode)) return new Response(JSON.stringify({ error: "Código de inscripción no válido." }), { status: 400, headers: { "Content-Type": "application/json" } });
    await ensureTables();
    const ipHash = await hashValue(getClientIp(request));
    const attempts = await turso.execute({ sql: "SELECT COUNT(*) AS count FROM rsvp_cancel_rate_limits WHERE ip_hash = ? AND created_at >= datetime('now', ?)", args: [ipHash, `-${RATE_WINDOW_MINUTES} minutes`] });
    if (Number(attempts.rows[0]?.count ?? 0) >= RATE_LIMIT) return new Response(JSON.stringify({ error: "Demasiados intentos. Espera unos minutos y vuelve a intentarlo." }), { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(RATE_WINDOW_MINUTES * 60) } });
    await turso.execute({ sql: "INSERT INTO rsvp_cancel_rate_limits (ip_hash) VALUES (?)", args: [ipHash] });
    const codeHash = await hashValue(rsvpCode);
    const result = await turso.execute({ sql: "SELECT id FROM event_rsvps WHERE rsvp_code_hash = ? LIMIT 1", args: [codeHash] });
    if (result.rows.length === 0) return new Response(JSON.stringify({ error: "La inscripción no existe o ya ha sido cancelada." }), { status: 404, headers: { "Content-Type": "application/json" } });
    await turso.execute({ sql: "DELETE FROM event_rsvps WHERE id = ?", args: [result.rows[0].id] });
    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("RSVP cancellation error:", error);
    return new Response(JSON.stringify({ error: "No se pudo cancelar la inscripción." }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
