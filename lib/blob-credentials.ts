// Resolves the Vercel Blob credentials for the private `ditex-documents` store.
//
// Why this exists: the store is connected to the project with the custom env-var prefix
// `BLOB_READ_WRITE_TOKEN`, which Vercel then applies to every variable it injects. The
// result is that the names differ per environment:
//
//   Development           BLOB_STORE_ID                          (+ VERCEL_OIDC_TOKEN)
//   Preview / Production  BLOB_READ_WRITE_TOKEN_STORE_ID         (+ VERCEL_OIDC_TOKEN)
//                         BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN
//
// @vercel/blob only looks for the unprefixed `BLOB_STORE_ID` / `BLOB_READ_WRITE_TOKEN`,
// so on a deployed environment it finds neither and throws — the documents would 500 for
// every logged-in Client while working perfectly on localhost. Passing the resolved
// values explicitly makes the same code work in all three environments.
//
// This is a shim around a dashboard misconfiguration, not a design: see the follow-up
// issue about renaming the connected variables, after which this file can be deleted.

export type BlobCredentials = {
  /** Used with VERCEL_OIDC_TOKEN — the store's preferred, tokenless auth path. */
  storeId?: string;
  /** Long-lived read-write token; the fallback where no OIDC token is present. */
  token?: string;
};

export function blobCredentials(): BlobCredentials {
  const storeId =
    process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN_STORE_ID;
  const token =
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN;

  // Only include what's actually set: passing `undefined` explicitly would override the
  // SDK's own env lookup with nothing. When both are present the SDK prefers OIDC
  // (storeId + VERCEL_OIDC_TOKEN) and ignores the token, which is what we want.
  return {
    ...(storeId ? { storeId } : {}),
    ...(token ? { token } : {}),
  };
}

/** Human-readable reason the store is unreachable, or null when it looks configured. */
export function blobCredentialsProblem(): string | null {
  const { storeId, token } = blobCredentials();
  if (storeId || token) return null;
  return (
    "No Vercel Blob credentials found. Expected BLOB_STORE_ID (+ VERCEL_OIDC_TOKEN) or " +
    "BLOB_READ_WRITE_TOKEN, under either the plain or the BLOB_READ_WRITE_TOKEN_ prefix. " +
    "Run `vercel link && vercel env pull` for local development."
  );
}
