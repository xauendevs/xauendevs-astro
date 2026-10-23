import type { APIRoute } from "astro";
import { clearSessionCookie, isSameOrigin } from "@/lib/auth";

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });
  clearSessionCookie(cookies);
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
};
