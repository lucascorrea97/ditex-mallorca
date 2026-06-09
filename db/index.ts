import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Reuse one client across dev HMR reloads so we don't exhaust Postgres connections.
const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>;
};

let instance: ReturnType<typeof drizzle<typeof schema>> | undefined;

function getDb() {
  if (instance) return instance;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  }
  const client = globalForDb.client ?? postgres(url, { prepare: false });
  if (process.env.NODE_ENV !== "production") globalForDb.client = client;
  instance = drizzle(client, { schema });
  return instance;
}

// Lazy proxy: importing this module has no side effects, so a missing DATABASE_URL
// never breaks the build (e.g. on Vercel before a production DB exists). The connection
// is only created — and the error only thrown — when a query actually runs.
export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export { schema };
