// سكربت مزامنة البيانات مع Supabase: يقرأ ملفات JSON المحلية ويرفعها لأقسام قاعدة البيانات (users/products/interactions)
import { readFile } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

const rootDir = process.cwd();

// تحميل متغيرات البيئة من .env.local يدوياً (لأن السكربت يعمل خارج Next.js)
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
          // إزالة علامات الاقتباس إن وُجدت
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

// إنشاء عميل Supabase بصلاحيات الإدارة (Service Role) بدون جلسة
const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

// قراءة ملف JSON من المسار النسبي وتحويله لكائن JavaScript
async function loadJson(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  const raw = await readFile(absolutePath, "utf8");
  return JSON.parse(raw);
}

// رفع البيانات على دفعات (upsert) لتجنب تجاوز حد Supabase للصف الواحد
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


// جلب بيانات JSON الثلاثة (مستخدمين، منتجات، تفاعلات) بالتوازي
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

// مزامنة الأقسام الثلاثة: المستخدمون (حسب user_id)، المنتجات (حسب product_id)، التفاعلات (حسب user_id+product_id)
await upsertInBatches("users", users, "user_id");
await upsertInBatches("products", products, "product_id");
await upsertInBatches("interactions", interactions, "user_id,product_id");

console.log("Supabase sync completed successfully.");
