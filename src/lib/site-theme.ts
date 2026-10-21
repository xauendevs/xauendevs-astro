/**
 * Tema estacional del sitio (Halloween, Navidad…), cambiable EN CALIENTE sin desplegar.
 *
 * Orden de resolución (gana el primero que exista y sea válido):
 *   1. Vercel Edge Config  → clave `site_theme`   (cambio instantáneo, sin redeploy)
 *   2. Variable de entorno → `SITE_THEME`         (requiere redeploy: Vercel solo la aplica a despliegues nuevos)
 *   3. `DEFAULT_THEME`
 *
 * Y la broma del hackeo (solo con tema "halloween"):
 *   Edge Config `hack_intro` (true/false) → env `SITE_HACK_INTRO` → activada.
 *
 * Añadir una temporada nueva: ver README → "Temas estacionales".
 */
import { get } from "@vercel/global-config";

export const THEMES = ["default", "halloween"] as const;
export type SiteTheme = (typeof THEMES)[number];

const DEFAULT_THEME: SiteTheme = "default";

const isTheme = (value: unknown): value is SiteTheme =>
  typeof value === "string" && (THEMES as readonly string[]).includes(value.trim().toLowerCase());

const normalize = (value: unknown) => String(value).trim().toLowerCase() as SiteTheme;

/** Lee Edge Config sin que un fallo o un retraso rompa la página. */
async function fromEdgeConfig<T>(key: string): Promise<T | undefined> {
  if (!import.meta.env.EDGE_CONFIG && !process.env.EDGE_CONFIG) return undefined;
  try {
    return await Promise.race([
      get<T>(key),
      new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 800)),
    ]);
  } catch {
    return undefined;
  }
}

export async function getSiteTheme(): Promise<SiteTheme> {
  const remote = await fromEdgeConfig<string>("site_theme");
  if (isTheme(remote)) return normalize(remote);

  const env = import.meta.env.SITE_THEME ?? process.env.SITE_THEME;
  if (isTheme(env)) return normalize(env);

  return DEFAULT_THEME;
}

export async function getHackIntroEnabled(): Promise<boolean> {
  const remote = await fromEdgeConfig<boolean | string>("hack_intro");
  const value = remote ?? import.meta.env.SITE_HACK_INTRO ?? process.env.SITE_HACK_INTRO;
  if (value === undefined || value === "") return true;
  return !["false", "0", "off", "no"].includes(String(value).toLowerCase());
}
