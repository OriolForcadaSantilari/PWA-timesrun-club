export type WhoCanJoin = "open" | "women" | "men";
export type Gender = "woman" | "man" | "unspecified";

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

export function formatWhen(timestamp: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
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
