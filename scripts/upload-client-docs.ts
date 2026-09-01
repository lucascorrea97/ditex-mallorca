import { config as loadEnv } from "dotenv";
import { readFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { put } from "@vercel/blob";
import { blobCredentials, blobCredentialsProblem } from "../lib/blob-credentials";
import { clientDocs, type ClientDocSlug } from "../lib/client-docs";

// One-time upload of the three real Client Area PDFs (#84) into the PRIVATE
// `ditex-documents` Blob store. Run from a laptop, never from a function:
//
//     npm run docs:upload
//
// Why local: Vercel caps a function's request body at 4.5 MB, so a server upload route
// could not accept even the small tariffs, let alone the catalogue. These are three
// static documents uploaded by hand a couple of times a year, so a seed-style script
// (same shape as db/seed.ts) is the right tool — not an upload endpoint.
//
// Auth: Vercel OIDC. `put()` picks up BLOB_STORE_ID + VERCEL_OIDC_TOKEN from .env.local,
// which `vercel env pull` writes. There is no long-lived BLOB_READ_WRITE_TOKEN for this
// store by design. If the token has expired, re-run `vercel env pull`.
//
// Source files live OUTSIDE the repo (~/ditex-data/client-area-pdfs) and must stay there:
// committing them would put a gated 85 MB document into git history permanently, and
// /public would serve them with no auth at all (ADR-0007, 2026-09-01).
//
// The catalogue is uploaded in its web-optimised form. The original November 2025 export
// is 85.4 MB of un-downsampled bitmaps; re-rendering it at 150 dpi gives 14.1 MB (-83%)
// with all 100 pages and vector text intact — verified by eye against the original at
// 200 dpi zoom. Regenerate with:
//
//     gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.5 -dPDFSETTINGS=/ebook \
//        -dDetectDuplicateImages=true -dNOPAUSE -dQUIET -dBATCH \
//        -sOutputFile=Catalogo-nov-2025-web.pdf Catalogo-nov-2025.pdf

// `.env.local` first: that is the file `vercel env pull` writes, and the only place
// BLOB_STORE_ID / VERCEL_OIDC_TOKEN live. Earlier files win in dotenv, so a hand-edited
// `.env` stays a fallback rather than overriding the pulled credentials.
loadEnv({ path: [".env.local", ".env"], quiet: true });

const SOURCE_DIR =
  process.env.CLIENT_DOCS_DIR ?? path.join(homedir(), "ditex-data", "client-area-pdfs");

// Which file on disk backs each registered document. Separate from the registry because
// the local staging filename is an operator detail (the catalogue's `-web` suffix marks
// the compressed render) while `blobPathname` is what production reads.
const sources: Record<ClientDocSlug, string> = {
  "tarifa-telas": "Tarifa-telas-07-08-2026.pdf",
  "tarifa-material": "Material-tarifa-09-07-2026.pdf",
  catalogo: "Catalogo-nov-2025-web.pdf",
};

async function main() {
  const problem = blobCredentialsProblem();
  if (problem) throw new Error(problem);

  console.log(`Uploading ${clientDocs.length} documents from ${SOURCE_DIR}\n`);

  for (const doc of clientDocs) {
    const source = path.join(SOURCE_DIR, sources[doc.slug]);
    const { size } = await stat(source);
    const body = await readFile(source);

    const result = await put(doc.blobPathname, body, {
      access: "private",
      // Same per-environment naming shim as the serving route; see lib/blob-credentials.
      ...blobCredentials(),
      contentType: "application/pdf",
      // Fixed pathnames — the registry hard-codes them, so no random suffix.
      addRandomSuffix: false,
      // Re-running the script must replace the file, not throw. This is how a new
      // tariff gets published once its dated pathname is updated in the registry.
      allowOverwrite: true,
      // Splits the 14 MB catalogue into parallel parts; harmless for the small tariffs.
      multipart: true,
    });

    const drift = size === doc.bytes ? "" : `  ⚠️  registry says ${doc.bytes}`;
    console.log(`  ✓ ${doc.slug}`);
    console.log(`      ${result.pathname}  (${size} bytes)${drift}`);
  }

  console.log(
    "\nDone. If any ⚠️ appeared, update `bytes` in lib/client-docs.ts to the value shown.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
