// Sube a Strapi las Pivo&Code antiguas que solo están en dump.sql (la base de la época Turso).
// Abre Edge con Playwright en el admin de Strapi: inicias sesión a mano y el script
// usa esa sesión para subir los carteles, crear las pivos enlazando los ponentes y publicarlas.
//
//   pnpm pivos:upload            # solo enseña lo que haría
//   pnpm pivos:upload --apply    # crea y publica
//
// Se salta las que ya existen en Strapi (mismo título), así que se puede relanzar sin duplicar.
import { parseArgs } from "node:util";
import { readFileSync, existsSync } from "node:fs";
import { basename } from "node:path";
import { createClient } from "@libsql/client";
import { chromium, type APIRequestContext } from "playwright";

const { values } = parseArgs({ options: { apply: { type: "boolean", default: false } } });

const host = process.env.STRAPI_HOST;
if (!host) throw new Error("Falta STRAPI_HOST (ejecuta con --env-file=.env).");

const normalize = (text: string) => text.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");

// Las fechas del dump son hora de Madrid sin zona: se pasan a un instante UTC.
const madridToISO = (local: string) => {
  const asUTC = new Date(`${local.replace(" ", "T")}Z`);
  const wall = new Date(asUTC.toLocaleString("en-US", { timeZone: "Europe/Madrid" }) + " UTC");
  return new Date(asUTC.getTime() - (wall.getTime() - asUTC.getTime())).toISOString();
};

const db = createClient({ url: ":memory:" });
await db.executeMultiple(readFileSync("dump.sql", "utf8"));
const { rows: oldPivos } = await db.execute(`
  SELECT p.id, p.title, p.image, p.description, p.date, p.location,
         group_concat(s.name, '|') AS speakers
  FROM Pivos p
  LEFT JOIN Pivos_Speakers ps ON ps.pivo_id = p.id
  LEFT JOIN Speakers s ON s.id = ps.speaker_id
  GROUP BY p.id ORDER BY p.id`);

// Edge del sistema: en Windows el Chromium que descarga Playwright puede no arrancar con ventana.
const context = await chromium.launchPersistentContext(".playwright/strapi-profile", { headless: false, channel: "msedge" });
const page = context.pages()[0] ?? (await context.newPage());
// Dónde guarda Strapi el JWT del admin cambia según la versión, así que se cogen los que manda
// el propio panel y se usa el primero que el servidor acepta (antes del login puede mandar uno caducado).
const candidates = new Set<string>();
page.on("request", (request) => {
  const header = request.headers().authorization ?? "";
  if (request.url().startsWith(host) && /^Bearer [\w-]+\.[\w-]+\.[\w-]+$/.test(header)) candidates.add(header.slice(7));
});
await page.goto(`${host}/admin`);
console.log("Inicia sesión en la ventana de Edge (tienes 5 minutos)...");

const isValid = async (candidate: string) =>
  (await context.request.get(`${host}/admin/users/me`, { headers: { Authorization: `Bearer ${candidate}` } })).ok();
const deadline = Date.now() + 5 * 60_000;
const checked = new Set<string>();
let token: string | undefined;
while (!token && Date.now() < deadline) {
  for (const candidate of candidates) {
    if (checked.has(candidate)) continue;
    checked.add(candidate);
    if (await isValid(candidate)) token = candidate;
  }
  if (!token) await page.waitForTimeout(1000);
}
if (!token) throw new Error("No has iniciado sesión a tiempo.");

const api: APIRequestContext = context.request;
const auth = { Authorization: `Bearer ${token}` };

const getJson = async (path: string) => {
  const res = await api.get(`${host}${path}`, { headers: auth });
  if (!res.ok()) throw new Error(`GET ${path} → ${res.status()} ${await res.text()}`);
  return res.json();
};
const send = async (method: "post" | "put", path: string, options: Record<string, unknown>) => {
  const res = await api[method](`${host}${path}`, { headers: auth, ...options });
  if (!res.ok()) throw new Error(`${method.toUpperCase()} ${path} → ${res.status()} ${await res.text()}`);
  return res.json();
};

const { data: contentTypes } = await getJson("/content-manager/content-types");
const uidOf = (pluralName: string) => {
  const type = contentTypes.find((ct: any) => ct.info?.pluralName === pluralName);
  if (!type) throw new Error(`No existe el tipo de contenido «${pluralName}».`);
  return type.uid as string;
};
const pivoUid = uidOf("pivos");
const speakerUid = uidOf("speakers");

const listAll = async (uid: string) =>
  (await getJson(`/content-manager/collection-types/${uid}?page=1&pageSize=500`)).results as any[];

const existingTitles = new Set((await listAll(pivoUid)).map((pivo) => normalize(pivo.title ?? "")));
const speakersByName = new Map((await listAll(speakerUid)).map((speaker) => [normalize(speaker.name ?? ""), speaker]));

const pending = oldPivos.filter((pivo) => !existingTitles.has(normalize(String(pivo.title))));
console.log(`${pending.length} pivos del dump no están en Strapi.${values.apply ? "" : " (simulación: añade --apply para subirlas)"}`);

for (const pivo of pending) {
  const names = pivo.speakers ? String(pivo.speakers).split("|") : [];
  const speakers = names.map((name) => {
    const speaker = speakersByName.get(normalize(name));
    if (!speaker) throw new Error(`El ponente «${name}» de «${pivo.title}» no existe en Strapi.`);
    return speaker;
  });
  const imagePath = `public/img/pivos/${pivo.image}`;
  const hasImage = Boolean(pivo.image) && existsSync(imagePath);

  console.log(`- ${String(pivo.date).slice(0, 10)} ${pivo.title} | ${names.join(", ") || "sin ponentes"} | ${hasImage ? imagePath : "sin cartel"}`);
  if (!values.apply) continue;

  let imageId: number | null = null;
  if (hasImage) {
    const [uploaded] = await send("post", "/upload", {
      multipart: { files: { name: basename(imagePath), mimeType: mimeOf(imagePath), buffer: readFileSync(imagePath) } },
    });
    imageId = uploaded.id;
  }

  const body = {
    title: pivo.title,
    description: pivo.description,
    date: madridToISO(String(pivo.date)),
    place: pivo.location,
    image: imageId,
    speakers: { connect: speakers.map(({ id, documentId }) => ({ id, documentId })) },
  };
  const { data: created } = await send("post", `/content-manager/collection-types/${pivoUid}`, { data: body });
  await send("post", `/content-manager/collection-types/${pivoUid}/${created.documentId}/actions/publish`, { data: body });
  console.log(`  ✓ publicada (${created.documentId})`);
}

await context.close();

function mimeOf(path: string) {
  const ext = path.split(".").pop()!.toLowerCase();
  return ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
}
