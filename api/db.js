import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

// ─── Schema ───────────────────────────────────────────────────────────────────

await sql`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    accent TEXT NOT NULL
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS prompts (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    title TEXT NOT NULL,
    tag TEXT NOT NULL,
    prompt TEXT NOT NULL,
    tip TEXT NOT NULL,
    model TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )
`;

await sql`CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category_id)`;
await sql`CREATE INDEX IF NOT EXISTS idx_prompts_model ON prompts(model)`;

// ─── Seed ─────────────────────────────────────────────────────────────────────
// Top-level await (ESM): importa seed-data.js una vez al cargar el módulo.
// seed-data.js = copia de mi-app/src/data/prompts.js inyectada en el build.

let seedCategories = null;
try {
  seedCategories = (await import("./seed-data.js")).default;
} catch {
  console.warn("⚠ seed-data.js no encontrado, la BD arranca vacía");
}

async function runSeed() {
  if (!seedCategories) return;

  let promptCount = 0;
  for (const cat of seedCategories) {
    await sql`
      INSERT INTO categories (id, label, icon, color, accent)
      VALUES (${cat.id}, ${cat.label}, ${cat.icon}, ${cat.color}, ${cat.accent})
      ON CONFLICT (id) DO NOTHING
    `;
    for (const [i, p] of (cat.patterns || []).entries()) {
      await sql`
        INSERT INTO prompts (id, category_id, title, tag, prompt, tip, model)
        VALUES (${`${cat.id}-${i}`}, ${cat.id}, ${p.title}, ${p.tag}, ${p.prompt}, ${p.tip}, ${p.model})
        ON CONFLICT (id) DO NOTHING
      `;
      promptCount++;
    }
  }
  console.log(`✓ Seed: ${seedCategories.length} categorías, ${promptCount} prompts`);
}

// Idempotente: solo siembra si la BD está vacía
export async function seedDb() {
  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM categories`;
  if (n > 0) return;
  await runSeed();
}

// Borra todo y re-siembra desde seed-data.js
export async function reseedDb() {
  await sql`DELETE FROM prompts`;
  await sql`DELETE FROM categories`;
  await runSeed();
}

export default sql;
