export function normalizeEmail(value: string): string {
  return value.trim().toLocaleLowerCase("en-US");
}

export function normalizePhone(value: string): string {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 8) return `+504${digits}`;
  if (digits.length === 11 && digits.startsWith("504")) return `+${digits}`;
  if (trimmed.startsWith("+") && digits.length >= 8 && digits.length <= 15) {
    return `+${digits}`;
  }

  return digits;
}

export function normalizeSearchName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("es-HN");
}

export function slugify(value: string): string {
  return normalizeSearchName(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
