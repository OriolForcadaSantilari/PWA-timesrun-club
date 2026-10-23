export type WhoCanJoin = "open" | "women" | "men";
export type Gender = "woman" | "man" | "unspecified";

export const GENDER_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

export function formatDayMonthYear(timestamp: number): string {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export type Profile = {
  id: string;
  name: string;
  easyPaceMinPerKm: number;
  gender: Gender;
};

export function formatPace(minPerKm: number): string {
  const minutes = Math.floor(minPerKm);
  const seconds = Math.round((minPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function maskPaceInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length === 3) {
    return `${digits[0]}:${digits.slice(1)}`;
  }
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/** On blur: a bare minute like "5" becomes stopwatch "5:00". */
export function completePaceInput(raw: string): string {
  const masked = maskPaceInput(raw);
  if (/^\d{1,2}$/.test(masked)) {
    return `${Number(masked)}:00`;
  }
  const parsed = parsePace(masked);
  return parsed != null ? formatPace(parsed) : masked;
}

export function parsePace(value: string): number | null {
  const masked = maskPaceInput(value);
  const match = /^(\d{1,2}):([0-5]\d)$/.exec(masked);
  if (!match) {
    return null;
  }
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  return minutes + seconds / 60;
}

export function formatPaceBand(minPerKm: number, maxPerKm: number): string {
  return `Pace ${formatPace(minPerKm)}–${formatPace(maxPerKm)} /km`;
}

const ES_WEEKDAYS = [
  "DOMINGO",
  "LUNES",
  "MARTES",
  "MIÉRCOLES",
  "JUEVES",
  "VIERNES",
  "SÁBADO",
] as const;

const ES_MONTHS = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
] as const;

export function formatWhen(timestamp: number, locale: "en" | "es" = "en"): string {
  const date = new Date(timestamp);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .replace(/\s+/g, " ");
  if (locale === "es") {
    return `${ES_WEEKDAYS[date.getDay()]}, ${date.getDate()} ${ES_MONTHS[date.getMonth()]} ${time}`;
  }
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function whoLabel(who: WhoCanJoin): string {
  if (who === "women") {
    return "Women only";
  }
  if (who === "men") {
    return "Men only";
  }
  return "Open to all";
}

export function mapsSearchUrl(placeName: string, city: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${placeName}, ${city}`)}`;
}

export function formatWhenInput(timestamp: number): string {
  const date = new Date(timestamp);
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDatetimeLocal(timestamp: number): string {
  const date = new Date(timestamp);
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
