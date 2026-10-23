import type { AstroCookies } from "astro";
import { turso } from "@/lib/turso";
import { USERS_TABLE_SQL, timingSafeEqual } from "@/lib/password";

type SessionUser = { id: number; name: string; role: "admin" | "member" };

const SESSION_HOURS = 8;
const MIN_SECRET_LENGTH = 32;

// En producción el prefijo __Host- obliga a Secure, Path=/ y sin Domain: nadie puede pisar la cookie desde un subdominio.
const SESSION_COOKIE = import.meta.env.PROD ? "__Host-xd_session" : "xd_session";

const encoder = new TextEncoder();
const base64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromBase64url = (value: string) => Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), (char) => char.charCodeAt(0));
const encodeJson = (value: unknown) => base64url(encoder.encode(JSON.stringify(value)));

// Sin JWT_SECRET (o con uno corto) no se emiten ni aceptan sesiones.
const getKey = async () => {
  const secret = import.meta.env.JWT_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) return null;
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
};

const sign = async (key: CryptoKey, data: string) => new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(data)));

export const ensureAuthTables = async () => {
  await turso.batch([
    { sql: USERS_TABLE_SQL, args: [] },
    {
      sql: "CREATE TABLE IF NOT EXISTS login_rate_limits (id INTEGER PRIMARY KEY AUTOINCREMENT, ip_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
      args: [],
    },
  ]);
};

// `pwc` ata el token a la contraseña: al cambiarla, las sesiones anteriores dejan de valer.
export const createSessionToken = async (user: { id: number; role: string; password_changed_at: string }) => {
  const key = await getKey();
  if (!key) return null;
  const now = Math.floor(Date.now() / 1000);
  const payload = { sub: user.id, role: user.role, pwc: user.password_changed_at, iat: now, exp: now + SESSION_HOURS * 3600 };
  const data = `${encodeJson({ alg: "HS256", typ: "JWT" })}.${encodeJson(payload)}`;
  return `${data}.${base64url(await sign(key, data))}`;
};

const verifySessionToken = async (token: string) => {
  const key = await getKey();
  const parts = token.split(".");
  if (!key || parts.length !== 3) return null;
  try {
    const [header, payload, signature] = parts;
    if (!timingSafeEqual(await sign(key, `${header}.${payload}`), fromBase64url(signature))) return null;
    // Solo HS256: nunca se acepta `alg: none` ni otro algoritmo que venga en el token.
    if (JSON.parse(new TextDecoder().decode(fromBase64url(header))).alg !== "HS256") return null;
    const claims = JSON.parse(new TextDecoder().decode(fromBase64url(payload)));
    if (typeof claims.sub !== "number" || typeof claims.exp !== "number" || claims.exp <= Date.now() / 1000) return null;
    return claims as { sub: number; pwc: string };
  } catch {
    return null;
  }
};

export const setSessionCookie = (cookies: AstroCookies, token: string) =>
  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });

export const clearSessionCookie = (cookies: AstroCookies) => cookies.delete(SESSION_COOKIE, { path: "/" });

// El usuario se vuelve a leer de la base en cada petición: borrarlo o cambiarle la contraseña o el rol surte efecto al momento.
export const getSessionUser = async (cookies: AstroCookies): Promise<SessionUser | null> => {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const claims = await verifySessionToken(token);
  if (!claims) return null;
  try {
    await ensureAuthTables();
    const result = await turso.execute({
      sql: "SELECT id, name, role, password_changed_at FROM users WHERE id = ? LIMIT 1",
      args: [claims.sub],
    });
    const row = result.rows[0];
    if (!row || String(row.password_changed_at) !== claims.pwc) return null;
    return { id: Number(row.id), name: String(row.name), role: row.role === "admin" ? "admin" : "member" };
  } catch (error) {
    console.error("Session lookup error:", error);
    return null;
  }
};
