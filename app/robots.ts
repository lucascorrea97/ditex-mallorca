import type { MetadataRoute } from "next";

// Staging must NEVER be indexed before the big-bang cutover (ADR-0005, ADR-0013):
// it must not compete with the live ditexmallorca.es or the rogue .com on search.
// This blocks all crawlers entirely.
//
// The SEO machinery is built and ready (issue #9): app/sitemap.ts is generated and valid,
// and pages carry canonical/hreflang/JSON-LD on the configured host (ADR-0004). At cutover
// this becomes an allow-list and registers the sitemap, e.g.:
//
//   rules: { userAgent: "*", allow: "/" },
//   sitemap: `${SITE_URL}/sitemap.xml`,
//
// Flipping that on is the cutover task — deliberately NOT done here (AGENTS.md).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
