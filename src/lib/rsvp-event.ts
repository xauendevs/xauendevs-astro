import { getPivosStrapi } from "@/lib/get-info-pivos";
import { slugify } from "@/lib/event-slug";

export const getEventDetails = async (eventId: string, requestUrl: string) => {
  const events = (await getPivosStrapi()) ?? [];
  const event = events.find((item) => slugify(item.title) === eventId);

  if (!event) return null;

  const eventStartDate = event.date;
  const eventEndDate = new Date(eventStartDate.getTime() + 60 * 60 * 1000);
  const eventDate = eventStartDate.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const eventTime = eventStartDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  });
  const eventEndTime = eventEndDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  });
  const eventUrl = new URL(`/eventos/${eventId}`, requestUrl).toString();
  const eventLocation = event.place || "Jaén, España";
  const calendarStart = eventStartDate.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const calendarEnd = eventEndDate.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${calendarStart}/${calendarEnd}&location=${encodeURIComponent(eventLocation)}&details=${encodeURIComponent(event.description || "")}`;

  return {
    eventTitle: event.title,
    eventDate,
    eventTime: `${eventTime}–${eventEndTime}`,
    eventPlace: eventLocation,
    eventUrl,
    calendarUrl: googleCalendarUrl,
    eventStart: calendarStart,
    eventEnd: calendarEnd,
    eventEndDate,
  };
};
