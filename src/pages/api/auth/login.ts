import type { APIRoute } from "astro";
import { turso } from "@/lib/turso";
import { createSessionToken, ensureAuthTables, isSameOrigin, setSessionCookie } from "@/lib/auth";
import { DUMMY_HASH, normalizeUserEmail, verifyPassword } from "@/lib/password";
import { hashValue } from "../rsvp";

const IP_LIMIT = 10;
const IP_WINDOW_MINUTES = 15;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const json = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extraHeaders } });

// Siempre el mismo mensaje: no se distingue entre email inexistente, contraseña mala o cuenta bloqueada.
const invalid = () => json({ error: "Credenciales incorrectas. Si has fallado varias veces, espera unos minutos." }, 401);

const getClientIp = (request: Request) =>
  request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  request.headers.get("x-real-ip")?.trim() ||
  "unknown";

export const POST: APIRoute = async ({ request, cookies }) => {
  // Solo se aceptan envíos desde la propia web.
  if (!isSameOrigin(request)) return json({ error: "Origen no permitido." }, 403);

  try {
    const body = await request.json().catch(() => ({}));
    const email = normalizeUserEmail(body.email);
    const password = String(body.password ?? "");
    if (!email || !password || email.length > 254 || password.length > 256) return invalid();

    await ensureAuthTables();

    const ipHash = await hashValue(getClientIp(request));
    const attempts = await turso.execute({
      sql: "SELECT COUNT(*) AS count FROM login_rate_limits WHERE ip_hash = ? AND created_at >= datetime('now', ?)",
      args: [ipHash, `-${IP_WINDOW_MINUTES} minutes`],
    });
    if (Number(attempts.rows[0]?.count ?? 0) >= IP_LIMIT) {
      return json({ error: "Demasiados intentos. Espera unos minutos y vuelve a intentarlo." }, 429, { "Retry-After": String(IP_WINDOW_MINUTES * 60) });
    }
    await turso.execute({ sql: "INSERT INTO login_rate_limits (ip_hash) VALUES (?)", args: [ipHash] });
    await turso.execute({ sql: "DELETE FROM login_rate_limits WHERE created_at < datetime('now', '-1 day')" });

    const result = await turso.execute({
      sql: "SELECT id, role, password_hash, password_changed_at, locked_until > CURRENT_TIMESTAMP AS locked FROM users WHERE email = ? LIMIT 1",
      args: [email],
    });
    const user = result.rows[0];

    // La contraseña se comprueba siempre, exista o no el usuario, para que el tiempo de respuesta no lo delate.
    const valid = await verifyPassword(password, user ? String(user.password_hash) : DUMMY_HASH);
    if (!user) return invalid();
    if (Number(user.locked)) return invalid();

    if (!valid) {
      await turso.execute({
        sql: `UPDATE users SET
          locked_until = CASE WHEN failed_attempts + 1 >= ? THEN datetime('now', ?) ELSE locked_until END,
          failed_attempts = CASE WHEN failed_attempts + 1 >= ? THEN 0 ELSE failed_attempts + 1 END
        WHERE id = ?`,
        args: [MAX_FAILED_ATTEMPTS, `+${LOCK_MINUTES} minutes`, MAX_FAILED_ATTEMPTS, user.id],
      });
      return invalid();
    }

    await turso.execute({ sql: "UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?", args: [user.id] });

    const token = await createSessionToken({ id: Number(user.id), role: String(user.role), password_changed_at: String(user.password_changed_at) });
    if (!token) {
      console.error("Login: falta JWT_SECRET o es demasiado corto.");
      return json({ error: "El acceso no está disponible." }, 503);
    }
    setSessionCookie(cookies, token);
    return json({ ok: true });
  } catch (error) {
    console.error("Login error:", error);
    return json({ error: "No se pudo iniciar sesión." }, 500);
  }
};
