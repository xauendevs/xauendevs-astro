import type { APIRoute } from "astro";
import { Resend } from "resend";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const GET: APIRoute = async ({ url }) => {
  const expectedToken = import.meta.env.RSVP_EMAIL_TEST_TOKEN;
  const providedToken = url.searchParams.get("token");

  if (!expectedToken || !providedToken || providedToken !== expectedToken) {
    return json({ error: "No autorizado." }, 401);
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  const fromEmail = import.meta.env.RESEND_FROM_EMAIL;
  const toEmail = import.meta.env.RSVP_EMAIL_TEST_TO;

  if (!apiKey || !fromEmail || !toEmail) {
    console.error("RSVP email test: faltan variables de entorno requeridas.");
    return json(
      {
        error:
          "Configuración incompleta. Revisa RESEND_API_KEY, RESEND_FROM_EMAIL y RSVP_EMAIL_TEST_TO.",
      },
      500,
    );
  }

  const safeTo = escapeHtml(toEmail);
  const html = `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f3f1eb;color:#111;font-family:Arial,Helvetica,sans-serif">
  <div style="padding:32px 16px">
    <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e2d9;border-radius:24px;overflow:hidden">
      <div style="height:8px;background:#f4d400"></div>
      <div style="padding:32px">
        <div style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">XauenDevs · Pivo&amp;Code</div>
        <h1 style="font-size:30px;line-height:1.1;margin:28px 0 12px">Correo de prueba de recordatorio</h1>
        <p style="font-size:16px;line-height:1.6">¡Buenas! Este es un correo de prueba para comprobar que el envío de recordatorios de Pivo&amp;Code funciona correctamente.</p>
        <div style="background:#f7f7f5;border-radius:18px;padding:22px;font-size:15px;line-height:1.8">
          <strong style="font-size:22px">Pivo&amp;Code de prueba</strong><br>
          📅 Fecha de ejemplo<br>
          ⏰ Hora de ejemplo<br>
          📍 Jaén, España
        </div>
        <p style="font-size:15px;line-height:1.6">Este correo no está asociado a ninguna inscripción y no confirma ni modifica ninguna plaza.</p>
        <p style="font-size:13px;color:#777;margin-top:24px">Correo de prueba enviado a ${safeTo}.<br>El equipo de XauenDevs</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: "Prueba de correo · Recordatorios Pivo&Code · XauenDevs",
      html,
    });

    if (error) {
      console.error("RSVP email test: Resend ha rechazado el envío.");
      return json({ error: "Resend no ha podido enviar el correo de prueba." }, 502);
    }

    return json({ ok: true, message: "Correo de prueba enviado.", id: data?.id });
  } catch (error) {
    console.error("RSVP email test: error inesperado.", error);
    return json({ error: "No se pudo enviar el correo de prueba." }, 500);
  }
};
