export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  };

  return date
    .toLocaleDateString("es-ES", options)
    .replace(/^(\w+)\. (\d+)\/(\d+)$/, "$1. $2\\$3");
}

export function formatTime(date: Date): string {
  return `:${date.getHours().toString().padStart(2, "0")}.${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

export function formatDateTime(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hour = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year} * ${hour}:${minutes}`;
}
