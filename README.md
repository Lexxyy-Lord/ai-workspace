# AI Workspace

AI Workspace adalah aplikasi Node.js profesional untuk menjalankan workspace chat AI berbasis web. API key provider disimpan aman di backend dan seluruh konfigurasi utama dapat diatur lewat file `.env` tanpa perlu mengubah source code.

## Fitur

- Backend Express.js dengan struktur modular.
- UI chat responsif di folder `public/`.
- Integrasi provider `freeemodel.dev` melalui adapter OpenAI-compatible.
- Konfigurasi penuh lewat `.env`.
- Validasi environment dengan Zod.
- Logging terstruktur dengan Pino.
- Middleware keamanan dasar memakai Helmet dan CORS.
- Endpoint health check, konfigurasi publik, daftar model, dan chat completion.
- ESLint, Prettier, dan test bawaan Node.js.

## Struktur folder

```text
.
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── src/
│   ├── config/
│   │   ├── env.js
│   │   └── logger.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── providers/
│   │   └── freeemodelClient.js
│   ├── routes/
│   │   ├── chatRoutes.js
│   │   ├── configRoutes.js
│   │   └── healthRoutes.js
│   ├── services/
│   │   └── chatService.js
│   ├── validators/
│   │   └── chatValidator.js
│   └── server.js
├── test/
│   └── chatService.test.js
├── .env.example
├── .gitignore
├── eslint.config.js
├── package.json
└── README.md
```

## Menjalankan lokal

Pastikan memakai Node.js versi 20 atau lebih baru.

```bash
git clone https://github.com/Lexxyy-Lord/ai-workspace.git
cd ai-workspace
npm install
cp .env.example .env
npm run dev
```

Buka:

```text
http://localhost:3000
```

## Konfigurasi `.env`

Isi API key Anda di file `.env` lokal:

```env
FREEEMODEL_API_KEY=isi_api_key_anda
```

Konfigurasi penting lain:

```env
PORT=3000
CORS_ORIGIN=*
FREEEMODEL_BASE_URL=https://freeemodel.dev/api/v1
FREEEMODEL_CHAT_PATH=/chat/completions
FREEEMODEL_MODELS_PATH=/models
FREEEMODEL_MODEL=freeemodel-default
FREEEMODEL_TIMEOUT_MS=60000
FREEEMODEL_AUTH_HEADER=Authorization
FREEEMODEL_AUTH_PREFIX=Bearer
FREEEMODEL_EXTRA_HEADERS={}
AI_DEFAULT_TEMPERATURE=0.7
AI_DEFAULT_MAX_TOKENS=1024
AI_SYSTEM_PROMPT="You are a helpful, concise AI assistant."
```

Jika `freeemodel.dev` memakai header berbeda, ubah saja:

```env
FREEEMODEL_AUTH_HEADER=x-api-key
FREEEMODEL_AUTH_PREFIX=
```

## Endpoint API

### Health check

```http
GET /health
```

### Konfigurasi publik UI

```http
GET /api/config
```

Endpoint ini tidak membocorkan API key.

### Daftar model

```http
GET /api/models
```

### Chat

```http
POST /api/chat
Content-Type: application/json

{
  "message": "Halo, bantu saya buat ide konten.",
  "model": "freeemodel-default",
  "temperature": 0.7,
  "maxTokens": 1024
}
```

Contoh respons:

```json
{
  "provider": "freeemodel.dev",
  "model": "freeemodel-default",
  "message": "...",
  "raw": {}
}
```

## Script

```bash
npm run dev      # Jalankan server development dengan watch mode
npm start        # Jalankan server production
npm run lint     # Cek kualitas kode
npm run format   # Format kode
npm test         # Jalankan test
```

## Catatan keamanan

- Jangan commit file `.env`.
- API key hanya digunakan di backend.
- Frontend hanya membaca konfigurasi publik dari `/api/config`.
- Untuk production, set `NODE_ENV=production` dan batasi `CORS_ORIGIN` ke domain aplikasi Anda.

## Lisensi

MIT
