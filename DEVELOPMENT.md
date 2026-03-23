# Development — Claude Cheatsheet

## Requisitos

- **Node.js**: v20+ (para better-sqlite3)
- **npm**: v8+
- **Docker** (opcional, solo para producción)

## Setup local

### 1. Instalar dependencias

Frontend:
```bash
cd mi-app
npm install
```

Backend:
```bash
cd api
npm install
```

### 2. Ejecutar en desarrollo

**Terminal 1 — API:**
```bash
cd api
npm run dev
```

Corre en `http://localhost:3001` con hot-reload (`node --watch`).

**Terminal 2 — Frontend:**
```bash
cd mi-app
npm start
```

Corre en `http://localhost:3000` con hot-reload.

El frontend está configurado para apuntar a `http://localhost:3001` en desarrollo.

### 3. Acceder

```
http://localhost:3000
```

## Estructura de carpetas

```
mi-app/src/
├── App.js                # Componente principal
├── data/
│   └── prompts.js        # Datos estáticos (semilla)
└── index.js

api/
├── index.js              # API Hono
├── db.js                 # Inicialización SQLite
├── Dockerfile            # Para producción
└── data/
    └── cheatsheet.db     # SQLite (generado)
```

## API Endpoints

Todos los endpoints retornan JSON.

### GET /categories
Obtiene todas las categorías.

```bash
curl http://localhost:3001/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {"id": "learning", "label": "Aprendizaje", "icon": "◈", "color": "#00E5FF", "accent": "#003D45"},
    ...
  ]
}
```

### GET /prompts
Obtiene todos los prompts. Soporta filtros opcionales.

```bash
# Todos los prompts
curl http://localhost:3001/prompts

# Filtrar por categoría
curl "http://localhost:3001/prompts?categoryId=learning"

# Filtrar por modelo
curl "http://localhost:3001/prompts?model=Opus"
```

### POST /prompts
Crea un nuevo prompt.

```bash
curl -X POST http://localhost:3001/prompts \
  -H "Content-Type: application/json" \
  -d '{
    "id": "custom-id",
    "category_id": "learning",
    "title": "Mi prompt",
    "tag": "Custom",
    "prompt": "Este es el contenido del prompt",
    "tip": "Tip sobre cuándo usarlo",
    "model": "Sonnet 4.6"
  }'
```

### PUT /prompts/:id
Actualiza un prompt existente.

```bash
curl -X PUT http://localhost:3001/prompts/custom-id \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "learning",
    "title": "Título actualizado",
    "tag": "Custom",
    "prompt": "Nuevo contenido",
    "tip": "Nuevo tip",
    "model": "Opus 4.6"
  }'
```

### DELETE /prompts/:id
Elimina un prompt.

```bash
curl -X DELETE http://localhost:3001/prompts/custom-id
```

### POST /reset-defaults
Elimina todos los prompts (restaura a DB vacía).

```bash
curl -X POST http://localhost:3001/reset-defaults
```

### GET /health
Health check.

```bash
curl http://localhost:3001/health
```

## Database

SQLite se crea automáticamente en `api/data/cheatsheet.db`.

### Ver la BD (desarrollo)

Instalar sqlite3:
```bash
# macOS
brew install sqlite3

# Linux
sudo apt-get install sqlite3

# Windows
# Descargar desde https://www.sqlite.org/download.html
```

Conectarse:
```bash
cd api
sqlite3 data/cheatsheet.db
```

Ver tablas:
```sql
.tables
.schema categories
.schema prompts
SELECT COUNT(*) FROM prompts;
```

## Testing

### Test del API (con supertest)

Crear archivo `api/test.js`:

```javascript
import app from "./index.js";

// Mock del Hono app...
// Test con supertest (no implementado aún)
```

Para ahora, testing manual via curl o Postman.

## Environment Variables

Crear `.env` en la raíz:

```env
# Frontend
REACT_APP_API_URL=http://localhost:3001

# Backend
NODE_ENV=development
PORT=3001
```

En producción (Docker), usar variables en `docker-compose.yml`.

## Debugging

### React
```javascript
// En App.js
console.log("categories", categories);
console.log("prompts", prompts);
```

Abrir DevTools del navegador: `F12`

### Node API
```javascript
// En index.js
console.log("Request:", c.req.path, c.req.method);
```

Ver logs:
```bash
# En la terminal donde corre el API
```

Debugger:
```bash
node --inspect api/index.js
# Luego abrir chrome://inspect
```

## Commits

Antes de hacer commit:

```bash
# Revisar cambios
git status
git diff

# Confirmar tests pasan (si existen)
npm test

# Build de producción debe pasar
cd mi-app && npm run build
cd ../api && npm run build  # Si lo necesita
```

## Migraciones (en el futuro)

Si la estructura de la BD cambia:

1. Editar `api/db.js` con nuevas tablas/campos
2. Borrar `api/data/cheatsheet.db` (para desarrollo)
3. Reiniciar: `npm run dev`

En producción (Docker):
```bash
docker-compose down -v  # Borra volumen y BD
docker-compose up       # Reinicia con BD nueva
```
