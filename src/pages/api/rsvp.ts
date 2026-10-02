import type { APIRoute } from "astro";
import { turso } from "@/lib/turso";

const RATE_LIMIT = 5;
const RATE_WINDOW_MINUTES = 10;

const ensureTables = async () => {
  await turso.batch([
    {
      sql: `
        CREATE TABLE IF NOT EXISTS event_rsvps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
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
  ]);
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

const getClientIp = (request: Request) => {
  const trustedVercelIp = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (trustedVercelIp) return trustedVercelIp;

  const forwardedIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwardedIp) return forwardedIp;

  return request.headers.get("x-real-ip")?.trim() || "unknown";
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
      sql: "INSERT INTO event_rsvps (event_id, name, email) VALUES (?, ?, ?)",
      args: [eventId, name, email],
    });

    const result = await turso.execute({
      sql: "SELECT COUNT(*) AS count FROM event_rsvps WHERE event_id = ?",
      args: [eventId],
    });

    return new Response(
      JSON.stringify({ ok: true, count: Number(result.rows[0]?.count ?? 0) }),
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
