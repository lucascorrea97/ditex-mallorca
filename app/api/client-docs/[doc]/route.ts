import { get } from "@vercel/blob";
import { auth } from "@/auth";
import { blobCredentials } from "@/lib/blob-credentials";
import { findClientDoc } from "@/lib/client-docs";

// Serves the three real Client Area PDFs (#84) from the PRIVATE `ditex-documents` Blob
// store. This route is the only door to those files — ADR-0007 (2026-09-01): the files
// are private precisely so that the login actually protects them, which only holds if
// every read goes through an auth check first. Mirrors app/api/price-list/route.ts.
//
// Private blobs have no public URL by design, so we stream the bytes through here rather
// than redirecting: there is no signed URL to hand out, and handing one out would be a
// window during which the file is reachable without a session.
//
// Auth is via Vercel OIDC (BLOB_STORE_ID + VERCEL_OIDC_TOKEN, injected on Vercel and
// pulled locally by `vercel env pull`) — the store has no long-lived read-write token.

export const runtime = "nodejs"; // @vercel/blob's get() streams over Node APIs
export const dynamic = "force-dynamic"; // per-session, never cached or prerendered
// The catalogue is ~14 MB after compression; the default 10s is tight for a slow mobile
// connection, and the function is billed on duration only while the stream is open.
export const maxDuration = 60;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ doc: string }> },
) {
  // The gate, first and unconditionally — before the param is even read, so no code path
  // can touch the store on behalf of an anonymous request.
  const session = await auth();
  if (!session) {
    return new Response("No autorizado.", { status: 401 });
  }

  const { doc: slug } = await params;
  // Allow-list lookup: a client-supplied segment NEVER becomes a blob pathname. Without
  // this, `/api/client-docs/../secrets.pdf` would be a read-anything proxy for anyone
  // holding the shared password.
  const doc = findClientDoc(slug);
  if (!doc) {
    return new Response("Documento no encontrado.", { status: 404 });
  }

  // Credentials passed explicitly: the store's injected variable names differ between
  // Development and Preview/Production, and the SDK only checks the unprefixed ones.
  // See lib/blob-credentials.ts — without this the route works locally and 500s deployed.
  const result = await get(doc.blobPathname, {
    access: "private",
    ...blobCredentials(),
  });
  if (!result || result.statusCode !== 200) {
    // The registry and the store have drifted (a doc listed here was never uploaded).
    // 404 rather than 500: from the Client's side the document simply isn't there.
    return new Response("Documento no encontrado.", { status: 404 });
  }

  const headers = new Headers({
    "Content-Type": result.blob.contentType || "application/pdf",
    // `inline` so the browser's PDF viewer opens it in the new tab (what the current
    // site does, and friendlier than a mystery download for the audience in ADR-0001).
    // The viewer's own download button still saves it under this filename.
    "Content-Disposition": `inline; filename="${doc.downloadFilename}"`,
    "X-Content-Type-Options": "nosniff",
    // Gated content: never let a shared proxy or the browser cache hold these bytes
    // where a later, sessionless request could read them.
    "Cache-Control": "private, no-store",
  });

  // Forward the origin's own Content-Length (not our registry's `bytes`, which is
  // display metadata and could drift) so the browser can show download progress. If the
  // origin didn't send one, omit it and let the response be chunked — a wrong
  // Content-Length truncates the file, which is far worse than no progress bar.
  const contentLength = result.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return new Response(result.stream, { status: 200, headers });
}
