# Despliegue — Goals Ec

Guía para publicar el sitio en el servidor Hetzner (Ubuntu) con dominio **goalsec.com**.

- **IP del servidor:** `178.104.110.210`
- **Dominio:** `goalsec.com` (DNS en Namecheap)
- **Stack:** Next.js 15 + Prisma + PostgreSQL + Caddy (HTTPS automático) + PM2

---

## 0. DNS (Namecheap) — hacer primero

En Namecheap → Domain List → goalsec.com → **Advanced DNS**, crea:

| Type     | Host | Value             |
|----------|------|-------------------|
| A Record | `@`  | `178.104.110.210` |
| A Record | `www`| `178.104.110.210` |

Espera a que `nslookup goalsec.com` devuelva la IP antes de pedir el certificado SSL (paso 6).

---

## 1. Conectarse al servidor

Desde tu PC (PowerShell):

```powershell
ssh root@178.104.110.210
```

(Usa la clave SSH que registraste en Hetzner.)

---

## 2. Preparar el sistema

```bash
apt update && apt upgrade -y

# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs git

# PostgreSQL
apt install -y postgresql postgresql-contrib

# PM2 (gestor de procesos) y Caddy (servidor web + HTTPS)
npm install -g pm2
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy
```

### Swap (recomendado con 4 GB de RAM, evita que falle el build)

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## 3. Crear la base de datos

```bash
sudo -u postgres psql
```

Dentro de `psql` (cambia la contraseña por una segura):

```sql
CREATE DATABASE curiosidades;
CREATE USER goals WITH PASSWORD 'PON_UNA_CLAVE_SEGURA';
GRANT ALL PRIVILEGES ON DATABASE curiosidades TO goals;
ALTER DATABASE curiosidades OWNER TO goals;
\q
```

---

## 4. Clonar y configurar la app

```bash
mkdir -p /var/www && cd /var/www
git clone <URL_DE_TU_REPO> goals   # o sube los archivos por scp/rsync
cd goals

npm install
```

Crea el archivo de entorno de producción:

```bash
nano .env
```

Contenido (ajusta la contraseña de la BD y el secreto):

```env
DATABASE_URL="postgresql://goals:PON_UNA_CLAVE_SEGURA@localhost:5432/curiosidades?schema=public"
NEXT_PUBLIC_SITE_URL="https://goalsec.com"
NEXT_PUBLIC_SITE_NAME="Goals Ec"
ADMIN_SESSION_SECRET="GENERA_UNO_NUEVO_LARGO_Y_ALEATORIO"
```

> Genera un secreto con: `openssl rand -hex 32`

---

## 5. Migrar BD, compilar y arrancar

```bash
npx prisma db push          # crea las tablas
npm run admin:create -- admin@goals.ec TU_CLAVE "Administrador"   # crea el admin

npm run build               # compila para producción
pm2 start "npm run start" --name goals
pm2 save
pm2 startup                 # ejecuta la línea que imprime para autoarranque
```

La app queda escuchando en `localhost:3000`.

---

## 6. Caddy (dominio + HTTPS automático)

```bash
nano /etc/caddy/Caddyfile
```

Reemplaza el contenido por:

```
goalsec.com, www.goalsec.com {
    encode gzip
    reverse_proxy localhost:3000
}
```

Reinicia Caddy (pide el certificado SSL solo, gratis):

```bash
systemctl reload caddy
```

Visita **https://goalsec.com** — debería cargar con candado verde. ✅

---

## 7. Firewall (opcional pero recomendado)

```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable
```

---

## Actualizar el sitio (deploys futuros)

```bash
cd /var/www/goals
git pull
npm install
npx prisma db push      # solo si cambió el esquema
npm run build
pm2 restart goals
```

---

## Backups

- **Base de datos** (diario, ejemplo con cron):
  ```bash
  pg_dump -U goals curiosidades > /root/backup-$(date +\%F).sql
  ```
- **Imágenes subidas:** respalda la carpeta `/var/www/goals/public/uploads`.
- O usa **snapshots de Hetzner** (~$1/mes) para respaldar todo el servidor.

---

## Notas

- Las imágenes subidas se guardan en `public/uploads` (disco del servidor). No están en la BD: inclúyelas en los backups.
- Para correr en producción se usa `npm run start` (no `next dev`), gestionado por PM2.
- Si cambias `.env`, reinicia con `pm2 restart goals`.
