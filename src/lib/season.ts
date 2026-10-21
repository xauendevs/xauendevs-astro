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

/** Detalles de contenido que no se pueden expresar con CSS (rutas de imagen y emojis). */
export const SEASON_CONTENT = {
  halloween: { community: "/img/community-halloween.webp", pill: "💀", cta: "🎃" },
  navidad: { community: "/img/community-navidad.webp", pill: "🎁", cta: "🎄" },
} as const satisfies Record<Season, { community: string; pill: string; cta: string }>;
