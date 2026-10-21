import { getSiteTheme, type SiteTheme } from "./site-theme";

/** Temporada con diseño propio. Sin temporada (`undefined`) la web se ve como siempre. */
export type Season = Exclude<SiteTheme, "default">;

const cache = new WeakMap<Request, Promise<Season | undefined>>();

/** Temporada de esta petición (se resuelve una sola vez por petición, aunque la pidan muchos componentes). */
export function getSeason(Astro: { request: Request }): Promise<Season | undefined> {
  let season = cache.get(Astro.request);
  if (!season) {
    season = getSiteTheme().then((theme) => (theme === "default" ? undefined : theme));
    cache.set(Astro.request, season);
  }
  return season;
}

/** Detalles de contenido que no se pueden expresar con CSS (rutas de imagen, emojis y textos). */
export const SEASON_CONTENT = {
  halloween: {
    community: "/img/community-halloween.webp",
    pill: "💀",
    cta: "🎃",
    notFound: "Esta página se la ha llevado un fantasma.",
  },
  navidad: {
    community: "/img/community-navidad.webp",
    pill: "🎁",
    cta: "🎄",
    notFound: "Esta página se ha ido de vacaciones de Navidad.",
  },
} as const satisfies Record<Season, { community: string; pill: string; cta: string; notFound: string }>;

/** Icono de pestaña de la temporada: su emoji dentro de un SVG, como data URI. */
export function seasonFavicon(season: Season): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${SEASON_CONTENT[season].cta}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
