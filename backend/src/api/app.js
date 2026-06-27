import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { createProvider } from '../ai/providerFactory.js';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler.js';
import { authRoutes } from './routes/authRoutes.js';
import { chatRoutes } from './routes/chatRoutes.js';
import { healthRoutes } from './routes/healthRoutes.js';
import { workspaceRoutes } from './routes/workspaceRoutes.js';

const frontendDistDir = resolve(process.cwd(), process.env.FRONTEND_DIST_DIR || './frontend/out');
const singlePortMode = process.env.SINGLE_PORT_MODE !== 'false';

const fallbackHtml = `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AI Workspace</title>
  <style>
    :root{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#020617;color:#e5e7eb;color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at top left,rgba(37,99,235,.28),transparent 32rem),#020617}.wrap{width:min(1100px,calc(100% - 28px));margin:0 auto;padding:28px 0}.hero{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:18px}.badge{display:inline-flex;border:1px solid #2563eb66;background:#1d4ed81f;color:#bfdbfe;border-radius:999px;padding:8px 12px;font-size:13px;font-weight:800}h1{font-size:clamp(34px,9vw,72px);line-height:.95;margin:14px 0 12px}.desc{color:#cbd5e1;line-height:1.7;max-width:760px}.status{border:1px solid #334155;background:#0f172a;border-radius:999px;padding:10px 14px;color:#cbd5e1;white-space:nowrap}.grid{display:grid;grid-template-columns:290px 1fr;gap:16px}.panel{border:1px solid #1f2937;background:#0f172acc;border-radius:22px;box-shadow:0 30px 80px #0008;overflow:hidden}.side{padding:16px}.side h2{margin:0 0 12px}.item{border:1px solid #1f2937;background:#020617;border-radius:14px;padding:12px;margin-bottom:10px;color:#cbd5e1}.chat{display:grid;grid-template-rows:1fr auto;min-height:620px}.messages{padding:16px;overflow:auto}.msg{max-width:88%;border:1px solid #334155;background:#111827;border-radius:18px;padding:14px 16px;margin:0 0 12px;white-space:pre-wrap;line-height:1.6}.msg.user{margin-left:auto;background:#1d4ed8;color:white}.msg.error{border-color:#ef4444;color:#fecaca}.composer{display:grid;grid-template-columns:1fr auto;gap:12px;border-top:1px solid #1f2937;padding:14px}textarea,input{width:100%;border:1px solid #334155;background:#020617;color:#f8fafc;border-radius:14px;padding:12px;outline:none}textarea{min-height:92px;resize:vertical}button{border:0;background:#2563eb;color:white;border-radius:14px;padding:12px 18px;font-weight:900;cursor:pointer}button:disabled{opacity:.55;cursor:not-allowed}.small{font-size:12px;color:#94a3b8;line-height:1.6}code{background:#020617;border:1px solid #1f2937;border-radius:8px;padding:2px 6px}@media(max-width:850px){.hero,.grid{display:block}.status{display:inline-block;margin-top:12px}.side{margin-bottom:16px}.composer{grid-template-columns:1fr}.msg{max-width:100%}}
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <div>
        <span class="badge">Single Port Pterodactyl</span>
        <h1>AI Workspace</h1>
        <p class="desc">Aplikasi sedang berjalan dari satu port. Backend Express melayani halaman ini, API, health check, dan chat FreeModel.dev dari tempat yang sama.</p>
      </div>
      <div id="status" class="status">Checking...</div>
    </section>
    <section class="grid">
      <aside class="panel side">
        <h2>Settings</h2>
        <div class="item"><b>API</b><br><span class="small">Same-origin <code>/api/public/chat</code></span></div>
        <label class="small">Model</label>
        <input id="model" value="${env.DEFAULT_AI_MODEL}" />
        <p class="small">Pastikan <code>FREEMODEL_API_KEY</code> sudah diisi di file <code>.env</code> atau environment panel.</p>
        <div class="item"><b>Health</b><br><span class="small"><a href="/health">/health</a></span></div>
      </aside>
      <section class="panel chat">
        <div id="messages" class="messages"></div>
        <form id="form" class="composer">
          <textarea id="prompt" placeholder="Tulis pesan untuk AI..." required></textarea>
          <button id="send" type="submit">Kirim</button>
        </form>
      </section>
    </section>
  </main>
  <script>
    const messages = document.querySelector('#messages');
    const form = document.querySelector('#form');
    const promptInput = document.querySelector('#prompt');
    const modelInput = document.querySelector('#model');
    const send = document.querySelector('#send');
    const status = document.querySelector('#status');
    const history = [];
    function add(role, text){const el=document.createElement('div');el.className='msg '+role;el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight;}
    async function health(){try{const r=await fetch('/health');status.textContent=r.ok?'Online':'Health error'}catch{status.textContent='Offline'}}
    form.addEventListener('submit', async (e)=>{e.preventDefault();const text=promptInput.value.trim();if(!text)return;promptInput.value='';add('user',text);send.disabled=true;send.textContent='Memproses...';try{const res=await fetch('/api/public/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,messages:history,model:modelInput.value.trim()})});const data=await res.json();if(!res.ok)throw new Error(data?.error?.message||data?.message||'Gagal memanggil AI');const answer=data.message||'(respons kosong)';add('assistant',answer);history.push({role:'user',content:text},{role:'assistant',content:answer});}catch(err){add('error',err.message)}finally{send.disabled=false;send.textContent='Kirim'}});
    add('assistant','Halo! Saya siap menggunakan FreeModel.dev. Tulis pesan kamu di bawah.');
    health();
  </script>
</body>
</html>`;

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (env.CORS_ORIGINS.includes('*')) return true;
  return env.CORS_ORIGINS.includes(origin);
};

const shouldServeFrontend = (path) =>
  singlePortMode &&
  !path.startsWith('/api') &&
  !path.startsWith('/health') &&
  !path.startsWith('/socket.io');

const extractAssistantMessage = (completion) => {
  if (completion?.choices?.[0]?.message?.content) return completion.choices[0].message.content;
  if (completion?.choices?.[0]?.text) return completion.choices[0].text;
  if (completion?.message) return completion.message;
  if (completion?.content) return completion.content;
  return '';
};

export const createApp = () => {
  const app = express();

  if (env.TRUST_PROXY) app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());
  app.use(
    cors({
      origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
      credentials: true,
    }),
  );
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use(pinoHttp({ logger }));

  app.use('/health', healthRoutes);

  app.post('/api/public/chat', async (req, res, next) => {
    try {
      const message = String(req.body?.message || '').trim();
      if (!message) return res.status(400).json({ error: { message: 'Message wajib diisi.' } });

      const provider = createProvider({ provider: req.body?.provider || env.DEFAULT_AI_PROVIDER });
      const history = Array.isArray(req.body?.messages) ? req.body.messages : [];
      const messages = [
        { role: 'system', content: req.body?.systemPrompt || env.DEFAULT_SYSTEM_PROMPT },
        ...history.filter((item) => item && typeof item.content === 'string' && ['user', 'assistant', 'system'].includes(item.role)),
        { role: 'user', content: message },
      ];
      const completion = await provider.chat({
        model: req.body?.model || env.DEFAULT_AI_MODEL,
        messages,
        temperature: Number(req.body?.temperature ?? env.DEFAULT_AI_TEMPERATURE),
        top_p: Number(req.body?.topP ?? env.DEFAULT_AI_TOP_P),
        max_tokens: Number(req.body?.maxTokens ?? env.DEFAULT_AI_MAX_TOKENS),
        stream: false,
      });
      return res.json({ message: extractAssistantMessage(completion), raw: completion });
    } catch (error) {
      return next(error);
    }
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/workspaces', workspaceRoutes);

  if (singlePortMode && existsSync(frontendDistDir)) {
    app.use(express.static(frontendDistDir, { index: 'index.html' }));
  }

  app.get('*', (req, res, next) => {
    if (!shouldServeFrontend(req.path)) return next();
    const indexFile = join(frontendDistDir, 'index.html');
    if (existsSync(indexFile)) return res.sendFile(indexFile);
    return res.type('html').send(fallbackHtml);
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
