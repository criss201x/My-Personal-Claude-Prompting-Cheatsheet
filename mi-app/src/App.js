import { useState, useEffect, useRef, useCallback } from "react";
import defaultCategories from "./data/prompts";

// ─── Config visual por modelo ───────────────────────────────────────────────
const modelBadge = {
  "Opus 4.6":   { bg: "#1a0a2e", border: "#7c3aed", text: "#c4b5fd" },
  "Sonnet 4.6": { bg: "#0a1a2e", border: "#0ea5e9", text: "#7dd3fc" },
  "Haiku 4.5":  { bg: "#0a2e1a", border: "#10b981", text: "#86efac" },
};

const MODEL_OPTIONS = ["Opus 4.6", "Sonnet 4.6", "Haiku 4.5"];

const MODEL_FILTERS = [
  { id: "all",    label: "Todos" },
  { id: "Opus",   label: "Opus 4.6",   color: "#c4b5fd" },
  { id: "Sonnet", label: "Sonnet 4.6", color: "#7dd3fc" },
  { id: "Haiku",  label: "Haiku 4.5",  color: "#86efac" },
];

// API base URL — en desarrollo apunta a http://localhost:3001
// En producción (Docker), usa /api y nginx proxea al backend
const API_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:3001"
);

// Genera un ID único para prompts nuevos
function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// Llamar a la API. Si hay token, lo incluye en Authorization header.
async function apiCall(endpoint, options = {}, token = null) {
  const url = `${API_URL}${endpoint}`;
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${response.status}`);
  }
  return response.json();
}

// ─── Helpers para trabajar con la estructura de datos ─────────────────────
// Enriquecer prompts con su categoría
function enrichPrompts(prompts, categories) {
  return prompts.map((p) => ({
    ...p,
    cat: categories.find((c) => c.id === p.category_id),
  }));
}

// Filtrar prompts por búsqueda y modelo
function filterPrompts(search, modelFilter, prompts, categories) {
  const q = search.trim().toLowerCase();
  return enrichPrompts(prompts, categories).filter((p) => {
    const matchModel =
      modelFilter === "all" || p.model.startsWith(modelFilter);
    if (!matchModel) return false;
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.tag.toLowerCase().includes(q) ||
      p.prompt.toLowerCase().includes(q) ||
      p.tip.toLowerCase().includes(q)
    );
  });
}

// ─── Estilos compartidos ──────────────────────────────────────────────────────
const inputStyle = {
  width: "100%",
  background: "#07070f",
  border: "1px solid #2a2a3a",
  borderRadius: "5px",
  padding: "10px 12px",
  color: "#ccc",
  fontSize: "13px",
  fontFamily: "'IBM Plex Mono','Courier New',monospace",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

// ─── Modal de crear / editar prompt ──────────────────────────────────────────
function PromptModal({ categories, editingPrompt, defaultCategoryId, onSave, onClose }) {
  const isEdit = Boolean(editingPrompt);

  const [form, setForm] = useState({
    title:    editingPrompt?.title    ?? "",
    tag:      editingPrompt?.tag      ?? "",
    prompt:   editingPrompt?.prompt   ?? "",
    tip:      editingPrompt?.tip      ?? "",
    model:    editingPrompt?.model    ?? "Sonnet 4.6",
    categoryId: editingPrompt?.cat?.id ?? defaultCategoryId ?? categories[0]?.id,
  });

  const [errors, setErrors] = useState({});

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim())  errs.title  = "Requerido";
    if (!form.tag.trim())    errs.tag    = "Requerido";
    if (!form.prompt.trim()) errs.prompt = "Requerido";
    if (!form.tip.trim())    errs.tip    = "Requerido";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    onSave({
      id:         editingPrompt?.id ?? makeId(),
      title:      form.title.trim(),
      tag:        form.tag.trim(),
      prompt:     form.prompt,
      tip:        form.tip.trim(),
      model:      form.model,
      categoryId: form.categoryId,
      // Si es edición, se pasa también la categoría original para poder moverla
      originalCategoryId: editingPrompt?.cat?.id,
    });
  }

  const field = (label, key, element) => (
    <div style={{ marginBottom: "14px" }}>
      <label style={{ display: "block", fontSize: "11px", color: "#8a8a9a", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>
        {label} {errors[key] && <span style={{ color: "#f87171", marginLeft: "8px" }}>{errors[key]}</span>}
      </label>
      {element}
    </div>
  );

  return (
    // Overlay
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* Panel — stopPropagation para no cerrar al hacer clic dentro */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0d0d16",
          border: "1px solid #2a2a3a",
          borderRadius: "10px",
          padding: "28px 32px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#2a2a3a transparent",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
          <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#e0e0f0", letterSpacing: "-0.3px" }}>
            {isEdit ? "✎ Editar prompt" : "+ Nuevo prompt"}
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#8a8a9a", cursor: "pointer", fontSize: "18px", lineHeight: 1, padding: "4px 6px" }}
          >×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Categoría */}
          {field("Categoría", "categoryId",
            <select
              value={form.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              style={{ ...inputStyle }}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          )}

          {/* Título */}
          {field("Título", "title",
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ej: Explicación desde primeros principios"
              style={{ ...inputStyle, borderColor: errors.title ? "#f87171" : "#2a2a3a" }}
            />
          )}

          {/* Tag */}
          {field("Tag (etiqueta corta)", "tag",
            <input
              type="text"
              value={form.tag}
              onChange={(e) => set("tag", e.target.value)}
              placeholder="Ej: Conceptual"
              style={{ ...inputStyle, borderColor: errors.tag ? "#f87171" : "#2a2a3a" }}
            />
          )}

          {/* Modelo */}
          {field("Modelo recomendado", "model",
            <select
              value={form.model}
              onChange={(e) => set("model", e.target.value)}
              style={{ ...inputStyle }}
            >
              {MODEL_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          )}

          {/* Prompt */}
          {field("Prompt", "prompt",
            <textarea
              value={form.prompt}
              onChange={(e) => set("prompt", e.target.value)}
              placeholder="Escribe el prompt aquí. Usa [VARIABLE] para los campos a rellenar..."
              rows={8}
              style={{
                ...inputStyle,
                resize: "vertical",
                lineHeight: "1.7",
                borderColor: errors.prompt ? "#f87171" : "#2a2a3a",
              }}
            />
          )}

          {/* Tip */}
          {field("Tip / Cuándo usarlo", "tip",
            <textarea
              value={form.tip}
              onChange={(e) => set("tip", e.target.value)}
              placeholder="Consejo sobre cuándo y cómo usar este prompt..."
              rows={3}
              style={{
                ...inputStyle,
                resize: "vertical",
                lineHeight: "1.7",
                borderColor: errors.tip ? "#f87171" : "#2a2a3a",
              }}
            />
          )}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "6px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "1px solid #2a2a3a",
                color: "#8a8a9a",
                padding: "8px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "12px",
                fontFamily: "inherit",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                background: "#7c3aed18",
                border: "1px solid #7c3aed",
                color: "#c4b5fd",
                padding: "8px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "12px",
                fontFamily: "inherit",
                fontWeight: 600,
              }}
            >
              {isEdit ? "Guardar cambios" : "Crear prompt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal de login admin ─────────────────────────────────────────────────────
function LoginModal({ onLogin, onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      onLogin(res.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0d0d16", border: "1px solid #2a2a3a",
          borderRadius: "10px", padding: "28px 32px",
          width: "100%", maxWidth: "360px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
          <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#e0e0f0" }}>Admin</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#8a8a9a", cursor: "pointer", fontSize: "18px", padding: "4px 6px" }}>×</button>
        </div>

        {error && (
          <div style={{ background: "#2d0a0a", border: "1px solid #f87171", color: "#f87171", padding: "8px 12px", borderRadius: "4px", fontSize: "12px", marginBottom: "14px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "11px", color: "#8a8a9a", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Usuario</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus
              style={{ ...inputStyle }} />
          </div>
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "11px", color: "#8a8a9a", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ ...inputStyle }} />
          </div>
          <button type="submit" disabled={loading}
            style={{
              width: "100%", background: "#7c3aed18", border: "1px solid #7c3aed",
              color: "#c4b5fd", padding: "10px", borderRadius: "5px", cursor: "pointer",
              fontSize: "12px", fontFamily: "inherit", fontWeight: 600, opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Verificando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function CheatSheet() {
  const [categories, setCategories]   = useState([]);
  const [prompts, setPrompts]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  // Auth: token en localStorage para persistir entre recargas
  const [token, setToken]             = useState(() => localStorage.getItem("admin_token"));
  const [showLogin, setShowLogin]     = useState(false);
  const isAdmin = Boolean(token);

  const [activeCategory, setActiveCategory] = useState("learning");
  const [copiedKey, setCopiedKey]     = useState(null);
  const [expandedKey, setExpandedKey] = useState(null);
  const [hoveredKey, setHoveredKey]   = useState(null);
  const [search, setSearch]           = useState("");
  const [modelFilter, setModelFilter] = useState("all");

  // Estado del modal: null = cerrado, { mode: "create" | "edit", prompt? }
  const [modal, setModal] = useState(null);
  // ID del prompt a confirmar eliminación, null si ninguno
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const expandedRef = useRef(null);

  // Cargar categorías y prompts desde el API al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [catsRes, promptsRes] = await Promise.all([
          apiCall("/categories"),
          apiCall("/prompts"),
        ]);

        setCategories(catsRes.data || []);
        setPrompts(promptsRes.data || []);
        setError(null);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message);
        // Fallback: usar datos locales si el API no responde
        const fallbackCats = defaultCategories.map((cat) => ({
          ...cat,
          patterns: [],
        }));
        setCategories(fallbackCats);
        setPrompts([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Cerrar tarjeta con Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setExpandedKey(null);
        setModal(null);
        setConfirmDeleteId(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Scroll suave al expandir
  useEffect(() => {
    if (expandedKey && expandedRef.current) {
      setTimeout(() => {
        expandedRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  }, [expandedKey]);

  const copyPrompt = useCallback((prompt, key) => {
    navigator.clipboard.writeText(prompt);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  }, []);

  // ── Auth handlers ──────────────────────────────────────────────────────────

  function handleLogin(newToken) {
    localStorage.setItem("admin_token", newToken);
    setToken(newToken);
    setShowLogin(false);
  }

  function handleLogout() {
    localStorage.removeItem("admin_token");
    setToken(null);
  }

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  async function handleSavePrompt({ id, title, tag, prompt, tip, model, categoryId, originalCategoryId }) {
    try {
      const isEdit = Boolean(originalCategoryId);

      if (!isEdit) {
        const res = await apiCall("/prompts", {
          method: "POST",
          body: JSON.stringify({
            id: id || makeId(),
            category_id: categoryId,
            title, tag, prompt, tip, model,
          }),
        }, token);
        setPrompts((prev) => [...prev, res.data]);
      } else {
        const res = await apiCall(`/prompts/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            category_id: categoryId,
            title, tag, prompt, tip, model,
          }),
        }, token);
        setPrompts((prev) =>
          prev.map((p) => (p.id === id ? res.data : p))
        );
      }

      setModal(null);
    } catch (err) {
      console.error("Error saving prompt:", err);
      alert("Error al guardar el prompt: " + err.message);
    }
  }

  async function handleDeletePrompt(promptId) {
    try {
      await apiCall(`/prompts/${promptId}`, { method: "DELETE" }, token);
      setPrompts((prev) => prev.filter((p) => p.id !== promptId));
      setExpandedKey(null);
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Error deleting prompt:", err);
      alert("Error al eliminar el prompt: " + err.message);
    }
  }

  async function handleResetDefaults() {
    if (!window.confirm("¿Restaurar todos los prompts a los valores originales? Se perderán los cambios.")) return;
    try {
      await apiCall("/reset-defaults", { method: "POST" }, token);
      setPrompts([]);
      setExpandedKey(null);
    } catch (err) {
      console.error("Error resetting:", err);
      alert("Error al restaurar: " + err.message);
    }
  }

  // ── Cálculos derivados ────────────────────────────────────────────────────
  const isSearchMode = search.trim().length > 0 || modelFilter !== "all";
  const searchResults = isSearchMode ? filterPrompts(search, modelFilter, prompts, categories) : null;
  const currentCategory = categories.find((c) => c.id === activeCategory) ?? categories[0];
  const displayPatterns = isSearchMode ? null : enrichPrompts(prompts.filter((p) => p.category_id === activeCategory), categories);
  const countByCategory = (catId) => prompts.filter((p) => p.category_id === catId).length;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0", fontFamily: "'IBM Plex Mono','Courier New',monospace" }}>

      {/* ── Login modal ──────────────────────────────────────────────────── */}
      {showLogin && (
        <LoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)} />
      )}

      {/* ── Modal CRUD ────────────────────────────────────────────────────── */}
      {modal && (
        <PromptModal
          categories={categories}
          editingPrompt={modal.prompt ?? null}
          defaultCategoryId={modal.prompt?.cat?.id ?? activeCategory}
          onSave={handleSavePrompt}
          onClose={() => setModal(null)}
        />
      )}

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid #1e1e2e", background: "linear-gradient(180deg,#0f0f1a 0%,#0a0a0f 100%)" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "32px 32px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, letterSpacing: "-0.8px", color: "#fff", lineHeight: 1 }}>
              Claude Prompting Cheatsheet
            </h1>
            <span style={{ fontSize: "10px", color: "#7c3aed", letterSpacing: "2px", textTransform: "uppercase", background: "#7c3aed14", padding: "3px 8px", borderRadius: "4px", border: "1px solid #7c3aed30", fontWeight: 600 }}>
              v4.6
            </span>
            {/* Indicador de error si hay problema con la API */}
            {error && (
              <div style={{
                marginLeft: "auto",
                background: "#2d0a0a",
                border: "1px solid #f87171",
                color: "#f87171",
                padding: "6px 12px",
                borderRadius: "4px",
                fontSize: "11px",
                fontFamily: "inherit",
              }}>
                ⚠ API no disponible: {error}
              </div>
            )}

            {/* Botones admin: reset + login/logout */}
            <div style={{ marginLeft: error ? "0" : "auto", display: "flex", gap: "6px", alignItems: "center" }}>
              {isAdmin && (
                <button
                  onClick={handleResetDefaults}
                  title="Restaurar prompts originales"
                  style={{
                    background: "transparent", border: "1px solid #2a2a3a",
                    color: "#5a5a6a", padding: "4px 10px", borderRadius: "4px",
                    cursor: "pointer", fontSize: "10px", fontFamily: "inherit", letterSpacing: "0.5px",
                  }}
                >
                  ↺ Restaurar defaults
                </button>
              )}
              {isAdmin ? (
                <button
                  onClick={handleLogout}
                  title="Cerrar sesión admin"
                  style={{
                    background: "#1a2d1a", border: "1px solid #4a9",
                    color: "#5fba7d", padding: "4px 10px", borderRadius: "4px",
                    cursor: "pointer", fontSize: "10px", fontFamily: "inherit", letterSpacing: "0.5px",
                  }}
                >
                  Admin ✓
                </button>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  title="Iniciar sesión como administrador"
                  style={{
                    background: "transparent", border: "1px solid #2a2a3a",
                    color: "#5a5a6a", padding: "4px 10px", borderRadius: "4px",
                    cursor: "pointer", fontSize: "10px", fontFamily: "inherit", letterSpacing: "0.5px",
                  }}
                >
                  Admin
                </button>
              )}
            </div>
          </div>
          <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#8a8a9a", letterSpacing: "0.3px", lineHeight: "1.6" }}>
            Patrones de prompting optimizados para Claude · Haz clic en una tarjeta para expandir · <kbd style={{ background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: "3px", padding: "2px 6px", fontSize: "10px", color: "#9a9aaa" }}>Esc</kbd> para cerrar
          </p>
        </div>
      </div>

      {/* ── Barra de búsqueda + filtro de modelo ─────────────────────────── */}
      <div style={{ borderBottom: "1px solid #1a1a2a", background: "#0c0c14" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "12px 32px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Search input */}
          <div style={{ position: "relative", flex: "1", minWidth: "200px", maxWidth: "380px" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#7a7a8a", fontSize: "13px", pointerEvents: "none" }}>⌕</span>
            <input
              type="text"
              placeholder="Buscar prompts..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setExpandedKey(null); }}
              style={{
                width: "100%",
                background: "#0d0d18",
                border: "1px solid #2a2a3a",
                borderRadius: "5px",
                padding: "8px 12px 8px 30px",
                color: "#ccc",
                fontSize: "13px",
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#4a4a6a")}
              onBlur={(e) => (e.target.style.borderColor = "#2a2a3a")}
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setExpandedKey(null); }}
                style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#8a8a9a", cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: "0 2px" }}
              >×</button>
            )}
          </div>

          {/* Model filter chips */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {MODEL_FILTERS.map((f) => {
              const active = modelFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => { setModelFilter(f.id); setExpandedKey(null); }}
                  style={{
                    background: active ? (f.color ? `${f.color}18` : "#1e1e2e") : "transparent",
                    border: `1px solid ${active ? (f.color ?? "#555") : "#2a2a3a"}`,
                    color: active ? (f.color ?? "#ccc") : "#8a8a9a",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontFamily: "inherit",
                    fontWeight: active ? 600 : 400,
                    letterSpacing: "0.3px",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Resultado de búsqueda */}
          {isSearchMode && (
            <span style={{ fontSize: "12px", color: "#8a8a9a", marginLeft: "auto" }}>
              {searchResults.length === 0
                ? "Sin resultados"
                : `${searchResults.length} prompt${searchResults.length !== 1 ? "s" : ""}`}
            </span>
          )}

          {/* Botón Nuevo Prompt — solo visible para admin */}
          {isAdmin && (
            <button
              onClick={() => setModal({ mode: "create" })}
              style={{
                background: "#7c3aed18",
                border: "1px solid #7c3aed80",
                color: "#c4b5fd",
                padding: "8px 16px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "12px",
                fontFamily: "inherit",
                fontWeight: 600,
                letterSpacing: "0.5px",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
                marginLeft: isSearchMode ? "0" : "auto",
              }}
            >
              + Nuevo prompt
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs de categoría (ocultos en modo búsqueda) ─────────────────── */}
      {!isSearchMode && (
        <div style={{ borderBottom: "1px solid #1a1a2a" }}>
          <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "10px 32px", display: "flex", gap: "6px", overflowX: "auto", scrollbarWidth: "thin", scrollbarColor: "#2a2a3a transparent" }}>
            {categories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setExpandedKey(null); }}
                  style={{
                    background: active ? cat.accent : "transparent",
                    border: `1px solid ${active ? cat.color : "#2a2a3a"}`,
                    color: active ? cat.color : "#9a9aaa",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontFamily: "inherit",
                    fontWeight: active ? 700 : 400,
                    letterSpacing: "0.5px",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span style={{ fontSize: "13px" }}>{cat.icon}</span>
                  {cat.label}
                  <span style={{
                    fontSize: "9px",
                    padding: "1px 5px",
                    background: active ? `${cat.color}20` : "#1a1a2a",
                    color: active ? cat.color : "#7a7a8a",
                    borderRadius: "8px",
                    letterSpacing: "0",
                  }}>
                    {countByCategory(cat.id)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Grilla de tarjetas ────────────────────────────────────────────── */}
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "24px 32px" }}>

        {isSearchMode && searchResults.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#7a7a8a", fontSize: "14px" }}>
            Sin resultados para "{search}"
            {modelFilter !== "all" && ` en ${MODEL_FILTERS.find(f => f.id === modelFilter)?.label}`}
          </div>
        )}

        {isSearchMode && searchResults.length > 0 && (
          <div style={{ fontSize: "12px", color: "#7a7a8a", marginBottom: "16px", letterSpacing: "0.5px" }}>
            {search && `Resultados para "${search}"`}
            {search && modelFilter !== "all" && " · "}
            {modelFilter !== "all" && MODEL_FILTERS.find(f => f.id === modelFilter)?.label}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "12px" }}>
          {(isSearchMode ? searchResults : displayPatterns).map((p, idx) => {
            const key = isSearchMode ? `${p.cat.id}-${p.id ?? idx}` : `${activeCategory}-${p.id ?? idx}`;
            const cat = isSearchMode ? p.cat : currentCategory;
            const isExpanded = expandedKey === key;
            const isHovered  = hoveredKey === key && !isExpanded;
            const badge      = modelBadge[p.model] ?? modelBadge["Sonnet 4.6"];
            const isDeletingThis = confirmDeleteId === (p.id ?? key);

            return (
              <div
                key={key}
                ref={isExpanded ? expandedRef : null}
                onClick={() => {
                  if (confirmDeleteId) { setConfirmDeleteId(null); return; }
                  setExpandedKey(isExpanded ? null : key);
                }}
                onMouseEnter={() => setHoveredKey(key)}
                onMouseLeave={() => setHoveredKey(null)}
                style={{
                  background: isExpanded ? "#12121c" : isHovered ? "#0f0f1a" : "#0d0d16",
                  border: `1px solid ${isExpanded ? cat.color + "70" : isHovered ? "#2e2e44" : "#1e1e2e"}`,
                  borderRadius: "8px",
                  padding: "18px 20px",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  position: "relative",
                  gridColumn: isExpanded ? "1 / -1" : "auto",
                  boxShadow: isExpanded ? `0 0 24px ${cat.color}12` : "none",
                }}
              >
                {/* Cabecera */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                      {isSearchMode && (
                        <span style={{
                          fontSize: "9px", padding: "2px 7px", background: cat.accent, color: cat.color,
                          borderRadius: "3px", letterSpacing: "1px", textTransform: "uppercase", border: `1px solid ${cat.color}30`,
                        }}>
                          {cat.icon} {cat.label}
                        </span>
                      )}
                      <span style={{
                        fontSize: "10px", padding: "2px 8px", background: cat.accent, color: cat.color,
                        borderRadius: "3px", letterSpacing: "1px", textTransform: "uppercase", border: `1px solid ${cat.color}40`,
                      }}>
                        {p.tag}
                      </span>
                      <span style={{
                        fontSize: "10px", padding: "2px 8px", background: badge.bg, color: badge.text,
                        borderRadius: "3px", border: `1px solid ${badge.border}60`, letterSpacing: "0.5px",
                      }}>
                        {p.model}
                      </span>
                    </div>
                    <h3 style={{
                      margin: 0, fontSize: "18px", fontWeight: 600, letterSpacing: "-0.2px",
                      color: isExpanded ? "#f0f0ff" : isHovered ? "#e0e0f0" : "#c8c8dc",
                    }}>
                      {p.title}
                    </h3>
                  </div>
                  <span style={{
                    color: isExpanded ? "#999" : "#555", fontSize: "16px", marginLeft: "12px",
                    transition: "transform 0.2s, color 0.15s",
                    transform: isExpanded ? "rotate(180deg)" : "none", flexShrink: 0,
                  }}>▾</span>
                </div>

                {/* Preview colapsado */}
                {!isExpanded && (
                  <p style={{
                    margin: 0, fontSize: "13px", color: "#8888a0", lineHeight: "1.6",
                    overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  }}>
                    {p.prompt.replace(/\n/g, " ").trim()}
                  </p>
                )}

                {/* Expandido */}
                {isExpanded && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <pre style={{
                      background: "#07070f", border: "1px solid #1a1a2e", borderRadius: "6px",
                      padding: "16px", fontSize: "13px", lineHeight: "1.75", color: "#c2c2d8",
                      whiteSpace: "pre-wrap", wordBreak: "break-word", margin: "0 0 12px 0", fontFamily: "inherit",
                    }}>
                      {p.prompt}
                    </pre>

                    {/* Tip */}
                    <div style={{
                      display: "flex", alignItems: "flex-start", gap: "8px", background: "#0c1310",
                      border: "1px solid #1e2e1e", borderRadius: "5px", padding: "10px 12px", marginBottom: "12px",
                    }}>
                      <span style={{ color: "#4a9", fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>◆</span>
                      <span style={{ fontSize: "13px", color: "#7ab890", lineHeight: "1.6" }}>{p.tip}</span>
                    </div>

                    {/* Acciones: copiar + editar + eliminar */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                      {/* Copiar */}
                      <button
                        onClick={() => copyPrompt(p.prompt, key)}
                        style={{
                          background: copiedKey === key ? "#1a2d1a" : "transparent",
                          border: `1px solid ${copiedKey === key ? "#4a9" : cat.color + "80"}`,
                          color: copiedKey === key ? "#5fba7d" : cat.color,
                          padding: "8px 18px", borderRadius: "4px", cursor: "pointer",
                          fontSize: "12px", fontFamily: "inherit", fontWeight: 600, letterSpacing: "0.5px", transition: "all 0.15s",
                        }}
                      >
                        {copiedKey === key ? "✓ Copiado" : "↗ Copiar prompt"}
                      </button>

                      {/* Editar — solo admin */}
                      {isAdmin && (
                        <button
                          onClick={() => setModal({ mode: "edit", prompt: { ...p, cat } })}
                          style={{
                            background: "transparent", border: "1px solid #2a2a4a",
                            color: "#8888c0", padding: "8px 14px", borderRadius: "4px",
                            cursor: "pointer", fontSize: "12px", fontFamily: "inherit",
                            fontWeight: 600, letterSpacing: "0.5px", transition: "all 0.15s",
                          }}
                        >
                          ✎ Editar
                        </button>
                      )}

                      {/* Eliminar — solo admin, con confirmación inline */}
                      {isAdmin && (isDeletingThis ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "auto" }}>
                          <span style={{ fontSize: "12px", color: "#f87171" }}>¿Eliminar?</span>
                          <button
                            onClick={() => handleDeletePrompt(p.id)}
                            style={{
                              background: "#2d0a0a", border: "1px solid #f87171",
                              color: "#f87171", padding: "6px 12px", borderRadius: "4px",
                              cursor: "pointer", fontSize: "12px", fontFamily: "inherit", fontWeight: 700,
                            }}
                          >
                            Sí, eliminar
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            style={{
                              background: "transparent", border: "1px solid #2a2a3a",
                              color: "#8a8a9a", padding: "6px 10px", borderRadius: "4px",
                              cursor: "pointer", fontSize: "12px", fontFamily: "inherit",
                            }}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(p.id ?? key)}
                          style={{
                            background: "transparent", border: "1px solid #3a1a1a",
                            color: "#7a4a4a", padding: "8px 14px", borderRadius: "4px",
                            cursor: "pointer", fontSize: "12px", fontFamily: "inherit",
                            letterSpacing: "0.5px", transition: "all 0.15s", marginLeft: "auto",
                          }}
                        >
                          ✕ Eliminar
                        </button>
                      ))}

                      <span style={{ fontSize: "11px", color: "#5a5a6a", letterSpacing: "0.5px" }}>
                        ESC para cerrar
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Footer — guía de modelos ─────────────────────────────────────── */}
        <div style={{
          marginTop: "40px", padding: "20px 24px", background: "#0c0c16",
          border: "1px solid #1e1e2e", borderRadius: "8px", fontSize: "12px", color: "#8a8a9a", lineHeight: "2",
        }}>
          <div style={{ color: "#9a9aaa", fontWeight: 700, marginBottom: "10px", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase" }}>
            Guía de modelos
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "8px 24px", marginBottom: "14px" }}>
            {[
              { model: "Opus 4.6",   color: "#c4b5fd", cost: "$$$", desc: "Razonamiento profundo, ambigüedad alta, tareas multi-paso. Soporta extended thinking." },
              { model: "Sonnet 4.6", color: "#7dd3fc", cost: "$$",  desc: "Balance velocidad/calidad. Ideal para la mayoría de tareas estructuradas." },
              { model: "Haiku 4.5",  color: "#86efac", cost: "$",   desc: "Máxima velocidad y mínimo costo. Clasificación, extracción, tareas repetitivas." },
            ].map(({ model, color, cost, desc }) => (
              <div key={model} style={{ display: "flex", gap: "8px" }}>
                <span style={{ color, fontWeight: 700, whiteSpace: "nowrap", fontSize: "12px" }}>{model}</span>
                <span style={{ color: "#5a5a6a", fontSize: "11px" }}>{cost}</span>
                <span style={{ color: "#8a8a9a", fontSize: "12px" }}>{desc}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #1a1a2a", paddingTop: "12px", display: "flex", flexWrap: "wrap", gap: "6px 0", lineHeight: "1.9", fontSize: "12px" }}>
            <span style={{ color: "#8a8a9a", marginRight: "6px" }}>Principios ·</span>
            <span>Usa <span style={{ color: "#00FFA3" }}>&lt;xml_tags&gt;</span> para separar instrucciones del contenido</span>
            <span style={{ color: "#3a3a4a", margin: "0 8px" }}>·</span>
            <span>Especifica el <span style={{ color: "#FFB347" }}>formato de salida</span> esperado siempre</span>
            <span style={{ color: "#3a3a4a", margin: "0 8px" }}>·</span>
            <span>Pide <span style={{ color: "#FF6B6B" }}>niveles de confianza</span> para respuestas factuales</span>
            <span style={{ color: "#3a3a4a", margin: "0 8px" }}>·</span>
            <span>Empieza con Sonnet, sube a Opus solo si necesitas más profundidad</span>
          </div>
        </div>
      </div>
    </div>
  );
}
