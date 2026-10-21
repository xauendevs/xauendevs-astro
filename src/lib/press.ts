import { PRESS, type PressEntry } from "@/data/press";

export interface PressItem {
  url: string;
  title: string;
  description?: string;
  image?: string;
  outlet: string;
  /** Logo o icono del medio, para el sello sobre la imagen. */
  logo?: string;
  date?: Date;
}

interface PageMeta {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  logo?: string;
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

type Json = Record<string, any>;

/** Artículos del JSON-LD de la página (NewsArticle, Article, BlogPosting…), también dentro de @graph. */
function jsonLdArticle(html: string): Json | undefined {
  const blocks = html.match(/<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  const nodes: Json[] = [];
  const collect = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === "object") {
      nodes.push(value as Json);
      if ((value as Json)["@graph"]) collect((value as Json)["@graph"]);
    }
  };
  for (const block of blocks) {
    try {
      collect(JSON.parse(block.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "")));
    } catch {
      // JSON-LD mal formado: se ignora y se sigue con lo demás.
    }
  }
  const isArticle = (node: Json) =>
    [node["@type"]].flat().some((type) => typeof type === "string" && /(News)?Article|BlogPosting|Report/i.test(type));
  return nodes.find(isArticle);
}

const ldImage = (image: unknown): string | undefined => {
  if (!image) return undefined;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) return ldImage(image[0]);
  return (image as Json).url ?? (image as Json).contentUrl;
};

const stripTags = (html: string) => decode(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " "));

/**
 * Lo que se puede sacar del propio cuerpo de la noticia cuando el medio no publica metadatos:
 * el primer <h1>, el primer párrafo con sustancia y la primera imagen grande, mejor dentro de <article>.
 */
function scrapeBody(html: string) {
  const article = html.match(/<article\b[\s\S]*?<\/article>/i)?.[0] ?? html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? html;
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const paragraph = (article.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi) ?? []).map(stripTags).find((text) => text.length >= 80);
  const image = (article.match(/<img\b[^>]*>/gi) ?? [])
    .filter((tag) => !/\b(?:logo|avatar|icon|sprite|pixel|placeholder)\b/i.test(tag))
    .map((tag) => tag.match(/\b(?:data-src|data-lazy-src|src)\s*=\s*["']([^"']+)["']/i)?.[1])
    .find((src) => src && !src.startsWith("data:") && !/\.svg(\?|$)/i.test(src));
  return {
    title: h1 ? stripTags(h1) : undefined,
    description: paragraph && paragraph.length > 220 ? `${paragraph.slice(0, 217).replace(/\s+\S*$/, "")}…` : paragraph,
    image,
  };
}

/**
 * El HTML con la codificación correcta: algunos medios aún sirven ISO-8859-1 / Windows-1252 y
 * response.text() lo leería como UTF-8 (tildes rotas). Se mira la cabecera y, si no dice nada, el <meta charset>.
 */
async function readHtml(response: Response): Promise<string> {
  const bytes = new Uint8Array(await response.arrayBuffer()).slice(0, 2_000_000);
  const head = new TextDecoder("latin1").decode(bytes.slice(0, 4096));
  const charset =
    response.headers.get("content-type")?.match(/charset=([\w-]+)/i)?.[1] ??
    head.match(/<meta[^>]+charset\s*=\s*["']?([\w-]+)/i)?.[1] ??
    "utf-8";
  try {
    return new TextDecoder(charset.toLowerCase()).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/**
 * Fecha escrita en el texto de la noticia, para medios sin metadatos de fecha: «Publicado el 20 de octubre
 * de 2026» o «Publicado: 20/10/2026». Solo cuenta si va tras «publicado» o «fecha», para no coger la fecha
 * de hoy que muchos medios ponen en la cabecera.
 */
function textDate(html: string): string | undefined {
  const text = stripTags(html);
  const long = text.match(/(?:publicad[oa]|fecha)[^0-9]{0,30}(\d{1,2}) de ([a-záéíóú]+),? (?:de |del )?(20\d{2})/i);
  if (long) {
    const month = MONTHS.indexOf(long[2].toLowerCase().replace("setiembre", "septiembre"));
    if (month >= 0) return `${long[3]}-${String(month + 1).padStart(2, "0")}-${long[1].padStart(2, "0")}T12:00:00`;
  }
  const short = text.match(/(?:publicad[oa]|fecha)[^0-9]{0,30}(\d{1,2})[/.-](\d{1,2})[/.-](20\d{2})/i);
  if (short) return `${short[3]}-${short[2].padStart(2, "0")}-${short[1].padStart(2, "0")}T12:00:00`;
  return undefined;
}

/**
 * Logo del medio: el del JSON-LD (publisher.logo, suele ser el logotipo completo) y, si no, el icono más
 * grande que declare la página (apple-touch-icon antes que favicon). Último recurso: /favicon.ico.
 */
function siteLogo(html: string, ld: Json, base: string): string {
  // Algunos CMS dejan sin rellenar variables de plantilla en el href («$iterVelocityTools…»): se descartan.
  const usable = (href?: string) => (href && !/[\s${}<>]/.test(href) ? href : undefined);
  const publisherLogo = usable(ldImage(ld.publisher?.logo));
  if (publisherLogo) return new URL(publisherLogo, base).href;
  const icons = (html.match(/<link\b[^>]*>/gi) ?? [])
    .map((tag) => {
      const rel = tag.match(/\brel\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase() ?? "";
      const href = usable(decode(tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1] ?? ""));
      if (!href || !/(^|\s)(apple-touch-icon(-precomposed)?|icon|shortcut icon)(\s|$)/.test(rel)) return undefined;
      const size = Number(tag.match(/\bsizes\s*=\s*["'](\d+)x\d+/i)?.[1] ?? (rel.startsWith("apple") ? 180 : 32));
      return { href, size };
    })
    .filter((icon): icon is { href: string; size: number } => Boolean(icon))
    .sort((a, b) => b.size - a.size);
  return new URL(icons[0]?.href ?? "/favicon.ico", base).href;
}

/** Algunos medios ponen su dominio como og:site_name («www.diariojaen.es»): se deja en «diariojaen.es». */
// Y otros añaden un lema («Hora Jaén - Medio de Comunicación…»): si es largo, se queda la primera parte.
const prettySiteName = (name?: string) => {
  if (!name) return name;
  if (/^[\w.-]+\.[a-z]{2,}$/i.test(name)) return name.replace(/^www\./, "");
  return name.length > 24 ? name.split(/\s+[|\-–—]\s+/)[0] : name;
};

/** Quita el nombre del medio cuando va pegado al titular: «Extra Jaén | Titular» o «Titular - Diario Jaén». */
function cleanTitle(title: string, siteName?: string): string {
  if (!siteName) return title;
  const site = siteName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const cleaned = title
    .replace(new RegExp(`^${site}\\s*[|\\-–—:·]\\s*`, "i"), "")
    .replace(new RegExp(`\\s*[|\\-–—:·]\\s*${site}$`, "i"), "")
    .trim();
  return cleaned || title;
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
        "Accept-Language": "es-ES,es;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
    });
    if (response.ok) {
      const html = await readHtml(response);
      const base = response.url || url;
      // Por orden de fiabilidad: Open Graph y Twitter, luego JSON-LD del artículo y, si no hay nada,
      // lo que se lea del propio cuerpo de la noticia.
      const ld = jsonLdArticle(html) ?? {};
      const body = scrapeBody(html);
      const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
      const image =
        metaContent(html, ["og:image", "og:image:url", "og:image:secure_url", "twitter:image", "twitter:image:src"]) ??
        ldImage(ld.image) ??
        html.match(/<link[^>]+rel\s*=\s*["']image_src["'][^>]*href\s*=\s*["']([^"']+)["']/i)?.[1] ??
        body.image;
      const siteName = prettySiteName(metaContent(html, ["og:site_name", "application-name"]) ?? ld.publisher?.name);
      const title =
        metaContent(html, ["og:title", "twitter:title"]) ??
        (typeof ld.headline === "string" ? decode(ld.headline) : undefined) ??
        body.title ??
        (titleTag ? decode(titleTag) : undefined);
      meta = {
        title: title && cleanTitle(title, siteName),
        description:
          metaContent(html, ["og:description", "twitter:description", "description"]) ??
          (typeof ld.description === "string" ? decode(ld.description) : undefined) ??
          body.description,
        image: image ? new URL(decode(image), base).href : undefined,
        siteName,
        logo: siteLogo(html, ld, base),
        published:
          metaContent(html, ["article:published_time", "og:published_time", "datepublished", "date", "dc.date"]) ??
          ld.datePublished ??
          html.match(/<time\b[^>]*datetime\s*=\s*["']([^"']+)["']/i)?.[1] ??
          textDate(html) ??
          // Último recurso: una fecha en el propio titular («Noticias 2 Jaén - 30/09/2026»).
          title?.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/)?.slice(1).reverse().map((n) => n.padStart(2, "0")).join("-"),
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
    logo: entry.logo ?? meta.logo,
    date: parseDate(entry.date) ?? parseDate(meta.published),
  };
}

/** Todas las noticias, de la más reciente a la más antigua (las que no tienen fecha, al final). */
export async function getPress(limit?: number): Promise<PressItem[]> {
  const entries = PRESS.map((entry) => (typeof entry === "string" ? { url: entry } : entry));
  const items = await Promise.all(entries.map(toItem));
  items.sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));
  return limit ? items.slice(0, limit) : items;
}
