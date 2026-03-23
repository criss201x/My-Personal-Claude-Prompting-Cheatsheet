# Deployment — Claude Cheatsheet

## Stack

- **Frontend:** React + nginx
- **Backend:** Node.js + Hono + SQLite
- **Database:** SQLite (file-based, persistent)
- **Container:** Docker + Docker Compose

## Estructura

```
.
├── mi-app/                 # React frontend
│   ├── public/
│   ├── src/
│   ├── Dockerfile.prod     # Build + nginx
│   ├── nginx.conf          # nginx config
│   └── package.json
├── api/                    # Node backend
│   ├── index.js            # Hono REST API
│   ├── db.js               # SQLite init
│   ├── data/               # SQLite file (persistent)
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Orquestación
└── .env.example            # Variables de entorno
```

## Quick Start (Docker Compose)

### 1. Build las imágenes

```bash
cd /path/to/claude_cheatsheet
docker-compose build
```

### 2. Iniciar los servicios

```bash
docker-compose up -d
```

Esto:
- Construye e inicia `frontend` (nginx en puerto 80)
- Construye e inicia `api` (Hono en puerto 3001)
- Crea un volumen persistente para SQLite

### 3. Acceder a la app

```
http://localhost
```

nginx proxea:
- `/` → React frontend
- `/api/*` → Node backend

### 4. Parar los servicios

```bash
docker-compose down
```

Nota: El volumen `db-data` persiste aunque pares los containers. Para borrarlo:

```bash
docker-compose down -v
```

## Logs

Ver logs de un servicio:

```bash
docker-compose logs -f frontend
docker-compose logs -f api
```

## Persistencia

**El archivo SQLite se guarda en:** `/app/data/cheatsheet.db` dentro del container, mapeado a un volumen Docker llamado `db-data`.

Para hacer backup:

```bash
docker cp $(docker-compose ps -q api):/app/data/cheatsheet.db ./cheatsheet.db.backup
```

Para restaurar:

```bash
docker cp ./cheatsheet.db.backup $(docker-compose ps -q api):/app/data/cheatsheet.db
docker-compose restart api
```

## Environment Variables

Crear un `.env` en la raíz:

```env
# En producción dentro del container
NODE_ENV=production
PORT=3001

# Si necesitas que el frontend apunte a un API remoto
REACT_APP_API_URL=https://api.example.com
```

## Health Checks

El `api` servicio tiene un health check integrado. Ver estado:

```bash
docker-compose ps
```

## Despliegue en Cloud

### Fly.io

1. Instalar CLI: `curl -L https://fly.io/install.sh | sh`
2. Crear app:
```bash
flyctl launch
```
3. Configurar `fly.toml`:
```toml
app = "claude-cheatsheet"

[build]
  context = "."

[env]
  PORT = "3001"
  NODE_ENV = "production"
```
4. Desplegar:
```bash
flyctl deploy
```

### Railway

1. Conectar repo a Railway
2. Railway auto-detecta `docker-compose.yml`
3. Desplegar con un push a main

### DigitalOcean App Platform

1. Conectar repo
2. Especificar `docker-compose.yml` como source
3. Railway maneja builds y deployment automáticamente

## Troubleshooting

### API no responde
```bash
docker-compose logs api
```

### Frontend no carga
- Revisar `docker-compose logs frontend`
- ¿nginx está corriendo? `curl -I http://localhost`

### SQLite corrupto
```bash
docker-compose down -v  # Borra DB
docker-compose up       # Reinicia (DB nueva vacía)
```

### Puerto 80 en uso
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "8080:80"  # Ahora accede via http://localhost:8080
```

## Monitoring

Ver recursos:
```bash
docker stats
```

Ver procesos:
```bash
docker-compose exec api ps aux
docker-compose exec frontend ps aux
```
