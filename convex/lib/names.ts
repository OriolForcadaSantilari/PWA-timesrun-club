import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export const ANONYMOUS_RUNNER = "Anonymous runner";
export const FALLBACK_NAME = "Runner";
export const NAME_TAKEN = "That name is already taken.";

export function assertPublicName(raw: string): string {
  const name = raw.trim();
  if (name.length < 2 || name.length > 30) {
    throw new Error("Name must be 2 to 30 characters.");
  }
  return name;
}

export async function assertNameAvailable(
  ctx: QueryCtx | MutationCtx,
  name: string,
  exceptUserId?: Id<"users">,
): Promise<void> {
  const wanted = name.trim().toLowerCase();
  const users = await ctx.db.query("users").collect();
  for (const user of users) {
    if (exceptUserId !== undefined && user._id === exceptUserId) {
      continue;
    }
    if (storedPublicName(user.name)?.toLowerCase() === wanted) {
      throw new Error(NAME_TAKEN);
    }
  }
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
