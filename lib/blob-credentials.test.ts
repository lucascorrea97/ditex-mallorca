import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { blobCredentials, blobCredentialsProblem } from "@/lib/blob-credentials";

// The store is connected to the project under the env-var prefix `BLOB_READ_WRITE_TOKEN`,
// so the injected names differ between Development and Preview/Production while
// @vercel/blob only looks for the unprefixed ones. Getting this wrong is invisible
// locally and 500s every document on the deployed site, so it is pinned here.

const KEYS = [
  "BLOB_STORE_ID",
  "BLOB_READ_WRITE_TOKEN",
  "BLOB_READ_WRITE_TOKEN_STORE_ID",
  "BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN",
] as const;

let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
  for (const k of KEYS) delete process.env[k];
});

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe("blobCredentials", () => {
  it("reads the plain names used in Development", () => {
    process.env.BLOB_STORE_ID = "store_dev";
    expect(blobCredentials()).toEqual({ storeId: "store_dev" });
  });

  it("reads the prefixed names injected in Preview/Production", () => {
    // The case that would otherwise ship broken: no unprefixed variable exists there.
    process.env.BLOB_READ_WRITE_TOKEN_STORE_ID = "store_prod";
    expect(blobCredentials()).toEqual({ storeId: "store_prod" });
  });

  it("prefers the plain name when both are somehow present", () => {
    process.env.BLOB_STORE_ID = "store_plain";
    process.env.BLOB_READ_WRITE_TOKEN_STORE_ID = "store_prefixed";
    expect(blobCredentials().storeId).toBe("store_plain");
  });

  it("treats an empty value as absent", () => {
    // `vercel env pull` writes sensitive values as empty strings. Passing "" through
    // would override the SDK's own lookup with nothing and break OIDC auth.
    process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN = "";
    process.env.BLOB_READ_WRITE_TOKEN_STORE_ID = "store_prod";
    expect(blobCredentials()).toEqual({ storeId: "store_prod" });
  });

  it("omits missing keys entirely rather than passing undefined", () => {
    // Spreading `{ token: undefined }` into the SDK options would shadow its env lookup.
    process.env.BLOB_STORE_ID = "store_dev";
    expect(Object.keys(blobCredentials())).toEqual(["storeId"]);
  });

  it("picks up a read-write token when that is all there is", () => {
    process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN = "vercel_blob_rw_x";
    expect(blobCredentials()).toEqual({ token: "vercel_blob_rw_x" });
  });
});

describe("blobCredentialsProblem", () => {
  it("explains itself when nothing is configured", () => {
    expect(blobCredentialsProblem()).toMatch(/No Vercel Blob credentials/);
  });

  it("is silent once either auth path is available", () => {
    process.env.BLOB_READ_WRITE_TOKEN_STORE_ID = "store_prod";
    expect(blobCredentialsProblem()).toBeNull();
  });
});
