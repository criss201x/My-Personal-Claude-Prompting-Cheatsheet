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

### Oracle Cloud Infrastructure (Always Free)

Despliegue $0 sobre VM Ampere ARM A1 (4 OCPU + 24 GB RAM) con Caddy + HTTPS automático.

**Pre-requisitos:**
- Cuenta Oracle Cloud (Always Free Eligible).
- Dominio apuntando a la IP pública de la VM (puede ser DuckDNS gratis).

**1. Provisionar VM**
- Console → *Compute* → *Instances* → **Create instance**.
- Image: Canonical Ubuntu 22.04. Shape: `VM.Standard.A1.Flex` (4 OCPU, 24 GB).
- Subir tu SSH pubkey, asignar IP pública.

**2. Abrir 80/443 (dos capas)**
- Security List de la subred: agregar Ingress TCP 80 y 443 desde `0.0.0.0/0`.
- Dentro de la VM:
  ```bash
  sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
  sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
  sudo netfilter-persistent save
  ```

**3. Apuntar el dominio**
Crear registro `A` `app.tudominio.com` → IP pública de la VM. Verificar con `dig app.tudominio.com` antes de continuar.

**4. Instalar Docker en la VM**
```bash
sudo apt update && sudo apt -y install ca-certificates curl gnupg git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=arm64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt update && sudo apt -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker ubuntu
exit  # reabrir SSH para que tome el grupo
```

**5. Clonar repo y configurar secretos**
```bash
git clone <url-del-repo> claude_cheatsheet
cd claude_cheatsheet
cp .env.prod.example .env.prod
# editar .env.prod con secretos reales:
#   POSTGRES_PASSWORD=$(openssl rand -base64 24)
#   ADMIN_PASSWORD=$(openssl rand -base64 24)
#   JWT_SECRET=$(openssl rand -hex 32)
#   DOMAIN=app.tudominio.com
nano .env.prod
```

**6. Levantar el stack con override de prod**
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod build
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d
docker compose logs -f caddy   # ver "certificate obtained successfully"
```

`docker-compose.prod.yml` agrega el servicio `caddy` (reverse proxy con TLS automático) y reemplaza los secretos del compose base con variables de `.env.prod`. La config de Caddy está en `Caddyfile`.

**7. Verificar**
```bash
curl -I https://app.tudominio.com           # 200 OK con cert válido
curl https://app.tudominio.com/api/health   # {"status":"ok",...}
```
Probar login en el browser con `ADMIN_USER`/`ADMIN_PASSWORD` y crear/editar prompts.

**8. Backups (cron)**
```bash
mkdir -p backups
crontab -e
# Agregar:
0 3 * * * cd /home/ubuntu/claude_cheatsheet && docker compose exec -T db pg_dump -U admin cheatsheet | gzip > backups/cheatsheet-$(date +\%F).sql.gz && find backups -mtime +7 -delete
```

**Updates posteriores:**
```bash
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

**Troubleshooting Oracle Cloud:**
- *"Out of capacity"* al crear instancia ARM: reintentar en otra región o más tarde (capacidad rotativa).
- *Caddy no obtiene cert*: verificar DNS propagado (`dig $DOMAIN`) y que TCP 80/443 estén abiertos en AMBAS capas (Security List + iptables).
- *App carga pero `/api/*` 404*: revisar `docker compose logs caddy` y `docker compose logs api`.

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
