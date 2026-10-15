export const BARCELONA_CITY = "Barcelona";

/** Generous metro box so nearby pins (Prat, Badalona, Castelldefels edge) still count. */
export const BARCELONA_BOUNDS = {
  minLat: 41.26,
  maxLat: 41.52,
  minLng: 1.92,
  maxLng: 2.28,
} as const;

const CLOCK_DRIFT_MS = 5 * 60 * 1000;

export function isInBarcelona(lat: number, lng: number): boolean {
  return (
    lat >= BARCELONA_BOUNDS.minLat &&
    lat <= BARCELONA_BOUNDS.maxLat &&
    lng >= BARCELONA_BOUNDS.minLng &&
    lng <= BARCELONA_BOUNDS.maxLng
  );
}

export function assertBarcelonaPin(city: string, lat: number, lng: number): void {
  if (city.trim() !== BARCELONA_CITY) {
    throw new Error("Runs must be in Barcelona.");
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !isInBarcelona(lat, lng)) {
    throw new Error("The meeting pin must be in Barcelona.");
  }
}

export function assertStartsInFuture(startsAt: number, now: number): void {
  if (startsAt < now - CLOCK_DRIFT_MS) {
    throw new Error("The run must start in the future.");
  }
}

export function hasAlreadyStarted(startsAt: number, now: number): boolean {
  return startsAt <= now;
}

export function nominatimViewbox(): string {
  return `${BARCELONA_BOUNDS.minLng},${BARCELONA_BOUNDS.maxLat},${BARCELONA_BOUNDS.maxLng},${BARCELONA_BOUNDS.minLat}`;
}
