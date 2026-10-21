import { PRESS, type PressEntry } from "@/data/press";

export interface PressItem {
  url: string;
  title: string;
  description?: string;
  image?: string;
  outlet: string;
  date?: Date;
}

interface PageMeta {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  published?: string;
}

// Caché en memoria por URL: una noticia no cambia, así que no hace falta leerla en cada visita.
// Un fallo se reintenta antes (el medio puede estar caído un rato).
const OK_TTL = 12 * 60 * 60 * 1000;
const FAIL_TTL = 10 * 60 * 1000;
const cache = new Map<string, { at: number; ttl: number; meta: PageMeta }>();

const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (value: string) =>
  value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (match, name) => entities[name.toLowerCase()] ?? match)
    .replace(/\s+/g, " ")
    .trim();

/** Valor de una etiqueta <meta> por property o name, con los atributos en cualquier orden. */
function metaContent(html: string, keys: string[]): string | undefined {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const key = tag.match(/\b(?:property|name|itemprop)\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();
    if (!key || !keys.includes(key)) continue;
    const content = tag.match(/\bcontent\s*=\s*"([^"]*)"/i)?.[1] ?? tag.match(/\bcontent\s*=\s*'([^']*)'/i)?.[1];
    if (content?.trim()) return decode(content);
  }
  return undefined;
}

async function readMeta(url: string): Promise<PageMeta> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.meta;

  let meta: PageMeta = {};
  let ttl = FAIL_TTL;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; XauenDevsBot/1.0; +https://xauendevs.io/prensa)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      // Solo hace falta el <head>: con los primeros 300 KB sobra.
      const html = (await response.text()).slice(0, 300_000);
      const image = metaContent(html, ["og:image", "og:image:url", "og:image:secure_url", "twitter:image", "twitter:image:src"]);
      const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
      meta = {
        title: metaContent(html, ["og:title", "twitter:title"]) ?? (titleTag ? decode(titleTag) : undefined),
        description: metaContent(html, ["og:description", "twitter:description", "description"]),
        image: image ? new URL(image, response.url || url).href : undefined,
        siteName: metaContent(html, ["og:site_name", "application-name"]),
        published: metaContent(html, ["article:published_time", "og:published_time", "datepublished", "date", "dc.date"]),
      };
      ttl = OK_TTL;
    }
  } catch {
    // Medio caído, lento o que bloquea bots: se pinta con lo que haya en src/data/press.ts.
  }
  cache.set(url, { at: Date.now(), ttl, meta });
  return meta;
}

const hostname = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const parseDate = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

async function toItem(entry: PressEntry): Promise<PressItem> {
  const meta = await readMeta(entry.url);
  return {
    url: entry.url,
    title: entry.title ?? meta.title ?? hostname(entry.url),
    description: entry.description ?? meta.description,
    image: entry.image ?? meta.image,
    outlet: entry.outlet ?? meta.siteName ?? hostname(entry.url),
    date: parseDate(entry.date) ?? parseDate(meta.published),
  };
}

/** Todas las noticias, de la más reciente a la más antigua (las que no tienen fecha, al final). */
export async function getPress(limit?: number): Promise<PressItem[]> {
  const items = await Promise.all(PRESS.map(toItem));
  items.sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));
  return limit ? items.slice(0, limit) : items;
}
