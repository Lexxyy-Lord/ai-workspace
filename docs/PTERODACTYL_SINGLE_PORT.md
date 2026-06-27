# Pterodactyl Single-Port Mode

Mode ini membuat backend Express melayani API, Socket.IO, dan frontend static Next.js dari satu port yang sama.

Contoh URL:

```text
http://apps1.vynzzhost.com:25664
```

## Environment Pterodactyl

Isi variable berikut di panel Pterodactyl atau file `.env`:

```env
NODE_ENV=production
APP_NAME="AI Workspace"
PUBLIC_FRONTEND_URL=http://apps1.vynzzhost.com:25664

API_HOST=0.0.0.0
API_PORT=25664
SINGLE_PORT_MODE=true
FRONTEND_DIST_DIR=../frontend/out
CORS_ORIGINS=http://apps1.vynzzhost.com:25664
TRUST_PROXY=false

FREEMODEL_API_KEY=isi_api_key_anda
FREEMODEL_BASE_URL=https://freemodel.dev/v1
FREEMODEL_CHAT_PATH=/chat/completions
FREEMODEL_MODELS_PATH=/models
FREEMODEL_AUTH_HEADER=Authorization
FREEMODEL_AUTH_PREFIX=Bearer

JWT_ACCESS_SECRET=ganti-dengan-random-panjang-minimal-32-karakter
JWT_REFRESH_SECRET=ganti-dengan-random-panjang-minimal-32-karakter
ADMIN_EMAIL=admin@example.local
ADMIN_PASSWORD=ganti-password-admin
ADMIN_NAME=Administrator

NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SOCKET_URL=
```

`NEXT_PUBLIC_API_URL` dan `NEXT_PUBLIC_SOCKET_URL` sengaja dikosongkan supaya frontend memakai same-origin, yaitu host dan port yang sama.

## Startup Command

Gunakan startup command ini:

```bash
npm install && npm run start:pterodactyl
```

Script `start:pterodactyl` akan menjalankan:

1. migrasi database SQLite,
2. seed admin,
3. build frontend static ke `frontend/out`,
4. start backend di port `25664`,
5. backend melayani frontend dari port yang sama.

## Akses

Buka:

```text
http://apps1.vynzzhost.com:25664
```

Health check:

```text
http://apps1.vynzzhost.com:25664/health
```

API:

```text
http://apps1.vynzzhost.com:25664/api
```
