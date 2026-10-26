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

/** Every run is in Barcelona, so server and browser must agree on its wall-clock time. */
export const RUN_TIME_ZONE = "Europe/Madrid";

const EN_WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function runDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "numeric",
    timeZone: RUN_TIME_ZONE,
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value ?? "";
  return {
    weekday: EN_WEEKDAYS.indexOf(part("weekday")),
    day: Number(part("day")),
    month: Number(part("month")) - 1,
  };
}

export function formatWhen(timestamp: number, locale: "en" | "es" = "en"): string {
  const date = new Date(timestamp);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: RUN_TIME_ZONE,
  })
    .format(date)
    .replace(/\s+/g, " ");
  if (locale === "es") {
    const { weekday, day, month } = runDateParts(date);
    return `${ES_WEEKDAYS[weekday]}, ${day} ${ES_MONTHS[month]} ${time}`;
  }
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: RUN_TIME_ZONE,
  })
    .format(date)
    .replace(/\s+/g, " ");
}

/** "Martes 27 oct 17:00", used in run page titles. */
export function formatRunTitleDate(timestamp: number): string {
  const formatted = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: RUN_TIME_ZONE,
  }).formatToParts(new Date(timestamp));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    formatted.find((entry) => entry.type === type)?.value ?? "";
  const weekday = part("weekday");
  const month = part("month").replace(/\.$/, "");
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${part("day")} ${month} ${part("hour")}:${part("minute")}`;
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
