import type { Pivo } from "@/types/Pivo";

/** Números romanos, como en los carteles de las primeras Pivo&Code (I, II… XXXVII). */
export function toRoman(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "";
  const table: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let rest = Math.floor(value);
  let out = "";
  for (const [n, s] of table) {
    while (rest >= n) {
      out += s;
      rest -= n;
    }
  }
  return out;
}

/** Quita el prefijo de edición de los títulos de Strapi ("36ª PivoAndCode | …"). */
export function cleanPivoTitle(title: string): string {
  return title.replace(/^\s*\d+\s*[ªº]?\s*pivo\s*(and|&)\s*code\s*[|:·-]\s*/i, "").trim();
}

/** Número de edición escrito en el propio título, si lo hay. */
function editionFromTitle(title: string): number | undefined {
  const match = title.match(/^\s*(\d+)\s*[ªº]?\s*pivo/i);
  return match ? Number(match[1]) : undefined;
}

export interface Edition extends Pivo {
  /** Número de la edición (1 = la primera, marzo de 2018). */
  number: number;
  roman: string;
  shortTitle: string;
}

/**
 * Numera las Pivo&Code por orden de fecha. Si un título trae su número ("36ª PivoAndCode"),
 * ese número manda y las siguientes continúan a partir de él.
 */
export function numberEditions(pivos: Pivo[] = []): Edition[] {
  const sorted = [...pivos].sort((a, b) => a.date.getTime() - b.date.getTime());
  let counter = 0;
  return sorted.map((pivo) => {
    const fromTitle = editionFromTitle(pivo.title);
    counter = fromTitle && fromTitle > counter ? fromTitle : counter + 1;
    return { ...pivo, number: counter, roman: toRoman(counter), shortTitle: cleanPivoTitle(pivo.title) };
  });
}

const tz = "Europe/Madrid";

export function formatDay(date: Date, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("es-ES", { timeZone: tz, weekday: "short", day: "numeric", month: "short", ...options })
    .format(date)
    .replace(/\./g, "");
}

export function formatHour(date: Date) {
  return new Intl.DateTimeFormat("es-ES", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(date);
}

export function yearOf(date: Date) {
  return Number(new Intl.DateTimeFormat("es-ES", { timeZone: tz, year: "numeric" }).format(date));
}

/** Nombre corto del sitio: "Banco de España - Edf Moneo" → "Edificio Moneo". */
export function shortPlace(place?: string) {
  if (!place) return "Jaén";
  if (/moneo/i.test(place)) return "Edificio Moneo";
  return place.replace(/\s+coworking$/i, "").trim();
}
