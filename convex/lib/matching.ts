import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

type JoinProfile = {
  easyPaceMinPerKm: number;
  gender: "woman" | "man" | "unspecified";
};

export function canJoinRun(
  run: Pick<Doc<"runs">, "paceMin" | "paceMax" | "spots" | "whoCanJoin">,
  joinedCount: number,
  viewerJoined: boolean,
  profile: JoinProfile | null,
): { ok: boolean; reason?: string } {
  if (viewerJoined) {
    return { ok: true };
  }
  if (!profile) {
    return { ok: false, reason: "Sign in to join." };
  }
  if (joinedCount >= run.spots) {
    return { ok: false, reason: "This run is full." };
  }
  if (run.whoCanJoin === "women" && profile.gender !== "woman") {
    return { ok: false, reason: "This run is women only." };
  }
  if (run.whoCanJoin === "men" && profile.gender !== "man") {
    return { ok: false, reason: "This run is men only." };
  }
  return { ok: true };
}

type DbCtx = QueryCtx | MutationCtx;

export async function countRsvps(ctx: DbCtx, runId: Id<"runs">): Promise<number> {
  const rsvps = await ctx.db
    .query("rsvps")
    .withIndex("by_run", (q) => q.eq("runId", runId))
    .take(40);
  return rsvps.length;
}

export async function viewerRsvp(
  ctx: DbCtx,
  runId: Id<"runs">,
  userId: Id<"users"> | null,
): Promise<Doc<"rsvps"> | null> {
  if (!userId) {
    return null;
  }
  return await ctx.db
    .query("rsvps")
    .withIndex("by_run_and_user", (q) => q.eq("runId", runId).eq("userId", userId))
    .unique();
}
