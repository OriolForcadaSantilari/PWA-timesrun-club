import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/you", "/sign-in", "/find/new"],
    },
    sitemap: "https://www.timesrun.club/sitemap.xml",
  };
}
