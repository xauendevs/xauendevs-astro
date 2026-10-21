/**
 * Apariciones de XauenDevs en prensa. Basta con la URL: el titular, la entradilla, la imagen de cabecera
 * (og:image), el medio y la fecha se leen de la propia noticia (ver src/lib/press.ts).
 *
 * Cualquier campo que pongas aquí manda sobre lo que diga la noticia. Úsalo cuando el medio no publique
 * bien sus metadatos o quieras otro titular:
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

export const PRESS: PressEntry[] = [];
