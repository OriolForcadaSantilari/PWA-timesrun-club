import { getUpcomingRuns } from "@/lib/server-runs";
import type { MetadataRoute } from "next";

const SITE_URL = "https://www.timesrun.club";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = Date.now();
  const runs = (await getUpcomingRuns()) ?? [];
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/find`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/clubs`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    ...runs
      .filter((run) => run.startsAt > now)
      .map((run) => ({
        url: `${SITE_URL}/run/${run._id}`,
        changeFrequency: "daily" as const,
        priority: 0.7,
      })),
  ];
}
