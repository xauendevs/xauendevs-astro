/**
 * Apariciones de XauenDevs en prensa. Basta con pegar la URL: el titular, la entradilla, la imagen de
 * cabecera, el medio y la fecha se sacan de la propia noticia (ver src/lib/press.ts).
 *
 *   "https://extrajaen.com/jaen/...",
 *
 * Si quieres cambiar algo, pon un objeto: cualquier campo que escribas manda sobre lo que saque la web.
 *
 *   { url: "https://www.diariojaen.es/...", date: "2026-10-01" },
 *   { url: "https://...", title: "Titular a mano", image: "/img/prensa/foto.webp", outlet: "Radio Jaén" },
 */
export interface PressEntry {
  url: string;
  /** AAAA-MM-DD. Si falta, se usa la fecha de publicación de la noticia. */
  date?: string;
  title?: string;
  description?: string;
  image?: string;
  outlet?: string;
}

export const PRESS: Array<string | PressEntry> = [

];
