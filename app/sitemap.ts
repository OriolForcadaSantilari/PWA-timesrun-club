import type { MetadataRoute } from "next";

const SITE_URL = "https://www.timesrun.club";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/find`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/clubs`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
