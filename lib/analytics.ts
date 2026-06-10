"use client";

// Typed custom-event wrappers for Vercel Analytics (ADR-0012).
// Import and call these from Client Components to track the key client
// behaviours driving roadmap decisions: search, browse, PDF download, enquiry.
//
// Vercel Analytics is cookieless and GDPR-compliant — no consent banner needed.

import { track } from "@vercel/analytics";

export function trackSearch(query: string, resultsCount: number) {
  track("search", { query, results: resultsCount });
}

export function trackCategoryView(categorySlug: string) {
  track("category_view", { category: categorySlug });
}

export function trackProductView(categorySlug: string, productName: string) {
  track("product_view", { category: categorySlug, product: productName });
}

export function trackPdfDownload(filename: string) {
  track("pdf_download", { file: filename });
}

export function trackEnquiry(source: "contact_page" | "cta_button" | "phone") {
  track("enquiry_click", { source });
}
