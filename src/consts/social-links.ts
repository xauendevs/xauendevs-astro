export interface SocialLink {
  name: string;
  /** `null` = todavía no tenemos la URL oficial; no se renderiza hasta rellenarla. */
  href: string | null;
}

export const DISCORD_URL = "https://discord.gg/CC9e6dtqxQ";

export const SOCIAL_LINKS: SocialLink[] = [
  { name: "Discord", href: DISCORD_URL },
  { name: "X", href: "https://x.com/xauendevs" },
  { name: "GitHub", href: "https://github.com/xauendevs" },
  // TODO: rellenar con las URLs oficiales (salen en el mockup de diseño).
  { name: "YouTube", href: null },
  { name: "Instagram", href: "https://www.instagram.com/xauendevs" },
  { name: "LinkedIn", href: null },
];
