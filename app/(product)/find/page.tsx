import { getUpcomingRuns } from "@/lib/server-runs";
import { FindBoard } from "./find-board";

export const revalidate = 300;

export default async function FindPage() {
  const initialRuns = await getUpcomingRuns();
  return <FindBoard initialRuns={initialRuns} />;
}
