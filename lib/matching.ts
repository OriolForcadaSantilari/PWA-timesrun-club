import { formatPace, type Gender, type WhoCanJoin } from "@/lib/types";

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
  return { ok: true };
}

const PACE_SLACK = 0.15;

export type PaceFit = "match" | "faster" | "slower";

export function paceFit(run: Pick<JoinableRun, "paceMin" | "paceMax">, easyPaceMinPerKm: number): PaceFit {
  if (easyPaceMinPerKm < run.paceMin - PACE_SLACK) {
    return "faster";
  }
  if (easyPaceMinPerKm > run.paceMax + PACE_SLACK) {
    return "slower";
  }
  return "match";
}

export function paceFitMessage(
  run: Pick<JoinableRun, "paceMin" | "paceMax">,
  easyPaceMinPerKm: number,
): string | null {
  const fit = paceFit(run, easyPaceMinPerKm);
  const band = `${formatPace(run.paceMin)}–${formatPace(run.paceMax)} /km`;
  if (fit === "faster") {
    return `You're outside this run's pace — your easy pace (${formatPace(easyPaceMinPerKm)}) is faster than ${band}.`;
  }
  if (fit === "slower") {
    return `You're outside this run's pace — your easy pace (${formatPace(easyPaceMinPerKm)}) is slower than ${band}.`;
  }
  return null;
}

export function spotsLeft(spots: number, joinedCount: number): number {
  return Math.max(0, spots - joinedCount);
}
