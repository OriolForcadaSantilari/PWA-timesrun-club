import type { Gender, WhoCanJoin } from "./types";

export type JoinProfile = {
  easyPaceMinPerKm: number;
  gender: Gender;
};

export type JoinableRun = {
  paceMin: number;
  paceMax: number;
  spots: number;
  whoCanJoin: WhoCanJoin;
};

export function canJoinRun(
  run: JoinableRun,
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
  const pace = profile.easyPaceMinPerKm;
  if (pace < run.paceMin - 0.15 || pace > run.paceMax + 0.15) {
    return { ok: false, reason: "Your easy pace is outside this band." };
  }
  return { ok: true };
}

export function spotsLeft(spots: number, joinedCount: number): number {
  return Math.max(0, spots - joinedCount);
}
