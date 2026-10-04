import type { APIRoute } from "astro";
import { Resend } from "resend";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const normalize = (value: unknown) => String(value ?? "").trim().replace(/\s+/g, " ");
const isValidEmail = (value: string) => value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const title = normalize(body.title);
    const organizer = normalize(body.organizer);
    const email = normalize(body.email).toLowerCase();
    const date = normalize(body.date);
    const place = normalize(body.place);
    const url = String(body.url ?? "").trim();
    const description = String(body.description ?? "").trim();

    if (!title || !organizer || !email || !date || !place || !description) {
      return json({ error: "Completa todos los campos obligatorios." }, 400);
    }

    if (
      title.length > 200 ||
      organizer.length > 150 ||
      place.length > 200 ||
      description.length > 5000 ||
      !isValidEmail(email)
    ) {
      return json({ error: "Revisa los datos introducidos." }, 400);
    }

    if (url && (url.length > 500 || !/^https?:\/\//i.test(url))) {
      return json({ error: "La web del evento no es válida." }, 400);
    }

    const resendApiKey = import.meta.env.RESEND_API_KEY;
    const resendFromEmail = import.meta.env.RESEND_FROM_EMAIL;
    const proposalRecipient = "hola@xauendevs.io";

    if (!resendApiKey || !resendFromEmail) {
      console.error("Event proposal email configuration is missing.");
      return json({ error: "No se puede enviar la propuesta ahora mismo." }, 503);
    }

    const resend = new Resend(resendApiKey);
    const subject = "Nueva propuesta de evento · " + title;
    const text = [
      "Nueva propuesta para Jaén Tech Events",
      "",
      "Nombre del evento: " + title,
      "Organizador: " + organizer,
      "Email de contacto: " + email,
      "Fecha: " + date,
      "Lugar: " + place,
      "Web: " + (url || "No indicada"),
      "",
      "Descripción:",
      description,
    ].join("\n");

    const { error } = await resend.emails.send({
      from: resendFromEmail,
      to: [proposalRecipient],
      replyTo: email,
      subject,
      text,
    });

    if (error) {
      console.error("Event proposal email error:", error);
      return json({ error: "No se pudo enviar la propuesta. Inténtalo de nuevo." }, 502);
    }

    return json({ ok: true }, 201);
  } catch (error) {
    console.error("Event proposal error:", error);
    return json({ error: "No se pudo enviar la propuesta. Inténtalo de nuevo." }, 500);
  }
};
