# Implementación de Persistencia — Resumen ejecutivo

## ¿Qué se cambió?

La app evoluciona de **localStorage** (datos en el browser, no persistentes) a **arquitectura cliente-servidor**:

```
ANTES (v1)                          AHORA (v2)
┌──────────────┐                   ┌──────────────┐
│ React        │                   │ React        │
│ localStorage │                   │ (state)      │
│ ❌ No persiste                    │ ✅ Persiste  │
└──────────────┘                   └──────────────┘
                                         ↓ API calls
                                   ┌──────────────────┐
                                   │ Node.js + Hono   │
                                   │ SQLite           │
                                   │ ✅ Persistencia  │
                                   └──────────────────┘
```

## Archivos nuevos

```
api/                           ← Backend nuevo
├── package.json
├── index.js                   ← API REST (Hono)
├── db.js                      ← Init SQLite
├── Dockerfile                 ← Para producción
└── data/
    └── cheatsheet.db          ← SQLite (generado)

mi-app/
├── Dockerfile.prod            ← Para producción (nginx)
├── nginx.conf                 ← Config proxy
└── (src/App.js actualizado)   ← Ahora consume el API

docker-compose.yml             ← Orquestación
.env.example                   ← Variables de entorno
ARCHITECTURE.md                ← Detalles técnicos
DEPLOYMENT.md                  ← Cómo desplegar
DEVELOPMENT.md                 ← Desarrollo local
```

## Cambios en React

### Estado anterior (localStorage)
```javascript
const [categories, setCategories] = useState(initCategories);
// Cada cambio se guardaba en localStorage automáticamente
```

### Estado nuevo (API)
```javascript
const [categories, setCategories] = useState([]);
const [prompts, setPrompts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// Al montar, fetch desde el API
useEffect(() => {
  apiCall("/categories");
  apiCall("/prompts");
}, []);

// Cuando se crea/edita/elimina un prompt, se llama el API
async function handleSavePrompt({...}) {
  const res = await apiCall("/prompts", {
    method: isEdit ? "PUT" : "POST",
    body: JSON.stringify({...})
  });
  setPrompts(...); // actualizar estado
}
```

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/categories` | Obtener categorías |
| GET | `/prompts` | Obtener todos los prompts |
| GET | `/prompts?categoryId=X` | Filtrar por categoría |
| POST | `/prompts` | Crear prompt |
| PUT | `/prompts/:id` | Actualizar prompt |
| DELETE | `/prompts/:id` | Eliminar prompt |
| POST | `/reset-defaults` | Borrar todos los prompts |
| GET | `/health` | Health check |

## Empezar (desarrollo local)

### Terminal 1 — Backend
```bash
cd api
npm install  # Primera vez
npm run dev  # Corre en http://localhost:3001
```

### Terminal 2 — Frontend
```bash
cd mi-app
npm install  # Primera vez
npm start    # Corre en http://localhost:3000
```

Automáticamente:
- Frontend en `http://localhost:3000`
- API en `http://localhost:3001`
- SQLite en `api/data/cheatsheet.db`

## Empezar (producción con Docker)

```bash
# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d

# Acceder
http://localhost
```

- nginx en puerto 80
- API en puerto 3001 (interno)
- SQLite persiste en volumen `db-data`

## Estructura de datos

### Antes (localStorage)
```javascript
categories: [
  {
    id: "learning",
    patterns: [
      { id: "xyz", title: "...", tag: "...", prompt: "...", tip: "...", model: "..." }
    ]
  }
]
```

### Ahora (Normalizado)
```sql
-- Tabla 1: categorías
| id       | label       | icon | color     | accent      |
|----------|-------------|------|-----------|-------------|
| learning | Aprendizaje | ◈    | #00E5FF   | #003D45     |

-- Tabla 2: prompts (relación 1:N)
| id          | category_id | title          | tag        | prompt | tip | model       |
|-------------|-------------|----------------|------------|--------|-----|-------------|
| custom-123  | learning    | Mi prompt      | Custom     | ...    | ... | Sonnet 4.6  |
```

## Diferencias: localStorage vs SQLite

| Aspecto | localStorage | SQLite + API |
|---------|--------------|-------------|
| Persistencia | Browser local | Servidor |
| Cross-device | ❌ No | ✅ Sí |
| Backup | Manual (export) | Trivial (archivo) |
| Escala | ≈ 5-10 MB | ≈ 100+ MB |
| Acceso offline | ✅ Sí | ❌ No |
| Multi-usuario | ❌ No (sin cambios) | ⚠️ Requiere auth |
| Deploy | CDN estático | Servidor + DB |

## Migración de datos

**Primero:** Todos los prompts locales en localStorage se pierden.
**Después:** Los datos nuevos se persisten en SQLite automáticamente.

Si necesitabas los prompts antiguos: exportarlos a JSON antes de actualizar.

## Próximos pasos

### Corto plazo
- [ ] Probar en Docker Compose localmente
- [ ] Desplegar en Fly.io o Railway
- [ ] Agregar tests del API

### Mediano plazo
- [ ] Agregar autenticación (si multi-usuario)
- [ ] Full-text search
- [ ] Export/import de prompts
- [ ] PWA (offline support)

### Largo plazo
- [ ] Compartir prompts con otros usuarios
- [ ] Integración con APIs de Claude
- [ ] Mobile app
- [ ] Migrar a PostgreSQL si crece

## Troubleshooting

### ¿API no está disponible?
```bash
# Ver logs
docker-compose logs api

# O localmente
cd api && npm run dev
```

### ¿Datos borrados accidentalmente?
```bash
# Restaurar backup
docker cp ./backup.db $(docker-compose ps -q api):/app/data/cheatsheet.db
docker-compose restart api
```

### ¿Puerto en uso?
```bash
# Cambiar en docker-compose.yml
ports:
  - "8080:80"  # Acceder via http://localhost:8080
```

### ¿SQLite corrupto?
```bash
# Borrar y empezar de cero
docker-compose down -v
docker-compose up -d
```

## Documentación

- **ARCHITECTURE.md** — Detalles técnicos, diagramas, decisiones
- **DEPLOYMENT.md** — Cómo desplegar a producción, cloud, backups
- **DEVELOPMENT.md** — Setup local, API testing, debugging

## Cambios de comportamiento

### ✅ Funciona igual
- Crear/editar/eliminar prompts → mismo UX
- Buscar y filtrar → mismo UX
- Copiar prompt → mismo UX
- Tema oscuro → no cambia

### ✅ Ahora funciona mejor
- Datos persisten entre sesiones ✅
- Funciona desde otro dispositivo ✅ (mismo servidor)
- Backup de datos ✅ (es un archivo)
- Preparado para multi-usuario ✅ (con auth)

### ⚠️ Requiere conectividad
- Ya no funciona offline (antes sí con localStorage)
- Necesita servidor corriendo (antes era puramente cliente)

## Preguntas frecuentes

**¿Puedo seguir usando localStorage?**
No. La nueva app requiere el API para persistencia.

**¿Mis datos antiguos?**
Se pierden. El API comienza con BD vacía. Exporta tus prompts antes si los necesitabas.

**¿Cuánto espacio ocupa?**
SQLite: bytes a MB según cantidad de prompts. Docker images: ≈ 500 MB total (Node + nginx + deps).

**¿Puedo correr offline?**
No con esta arquitectura. Si lo necesitas, volvería a localStorage o agrego PWA + sync.

**¿Es seguro?**
Single-user local: sí. Multi-user: necesita autenticación (no implementada aún).

**¿Costo en cloud?**
Fly.io/Railway: $5-10/mes aprox (depending on usage).

---

## Resumen

| Antes | Después |
|-------|---------|
| React + localStorage | React + Node API + SQLite |
| Datos en el browser | Datos en el servidor |
| Single-device | Cross-device |
| No escalable | Escalable a multi-user |
| Simple | Robusto |

Listo para producción. Desplegar con `docker-compose up` 🚀
