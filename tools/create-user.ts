// Crea un usuario (o le cambia la contraseña con --update) en la base de Turso.
// No hay registro público: esta es la única forma de dar de alta cuentas.
//
//   pnpm user:create --email ana@example.com --name "Ana" --role admin
//   pnpm user:create --email ana@example.com --update
//
// La contraseña se pide por teclado sin mostrarla (o se lee de stdin si no es un terminal).
import { parseArgs } from "node:util";
import { createInterface } from "node:readline";
import { createClient } from "@libsql/client";
import { MIN_PASSWORD_LENGTH, USERS_TABLE_SQL, hashPassword, normalizeUserEmail } from "../src/lib/password.ts";

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string" },
    role: { type: "string", default: "member" },
    update: { type: "boolean", default: false },
  },
});

const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

const email = normalizeUserEmail(values.email);
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("Falta --email o no es válido.");
if (values.role !== "admin" && values.role !== "member") fail("--role debe ser admin o member.");
if (!values.update && !values.name?.trim()) fail("Falta --name.");

const readPassword = (prompt: string) =>
  new Promise<string>((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
    if (process.stdin.isTTY) {
      // Oculta lo que se escribe: solo se muestra el texto de la pregunta.
      (rl as any)._writeToOutput = (text: string) => {
        if (text.includes(prompt)) process.stdout.write(prompt);
      };
    }
    rl.question(prompt, (answer) => {
      rl.close();
      if (process.stdin.isTTY) process.stdout.write("\n");
      resolve(answer);
    });
  });

const password = await readPassword("Contraseña: ");
if (password.length < MIN_PASSWORD_LENGTH) fail(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
if (process.stdin.isTTY && (await readPassword("Repite la contraseña: ")) !== password) fail("Las contraseñas no coinciden.");

if (!process.env.TURSO_DATABASE_URL) fail("Falta TURSO_DATABASE_URL (ejecuta con --env-file=.env).");
const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });
await db.execute(USERS_TABLE_SQL);

const passwordHash = await hashPassword(password);

if (values.update) {
  // Cambiar password_changed_at invalida todas las sesiones abiertas de ese usuario.
  const result = await db.execute({
    sql: "UPDATE users SET password_hash = ?, password_changed_at = strftime('%Y-%m-%d %H:%M:%f', 'now'), failed_attempts = 0, locked_until = NULL WHERE email = ?",
    args: [passwordHash, email],
  });
  if (result.rowsAffected === 0) fail(`No existe ningún usuario con el email ${email}.`);
  console.log(`Contraseña actualizada para ${email}. Sus sesiones abiertas se han cerrado.`);
} else {
  try {
    await db.execute({
      sql: "INSERT INTO users (email, name, password_hash, role, password_changed_at) VALUES (?, ?, ?, ?, strftime('%Y-%m-%d %H:%M:%f', 'now'))",
      args: [email, values.name!.trim(), passwordHash, values.role!],
    });
  } catch (error) {
    fail(String(error).includes("UNIQUE") ? `Ya existe un usuario con el email ${email}. Usa --update para cambiarle la contraseña.` : String(error));
  }
  console.log(`Usuario ${email} creado con rol ${values.role}.`);
}
