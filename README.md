# AI Workspace

AI Workspace adalah aplikasi production-ready berbasis monorepo untuk pengalaman kerja seperti gabungan Claude Code, Cursor, Windsurf, Open WebUI, dan VS Code Explorer.

Backend memakai Node.js 22, Express, Socket.IO, JWT, SQLite, Multer, Archiver, dan Adm-Zip. Frontend memakai Next.js, React, TailwindCSS, Monaco Editor, React Query, dan Zustand.

## Status

Roadmap resmi ada di GitHub Issue #2. Pengembangan dilakukan bertahap agar setiap tahap tetap bisa dijalankan.

Tahap saat ini menyediakan:

- Monorepo `backend/` dan `frontend/`.
- Backend Express modular dengan security baseline.
- SQLite schema untuk `users`, `workspaces`, `chat_history`, `settings`, `api_keys`, `sessions`, `logs`, dan `prompts`.
- JWT login, refresh session, admin seed, dan role middleware.
- Workspace manager API untuk create, rename, delete, tree, read/write file, create/rename/delete entry, upload ZIP, dan download ZIP.
- OpenAI-compatible provider abstraction dengan FreeModel.dev sebagai default.
- Socket.IO channel untuk workspace event.
- Next.js dashboard shell dengan Explorer, Monaco Editor, AI Chat, History, Settings, dan status panel.
- Dockerfile, Docker Compose, PM2 ecosystem, health check, ESLint, Prettier, dan test health endpoint.

## Struktur

```text
.
├── backend/
│   ├── src/
│   │   ├── ai/
│   │   ├── api/
│   │   ├── config/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── websocket/
│   │   └── workspace/
│   └── test/
├── frontend/
│   ├── app/
│   └── components/
├── data/
├── Dockerfile
├── docker-compose.yml
├── ecosystem.config.cjs
├── .env.example
└── package.json
```

## Instalasi Lokal

Syarat:

- Node.js 22+
- npm 10+

```bash
git clone https://github.com/Lexxyy-Lord/ai-workspace.git
cd ai-workspace
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

Frontend berjalan di `http://localhost:3001`.
Backend health check ada di `http://localhost:3000/health`.

## Konfigurasi FreeModel.dev

Isi di `.env`:

```env
FREEMODEL_API_KEY=isi_api_key_anda
FREEMODEL_BASE_URL=https://freemodel.dev/v1
FREEMODEL_CHAT_PATH=/chat/completions
FREEMODEL_MODELS_PATH=/models
FREEMODEL_AUTH_HEADER=Authorization
FREEMODEL_AUTH_PREFIX=Bearer
DEFAULT_AI_PROVIDER=freemodel
DEFAULT_AI_MODEL=gpt-4o-mini
```

Jika provider memakai header lain:

```env
FREEMODEL_AUTH_HEADER=x-api-key
FREEMODEL_AUTH_PREFIX=
```

## Script

```bash
npm run dev
npm run dev:backend
npm run dev:frontend
npm run build
npm start
npm run start:frontend
npm run start:pm2
npm run lint
npm test
npm run db:migrate
npm run db:seed
```

## Deploy Docker

```bash
cp .env.example .env
docker compose up -d --build
```

Port default:

- Backend: `3000`
- Frontend: `3001`

## Deploy VPS Linux dengan PM2

```bash
git clone https://github.com/Lexxyy-Lord/ai-workspace.git
cd ai-workspace
npm install
cp .env.example .env
npm run build
npm run db:migrate
npm run db:seed
npm run start:pm2
```

Gunakan reverse proxy:

- `/api` dan `/health` ke backend port `3000`.
- frontend ke port `3001`.

## Deploy Pterodactyl Panel

Startup command yang disarankan:

```bash
npm install && npm run db:migrate && npm run db:seed && npm run build && npm run start:pm2
```

Environment minimal:

```env
NODE_ENV=production
API_HOST=0.0.0.0
API_PORT={{SERVER_PORT}}
PUBLIC_FRONTEND_URL=https://domain-anda
CORS_ORIGINS=https://domain-anda
FREEMODEL_API_KEY=isi_api_key_anda
JWT_ACCESS_SECRET=ganti-dengan-random-panjang
JWT_REFRESH_SECRET=ganti-dengan-random-panjang
```

Jika hanya satu port tersedia, jalankan backend di port Pterodactyl dan letakkan frontend di reverse proxy atau deploy terpisah.

## Endpoint Utama

```http
GET /health
POST /api/auth/login
POST /api/auth/refresh
GET /api/auth/me
GET /api/workspaces
POST /api/workspaces
GET /api/workspaces/:workspaceId/tree
GET /api/workspaces/:workspaceId/file?path=...
PUT /api/workspaces/:workspaceId/file
POST /api/workspaces/:workspaceId/upload-zip
GET /api/workspaces/:workspaceId/download.zip
POST /api/chat
GET /api/chat/history
GET /api/chat/models
```

## Security Baseline

- Password di-hash dengan bcryptjs.
- JWT access token dan refresh session.
- Helmet, CORS allowlist, compression, rate limit.
- Upload ZIP dibatasi ukuran dari `.env`.
- File operation memakai safe workspace resolver.
- Secret dan token disensor dari log.
- `.env` diabaikan oleh Git.

## BETABOTZ-MD2 Mode

Mode ini diarahkan untuk project WhatsApp bot BETABOTZ-MD2:

- CommonJS plugin.
- `handler.help`, `handler.tags`, `handler.command` array.
- `handler.register = true`.
- Kompatibel Node.js 22 dan Baileys.
- Error dikembalikan ke user.
- React status `⏳`, `✅`, dan `⚠️`.

## Lisensi

MIT
