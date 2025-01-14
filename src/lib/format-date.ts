import { format } from "@formkit/tempo";

export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  };

  return new Date(date)
    .toLocaleDateString("es-ES", options)
    .replace(/^(\w+)\. (\d+)\/(\d+)$/, "$1. $2\\$3");
}

export function formatTime(date: Date): string {
  return `:${format({
    date,
    format: "HH.mm",
    tz: "Europe/Madrid",
  })}`;
}

export function formatDateTime(date: Date): string {
  return format({
    date,
    format: "DD/MM/YYYY * HH:mm",
    tz: "Europe/Madrid",
  });
}
