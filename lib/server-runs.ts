import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { FunctionReturnType } from "convex/server";
import { unstable_cache } from "next/cache";

export type RunCards = FunctionReturnType<typeof api.runs.list>;
export type RunCard = RunCards[number];

const RUNS_REVALIDATE_SECONDS = 300;
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";

const cachedUpcomingRuns = unstable_cache(
  async () => fetchQuery(api.runs.list, { city: "Barcelona", now: Date.now() }),
  ["upcoming-runs", "Barcelona", CONVEX_URL],
  { revalidate: RUNS_REVALIDATE_SECONDS, tags: ["runs"] },
);

const cachedPublicRun = unstable_cache(
  async (runId: string) => fetchQuery(api.runs.get, { runId }),
  ["public-run", CONVEX_URL],
  { revalidate: RUNS_REVALIDATE_SECONDS, tags: ["runs"] },
);

/** Anonymous view of the board: never includes attendee names. */
export async function getUpcomingRuns(): Promise<RunCards | undefined> {
  try {
    return await cachedUpcomingRuns();
  } catch (error) {
    console.error("Could not load upcoming runs on the server", error);
    return undefined;
  }
}

/** Anonymous view of one run: `null` when it does not exist, `undefined` when Convex is unreachable. */
export async function getPublicRun(runId: string): Promise<RunCard | null | undefined> {
  try {
    return await cachedPublicRun(runId);
  } catch (error) {
    console.error("Could not load run on the server", error);
    return undefined;
  }
}
