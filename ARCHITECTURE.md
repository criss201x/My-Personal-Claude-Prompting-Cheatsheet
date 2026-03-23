# Arquitectura — Claude Cheatsheet

## Visión general

La aplicación ha evolucionado de un cliente único con `localStorage` a una arquitectura cliente-servidor con persistencia en base de datos.

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              React App (localhost:3000)              │    │
│  │ - Estado: categories, prompts, UI                   │    │
│  │ - Fetch API: GET/POST/PUT/DELETE /api/*             │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP
                       ▼
┌──────────────────────────────────────────────────────────────┐
│          PRODUCTION (Docker on Cloud / Local)                │
│  ┌────────────────────────────────────────────────────┐      │
│  │              nginx (Port 80)                       │      │
│  │ - Sirve build/ de React                           │      │
│  │ - Proxea /api/* → http://api:3001                  │      │
│  └────────────────────────────────────────────────────┘      │
│           ▲                              │                   │
│           │ /                            │ /api/*            │
│           │                              ▼                   │
│  ┌────────────────────────────────────────────────────┐      │
│  │        Hono REST API (Port 3001)                   │      │
│  │ - GET /categories                                  │      │
│  │ - GET /prompts (con filtros)                       │      │
│  │ - POST /prompts (crear)                            │      │
│  │ - PUT /prompts/:id (actualizar)                    │      │
│  │ - DELETE /prompts/:id (eliminar)                   │      │
│  │ - POST /reset-defaults                             │      │
│  │ - GET /health (healthcheck)                        │      │
│  └────────────────────────────────────────────────────┘      │
│           │                                                   │
│           └──────────────────┬──────────────────────┐         │
│                              ▼                      ▼         │
│  ┌────────────────────────────────────────────────────┐      │
│  │              SQLite Database                       │      │
│  │ - /app/data/cheatsheet.db (volumen persistente)    │      │
│  │ - Tablas: categories, prompts                      │      │
│  └────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

## Cambios desde v1.0 (localStorage)

### v1.0 (Antes)
- Estado en `localStorage` del browser
- No hay backend
- Datos perdidos si el usuario limpia el caché del browser
- No hay cross-device sync
- Estructura: `categories[]` con `patterns[]` anidado

### v2.0 (Ahora)
- Backend REST API con Hono
- SQLite file-based para persistencia
- Cross-device sync (los datos están en el servidor)
- Backup trivial (es un archivo)
- Estructura normalizada: `categories[]` + `prompts[]` separados
- Docker Compose para deployment uniforme

## Mapeo de datos

### Frontend (React)

**Antiguo (localStorage):**
```javascript
const categories = [
  {
    id: "learning",
    label: "Aprendizaje",
    patterns: [
      { id: "xyz", title: "...", tag: "...", prompt: "...", tip: "...", model: "..." }
    ]
  }
]
```

**Nuevo (API + estado React):**
```javascript
const [categories, setCategories] = useState([]); // [{ id, label, icon, color, accent }]
const [prompts, setPrompts] = useState([]);       // [{ id, category_id, title, tag, prompt, tip, model }]
```

La UI sigue mostrando la estructura antigua porque usamos la función `enrichPrompts()` que reconstruye temporalmente `{ ...prompt, cat: category }`.

### Backend (SQLite)

```sql
-- Tabla de categorías (casi inmutable, viene de la configuración)
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  accent TEXT NOT NULL
);

-- Tabla de prompts (la que el usuario edita)
CREATE TABLE prompts (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  title TEXT NOT NULL,
  tag TEXT NOT NULL,
  prompt TEXT NOT NULL,
  tip TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

## Flujo de datos

### 1. Cargar datos (app mount)

```
React mounted
    ↓
useEffect(() => {
  apiCall("/categories")
  apiCall("/prompts")
})
    ↓
setCategories(response.data)
setPrompts(response.data)
    ↓
Re-render con datos
```

### 2. Crear prompt

```
User: Click "+ Nuevo prompt"
    ↓
setModal({ mode: "create" })
    ↓
User: Llena formulario + Click "Crear prompt"
    ↓
handleSavePrompt({id, title, tag, prompt, tip, model, categoryId})
    ↓
POST /api/prompts { ... }
    ↓
API: INSERT INTO prompts VALUES (...)
    ↓
Response: { success, data: newPrompt }
    ↓
setPrompts(prev => [...prev, newPrompt])
    ↓
Re-render
```

### 3. Editar prompt

```
User: Click "✎ Editar" en una tarjeta
    ↓
setModal({ mode: "edit", prompt: {...p, cat} })
    ↓
Modal pre-llena formulario
    ↓
User: Modifica + Click "Guardar cambios"
    ↓
handleSavePrompt({id, title, ..., originalCategoryId})
    ↓
PUT /api/prompts/:id { ... }
    ↓
API: UPDATE prompts SET ... WHERE id = ?
    ↓
Response: { success, data: updatedPrompt }
    ↓
setPrompts(prev => prev.map(p => p.id === id ? updatedPrompt : p))
    ↓
Re-render
```

### 4. Eliminar prompt

```
User: Click "✕ Eliminar"
    ↓
setConfirmDeleteId(promptId)  // Muestra confirmación inline
    ↓
User: Click "Sí, eliminar"
    ↓
handleDeletePrompt(promptId)
    ↓
DELETE /api/prompts/:id
    ↓
API: DELETE FROM prompts WHERE id = ?
    ↓
Response: { success }
    ↓
setPrompts(prev => prev.filter(p => p.id !== promptId))
    ↓
Re-render
```

## Decisiones arquitectónicas

### 1. SQLite en lugar de PostgreSQL

**Por qué:**
- Single-user → no hay contenciones
- Backup = un archivo
- Migración a Postgres es directa (cambiar driver)
- Sin overhead de server PostgreSQL

**Trade-off:**
- Escalabilidad horizontal limitada
- No hay replicación
- Si el archivo se corrompe, hay riesgo (mitigado por health checks)

### 2. Hono en lugar de Express

**Por qué:**
- Más ligero y rápido
- Built-in middleware support
- Mejor TypeScript support (si migramos a TS)
- Funciona en múltiples runtimes (Node, Bun, Cloudflare Workers)

**Trade-off:**
- Ecosistema más pequeño que Express
- Menos examples en internet

### 3. nginx como proxy reverso

**Por qué:**
- Separación clara: frontend (static) vs API (dynamic)
- Caching automático de assets estáticos
- Rewrite de rutas para SPA
- HTTPS + SSL termination (en producción)

**Trade-off:**
- Configuración adicional (nginx.conf)
- Otra capa para debuggear

### 4. Estructura normalizada (categories + prompts separados)

**Por qué:**
- Escalabilidad: un día quizás sea multi-usuario
- Queries simples en el API
- Easier to add features (filtros, búsqueda)
- Sigue las prácticas de DB design

**Trade-off:**
- Frontend debe re-estructurar datos para mostrar
- Un poco más de lógica en React (enrichPrompts)

### 5. Docker Compose para deployment

**Por qué:**
- Portable (mismo setup en dev, staging, prod)
- Reproducible
- Simple vs Kubernetes
- Funciona en cualquier cloud (Fly, Railway, Digital Ocean App Platform)

**Trade-off:**
- Requiere Docker instalado
- Single machine (no escalado horizontal)
- Para multi-container en múltiples máquinas, necesitarías orquestación adicional

## Seguridad

### Consideraciones actuales

- ✅ API sin autenticación (single-user, en red local o privada)
- ⚠️ Sin HTTPS en desarrollo (necesario en producción)
- ✅ CORS habilitado solo para localhost
- ✅ Input validation mínima (mejorable)

### Para multi-usuario futuro

Si agregases autenticación:

```javascript
// En api/index.js
app.use("/api/*", authenticateUser); // Middleware

// Agregar userId a prompts
CREATE TABLE prompts (
  id TEXT,
  user_id TEXT,
  category_id TEXT,
  ...
  PRIMARY KEY (id, user_id)
);

// Queries filtradas por usuario
SELECT * FROM prompts WHERE user_id = ?
```

## Monitoring y observabilidad

### Health checks

API expondrá `GET /health`:
```json
{"status": "ok", "timestamp": "2026-03-15T..."}
```

Docker Compose lo monitorea automáticamente.

### Logs

```bash
# Frontend
docker-compose logs -f frontend

# API
docker-compose logs -f api
```

Para structured logging (producción):
```javascript
// api/index.js
console.log(JSON.stringify({timestamp: new Date(), level: "info", ...}))
```

### Métricas (futuro)

Agregar Prometheus endpoint:
```javascript
app.get("/metrics", (c) => {
  return c.text(prometheusMetrics());
})
```

## Performance

### Optimizaciones implementadas

1. **Índices en SQLite**
   ```sql
   CREATE INDEX idx_prompts_category ON prompts(category_id);
   CREATE INDEX idx_prompts_model ON prompts(model);
   ```

2. **WAL (Write-Ahead Logging)**
   ```javascript
   db.pragma("journal_mode = WAL"); // Mejor concurrencia
   ```

3. **Caché de assets estáticos (nginx)**
   ```
   location /static/ {
     expires 30d;
     Cache-Control: "public, immutable"
   }
   ```

4. **Health check lazy**
   - No health check intensivo en cada request
   - Solo verificar cada 10 segundos

### Escalabilidad (si necesarias)

1. **Más prompts (10k+)**
   → Agregar paginación: `GET /prompts?page=1&limit=50`

2. **Múltiples usuarios**
   → Agregar auth + `user_id` a las queries

3. **Mejor búsqueda**
   → FTS (Full Text Search) en SQLite

4. **Multi-instancia**
   → Migrar a PostgreSQL (shared DB) + múltiples API instances

## Migraciones de datos

Si en el futuro necesitas cambiar el schema:

### Estrategia

1. **Crear migration script**
   ```javascript
   // migrations/001-add-tags-column.js
   export function up(db) {
     db.exec("ALTER TABLE prompts ADD COLUMN tags TEXT;");
   }
   export function down(db) {
     // Rollback si es necesario
   }
   ```

2. **Ejecutar en deploy**
   ```bash
   # Antes de iniciar el API
   node migrations/run.js
   ```

3. **Versionar el schema**
   ```javascript
   const schemaVersion = 1; // Incrementar con cada migration
   db.pragma(`user_version = ${schemaVersion}`);
   ```

## Backup y recovery

### Backup

```bash
# Mientras corre docker-compose
docker cp $(docker-compose ps -q api):/app/data/cheatsheet.db ./backup-$(date +%Y%m%d-%H%M%S).db
```

### Restore

```bash
docker cp ./backup.db $(docker-compose ps -q api):/app/data/cheatsheet.db
docker-compose restart api
```

## Testing

### Niveles de test

1. **Unit tests (Components React)**
   ```bash
   cd mi-app && npm test
   ```

2. **Integration tests (API)**
   ```javascript
   // test/api.test.js
   import { describe, it } from "node:test";
   // Test con supertest
   ```

3. **E2E tests (Full stack)**
   ```bash
   # Con Cypress o Playwright
   npm run test:e2e
   ```

## Roadmap futuro

- [ ] Multi-user authentication
- [ ] Export/import de prompts (JSON)
- [ ] Sharing de prompts vía link
- [ ] Tags y categorías custom
- [ ] Full-text search
- [ ] Dark/light mode persistente
- [ ] Móvil (PWA)
- [ ] Webhooks para integración con otros tools
