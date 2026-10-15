export const ANONYMOUS_RUNNER = "Anonymous runner";
export const FALLBACK_NAME = "Runner";

export function assertPublicName(raw: string): string {
  const name = raw.trim();
  if (name.length < 2 || name.length > 30) {
    throw new Error("Name must be 2 to 30 characters.");
  }
  return name;
}

export function storedPublicName(name: string | undefined): string | null {
  const trimmed = name?.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed;
}

export function attendeeLabel(
  name: string | undefined,
  hideName: boolean | undefined,
): string {
  if (hideName) {
    return ANONYMOUS_RUNNER;
  }
  return storedPublicName(name) ?? FALLBACK_NAME;
}
