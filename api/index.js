import { Hono } from "hono";
import { cors } from "hono/cors";
import { SignJWT, jwtVerify } from "jose";
import sql, { seedDb, reseedDb } from "./db.js";

const app = new Hono();

// ─── Auth config ──────────────────────────────────────────────────────────────
// Credenciales y secreto desde env vars. NUNCA usar los defaults en producción.
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-dev-secret"
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
    credentials: true,
  })
);

// Sembrar BD si está vacía (idempotente)
await seedDb();

// ─── Auth middleware ──────────────────────────────────────────────────────────
// Verifica JWT en el header Authorization: Bearer <token>.
// Solo se aplica a rutas que modifican datos (POST/PUT/DELETE).
async function requireAdmin(c, next) {
  const auth = c.req.header("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return c.json({ success: false, error: "No autorizado" }, { status: 401 });
  }
  try {
    const { payload } = await jwtVerify(auth.slice(7), JWT_SECRET);
    c.set("user", payload.sub);
    await next();
  } catch (err) {
    console.error("JWT verify error:", err?.message ?? err);
    return c.json({ success: false, error: "Token inválido o expirado" }, { status: 401 });
  }
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

// POST /auth/login — autenticar admin, devuelve JWT
app.post("/auth/login", async (c) => {
  const { username, password } = await c.req.json();
  if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    return c.json({ success: false, error: "Credenciales inválidas" }, { status: 401 });
  }
  // Token expira en 24h
  const token = await new SignJWT({ sub: username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
  return c.json({ success: true, token });
});

// GET /auth/me — verificar si el token actual es válido
app.get("/auth/me", async (c) => {
  const auth = c.req.header("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return c.json({ authenticated: false });
  }
  try {
    const { payload } = await jwtVerify(auth.slice(7), JWT_SECRET);
    return c.json({ authenticated: true, user: payload.sub });
  } catch {
    return c.json({ authenticated: false });
  }
});

// ─── Public endpoints (lectura) ───────────────────────────────────────────────

// GET /categories — obtener todas las categorías
app.get("/categories", async (c) => {
  const categories = await sql`SELECT * FROM categories`;
  return c.json({ success: true, data: categories });
});

// GET /prompts — obtener todos los prompts (opcionalmente filtrados)
app.get("/prompts", async (c) => {
  const categoryId = c.req.query("categoryId");
  const model = c.req.query("model");

  let prompts;

  if (categoryId && model) {
    prompts = await sql`
      SELECT * FROM prompts
      WHERE category_id = ${categoryId} AND model LIKE ${model + "%"}
      ORDER BY created_at DESC
    `;
  } else if (categoryId) {
    prompts = await sql`
      SELECT * FROM prompts
      WHERE category_id = ${categoryId}
      ORDER BY created_at DESC
    `;
  } else if (model) {
    prompts = await sql`
      SELECT * FROM prompts
      WHERE model LIKE ${model + "%"}
      ORDER BY created_at DESC
    `;
  } else {
    prompts = await sql`SELECT * FROM prompts ORDER BY created_at DESC`;
  }

  return c.json({ success: true, data: prompts });
});

// ─── Protected endpoints (escritura) — requieren requireAdmin ─────────────────

// POST /prompts — crear un nuevo prompt
app.post("/prompts", requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const { id, title, tag, prompt, tip, model, category_id } = body;

    if (!title || !tag || !prompt || !tip || !model || !category_id) {
      return c.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const promptId = id || `prompt-${Date.now()}`;
    const [newPrompt] = await sql`
      INSERT INTO prompts (id, category_id, title, tag, prompt, tip, model)
      VALUES (${promptId}, ${category_id}, ${title}, ${tag}, ${prompt}, ${tip}, ${model})
      RETURNING *
    `;

    return c.json({ success: true, data: newPrompt }, { status: 201 });
  } catch (err) {
    console.error("Error creating prompt:", err);
    return c.json({ success: false, error: err.message }, { status: 500 });
  }
});

// PUT /prompts/:id — actualizar un prompt
app.put("/prompts/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { title, tag, prompt, tip, model, category_id } = body;

    if (!title || !tag || !prompt || !tip || !model || !category_id) {
      return c.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [updated] = await sql`
      UPDATE prompts
      SET title = ${title}, tag = ${tag}, prompt = ${prompt},
          tip = ${tip}, model = ${model}, category_id = ${category_id},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updated) {
      return c.json({ success: false, error: "Prompt not found" }, { status: 404 });
    }

    return c.json({ success: true, data: updated });
  } catch (err) {
    console.error("Error updating prompt:", err);
    return c.json({ success: false, error: err.message }, { status: 500 });
  }
});

// DELETE /prompts/:id — eliminar un prompt
app.delete("/prompts/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param("id");

    const result = await sql`DELETE FROM prompts WHERE id = ${id} RETURNING id`;

    if (result.length === 0) {
      return c.json({ success: false, error: "Prompt not found" }, { status: 404 });
    }

    return c.json({ success: true, message: "Prompt deleted" });
  } catch (err) {
    console.error("Error deleting prompt:", err);
    return c.json({ success: false, error: err.message }, { status: 500 });
  }
});

// POST /reset-defaults — restaurar prompts a los valores originales
app.post("/reset-defaults", requireAdmin, async (c) => {
  try {
    await reseedDb();
    return c.json({ success: true, message: "Prompts restored to defaults" });
  } catch (err) {
    console.error("Error resetting:", err);
    return c.json({ success: false, error: err.message }, { status: 500 });
  }
});

// GET /health — health check (público)
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────

const port = parseInt(process.env.PORT || "3001");
console.log(`Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
