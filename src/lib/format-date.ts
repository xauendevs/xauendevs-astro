const TZ = "Europe/Madrid";

/** «vie 23 oct» */
export function formatDate(date: Date): string {
  return new Date(date)
    .toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", timeZone: TZ })
    .replace(/\./g, "")
    .replace(",", "");
}

/** «19:30» */
export function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
}

/** «vie 23 oct · 19:30» */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} · ${formatTime(date)}`;
}
