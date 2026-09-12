import { neon } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = NeonHttpDatabase<typeof schema>;

let _db: Db | undefined;

/** Lazily-initialized Drizzle client. Throws a clear error at request time if DATABASE_URL is unset. */
export function getDb(): Db {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Add it to your environment (see .env.example).");
  _db = drizzle(neon(url), { schema });
  return _db;
}

/**
 * Same client, but as a proxy that defers connecting until first use. Lets the Auth.js adapter be
 * constructed at import time (it checks `instanceof PgDatabase`) without DATABASE_URL being set.
 */
export const db: Db = new Proxy({} as Db, {
  get(_, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop) as unknown;
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(real) : value;
  },
  getPrototypeOf: () => NeonHttpDatabase.prototype,
});

export { schema };
