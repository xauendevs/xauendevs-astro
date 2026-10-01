import type { APIRoute } from "astro";
import { turso } from "@/lib/turso";

const ensureTable = async () => {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS event_rsvps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(event_id, email)
    )
  `);
};

const normalizeEmail = (value: unknown) => String(value ?? "").trim().toLowerCase();
const normalizeName = (value: unknown) => String(value ?? "").trim().replace(/\s+/g, " ");

export const GET: APIRoute = async ({ url }) => {
  const eventId = url.searchParams.get("eventId")?.trim();

  if (!eventId) {
    return new Response(JSON.stringify({ error: "Falta el evento." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await ensureTable();
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

    await ensureTable();

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
