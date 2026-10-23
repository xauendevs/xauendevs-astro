import type { APIRoute } from "astro";
import { clearSessionCookie } from "@/lib/auth";

export const POST: APIRoute = async ({ request, cookies, url }) => {
  if (request.headers.get("origin") !== url.origin) return new Response(null, { status: 403 });
  clearSessionCookie(cookies);
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
};
