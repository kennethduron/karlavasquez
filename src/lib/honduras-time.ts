export const HONDURAS_TIME_ZONE = "America/Tegucigalpa";

const hondurasTimeFormatter = new Intl.DateTimeFormat("es-HN", {
  timeZone: HONDURAS_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export function formatHondurasTime(date: Date): string {
  return hondurasTimeFormatter.format(date);
}
