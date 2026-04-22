import { readFile } from "node:fs/promises";
import path from "node:path";

import pg from "pg";

const { Client } = pg;

const rootDir = process.cwd();
const schemaPath = path.join(rootDir, "supabase", "schema.sql");
const databaseUrl = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Set SUPABASE_DB_URL or DATABASE_URL before applying the Supabase schema.");
}

const sql = await readFile(schemaPath, "utf8");
const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

try {
  await client.connect();
  await client.query(sql);
  console.log("Supabase schema applied successfully.");
} finally {
  await client.end().catch(() => {});
}
