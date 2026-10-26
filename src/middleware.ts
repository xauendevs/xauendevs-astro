import { defineMiddleware } from "astro:middleware";
import { getMaintenanceEnabled } from "@/lib/site-theme";

const MAINTENANCE_PATH = "/mantenimiento";

/**
 * Modo mantenimiento (Global Config `maintenance: true`, ver src/lib/site-theme.ts): todas las páginas
 * responden con la de mantenimiento (503). Siguen funcionando la API (crons, RSVP), el panel interno
 * y los recursos estáticos.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const adminPath = import.meta.env.ADMIN_PATH;

  const exempt =
    pathname === MAINTENANCE_PATH ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_") ||
    /\.[a-z0-9]+$/i.test(pathname) ||
    (!!adminPath && pathname.replace(/\/$/, "") === `/${adminPath}`);

  if (exempt || !(await getMaintenanceEnabled())) return next();

  return context.rewrite(MAINTENANCE_PATH);
});
