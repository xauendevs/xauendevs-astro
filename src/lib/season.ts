import { getSiteTheme, type SiteTheme } from "./site-theme";

const cache = new WeakMap<Request, Promise<SiteTheme>>();

/** Temporada de esta petición (se resuelve una sola vez por petición, aunque la pidan muchos componentes). */
export function getSeason(Astro: { request: Request }): Promise<SiteTheme> {
  let season = cache.get(Astro.request);
  if (!season) {
    season = getSiteTheme();
    cache.set(Astro.request, season);
  }
  return season;
}

export const isHalloweenSeason = async (Astro: { request: Request }) => (await getSeason(Astro)) === "halloween";
