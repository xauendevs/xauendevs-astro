const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/\x27/g, "&#039;");

interface ConfirmationEmailProps {
  name: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventPlace: string;
  eventUrl: string;
  calendarUrl: string;
  cancelUrl: string;
  confirmUrl?: string;
}

export const buildRsvpConfirmationEmail = (props: ConfirmationEmailProps) => {
  const { name, eventTitle, eventDate, eventTime, eventPlace, eventUrl, calendarUrl, cancelUrl } = props;
  const safe = { name: escapeHtml(name), title: escapeHtml(eventTitle), date: escapeHtml(eventDate), time: escapeHtml(eventTime), place: escapeHtml(eventPlace), eventUrl: escapeHtml(eventUrl), calendarUrl: escapeHtml(calendarUrl), cancelUrl: escapeHtml(cancelUrl), confirmUrl: escapeHtml(props.confirmUrl ?? "") };
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f3f1eb;color:#111;font-family:Arial,Helvetica,sans-serif;"><div style="padding:32px 16px;"><div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e2d9;border-radius:24px;overflow:hidden;"><div style="height:8px;background:#f4d400"></div><div style="padding:32px"><div style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">XauenDevs</div><div style="margin-top:28px;background:#f4d400;border-radius:18px;padding:24px"><div style="font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">Pivo&Code</div><h1 style="margin:8px 0 0;font-size:32px;line-height:1.05">Confirma tu asistencia 👋</h1></div><p style="font-size:17px;line-height:1.6;margin:28px 0 8px">Hola <strong>${safe.name}</strong>,</p><p style="font-size:16px;line-height:1.6">Hemos recibido tu inscripción. <strong>Tu plaza está reservada temporalmente</strong>; confírmala desde el botón para completar la inscripción.</p><div style="background:#f7f7f5;border-radius:18px;padding:22px;margin-top:24px"><div style="font-size:24px;font-weight:800;line-height:1.15">${safe.title}</div><div style="margin-top:18px;font-size:15px;line-height:1.7">📅 <strong>${safe.date}</strong><br>⏰ ${safe.time}<br>📍 ${safe.place}</div></div><div style="margin-top:24px"><a href="${safe.confirmUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:15px 22px;border-radius:999px;font-weight:800">Confirmar mi asistencia →</a></div><div style="margin-top:18px"><a href="${safe.cancelUrl}" style="color:#111;font-weight:800;font-size:14px">Cancelar inscripción</a></div><p style="font-size:13px;line-height:1.6;color:#777;margin-top:28px">Si no confirmas, tu reserva se eliminará al día siguiente del evento.</p><div style="border-top:1px solid #e5e2d9;margin-top:32px;padding-top:20px;font-size:13px;color:#777">XauenDevs · Jaén</div></div></div></div></body></html>`;
};

const escapeIcs = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

const ICS_CRLF = String.fromCharCode(13, 10);

export const buildRsvpIcs = ({
  eventId,
  eventTitle,
  eventStart,
  eventEnd,
  eventPlace,
  eventUrl,
}: {
  eventId: string;
  eventTitle: string;
  eventStart: string;
  eventEnd: string;
  eventPlace: string;
  eventUrl: string;
}) => {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//XauenDevs//Pivo&Code//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:XauenDevs Pivo&Code",
    "BEGIN:VEVENT",
    `UID:rsvp-${eventId}@xauendevs.io`,
    `DTSTAMP:${now}`,
    "SEQUENCE:0",
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    `DTSTART:${eventStart}`,
    `DTEND:${eventEnd}`,
    `SUMMARY:${escapeIcs(eventTitle)}`,
    `DESCRIPTION:${escapeIcs(eventUrl)}`,
    `LOCATION:${escapeIcs(eventPlace)}`,
    `URL:${escapeIcs(eventUrl)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join(ICS_CRLF);
};


export const buildRsvpConfirmedEmail = ({
  name,
  eventTitle,
  eventDate,
  eventTime,
  eventPlace,
  eventUrl,
  calendarUrl,
}: {
  name: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventPlace: string;
  eventUrl: string;
  calendarUrl: string;
}) => {
  const safe = {
    name: escapeHtml(name),
    title: escapeHtml(eventTitle),
    date: escapeHtml(eventDate),
    time: escapeHtml(eventTime),
    place: escapeHtml(eventPlace),
    eventUrl: escapeHtml(eventUrl),
    calendarUrl: escapeHtml(calendarUrl),
  };

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f3f1eb;color:#111;font-family:Arial,Helvetica,sans-serif;"><div style="padding:32px 16px;"><div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e2d9;border-radius:24px;overflow:hidden;"><div style="height:8px;background:#f4d400"></div><div style="padding:32px"><div style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">XauenDevs</div><div style="margin-top:28px;background:#f4d400;border-radius:18px;padding:24px"><div style="font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">Pivo&Code</div><h1 style="margin:8px 0 0;font-size:32px;line-height:1.05">¡Asistencia confirmada! 🎉</h1></div><p style="font-size:17px;line-height:1.6;margin:28px 0 8px">Genial, <strong>${safe.name}</strong> 👋</p><p style="font-size:16px;line-height:1.6">Tu plaza para <strong>${safe.title}</strong> está confirmada. ¡Nos vemos allí!</p><div style="background:#f7f7f5;border-radius:18px;padding:22px;margin-top:24px"><div style="font-size:24px;font-weight:800;line-height:1.15">${safe.title}</div><div style="margin-top:18px;font-size:15px;line-height:1.7">📅 <strong>${safe.date}</strong><br>⏰ ${safe.time}<br>📍 ${safe.place}</div></div><div style="margin-top:24px"><a href="${safe.calendarUrl}" style="display:inline-block;background:#f4d400;color:#111;text-decoration:none;padding:15px 22px;border-radius:999px;font-weight:800">Añadir al calendario →</a></div><div style="margin-top:18px"><a href="${safe.eventUrl}" style="color:#111;font-weight:800;font-size:14px">Ver detalles del evento ↗</a></div><p style="font-size:13px;line-height:1.6;color:#777;margin-top:28px">Si finalmente no puedes venir, puedes cancelar tu inscripción desde el enlace del correo de confirmación que recibiste anteriormente.</p><div style="border-top:1px solid #e5e2d9;margin-top:32px;padding-top:20px;font-size:13px;color:#777">XauenDevs · Jaén</div></div></div></div></body></html>`;
};
