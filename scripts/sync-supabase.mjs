import { readFile } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

const rootDir = process.cwd();

// Load environment variables from .env.local
async function loadEnv() {
  try {
    const envPath = path.join(rootDir, ".env.local");
    const envContent = await readFile(envPath, "utf8");
    const lines = envContent.split("\n");
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eqIndex = trimmed.indexOf("=");
        if (eqIndex > 0) {
          const key = trimmed.substring(0, eqIndex).trim();
          let value = trimmed.substring(eqIndex + 1).trim();
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
    console.log("Loaded environment variables from .env.local");
  } catch (error) {
    console.log("Could not load .env.local, using existing environment variables");
  }
}

await loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

async function loadJson(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  const raw = await readFile(absolutePath, "utf8");
  return JSON.parse(raw);
}

async function upsertInBatches(table, rows, onConflict, batchSize = 500) {
  if (!supabase) {
    throw new Error("Supabase service role key is not configured.");
  }

  for (let start = 0; start < rows.length; start += batchSize) {
    const batch = rows.slice(start, start + batchSize);
    const { error } = await supabase.from(table).upsert(batch, { onConflict });

    if (error) {
      throw new Error(`Failed to sync ${table}: ${error.message}`);
    }

    console.log(
      `Synced ${table}: ${Math.min(start + batch.length, rows.length)} / ${rows.length}`,
    );
  }
}


const [users, products, interactions] = await Promise.all([
  loadJson("data/users.json"),
  loadJson("data/products.json"),
  loadJson("data/interactions.json"),
]);

if (!supabase) {
  throw new Error(
    "Configure NEXT_PUBLIC_SUPABASE_URL with SUPABASE_SERVICE_ROLE_KEY before syncing.",
  );
}

await upsertInBatches("users", users, "user_id");
await upsertInBatches("products", products, "product_id");
await upsertInBatches("interactions", interactions, "user_id,product_id");

console.log("Supabase sync completed successfully.");
