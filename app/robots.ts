import type { MetadataRoute } from "next";

// Staging must NEVER be indexed before the big-bang cutover (ADR-0005, ADR-0013):
// it must not compete with the live ditexmallorca.es or the rogue .com on search.
// This blocks all crawlers entirely. When we go live, this file is replaced with a
// real allow-list + sitemap (issue #9).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
