'use client';

import dynamic from 'next/dynamic';
import { Bot, Code2, FileCode2, Folder, History, KeyRound, Search, Settings, Shield, Terminal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const sampleFiles = [
  { name: 'backend/src/server.js', type: 'file' },
  { name: 'backend/src/api/routes/chatRoutes.js', type: 'file' },
  { name: 'frontend/app/page.tsx', type: 'file' },
  { name: 'docker-compose.yml', type: 'file' },
];

const tabs: Array<{ key: string; icon: LucideIcon; label: string }> = [
  { key: 'editor', icon: Code2, label: 'Editor' },
  { key: 'chat', icon: Bot, label: 'AI Chat' },
  { key: 'history', icon: History, label: 'History' },
  { key: 'settings', icon: Settings, label: 'Settings' },
];

const code = `module.exports = {
  help: ['example'],
  tags: ['ai'],
  command: ['example'],
  register: true,
  limit: false,
  async handler(m, { conn, text }) {
    await m.react('⏳')
    try {
      await conn.sendMessage(m.chat, { text: 'BETABOTZ-MD2 compatible plugin' }, { quoted: m })
      await m.react('✅')
    } catch (error) {
      await m.reply(String(error?.message || error))
      await m.react('⚠️')
    }
  }
}`;

export function WorkspaceShell() {
  const [activeTab, setActiveTab] = useState('editor');
  const statusItems = useMemo(
    () => [
      ['Backend', 'Express + Socket.IO'],
      ['Database', 'SQLite schema ready'],
      ['Auth', 'JWT + refresh session'],
      ['Provider', 'OpenAI-compatible'],
    ],
    [],
  );

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-8 md:px-8 xl:grid-cols-[280px_1fr_360px]">
      <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold"><Folder size={18} /> Explorer</h2>
          <button className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold">Upload ZIP</button>
        </div>
        <label className="mb-3 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-400">
          <Search size={16} />
          <input className="w-full bg-transparent outline-none" placeholder="Search file, regex, symbol" />
        </label>
        <div className="space-y-2 text-sm">
          {sampleFiles.map((file) => (
            <button key={file.name} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-slate-300 hover:bg-slate-800">
              <FileCode2 size={16} className="text-blue-300" /> {file.name}
            </button>
          ))}
        </div>
      </aside>

      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
        <div className="flex items-center gap-2 border-b border-slate-800 p-3">
          {tabs.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${activeTab === key ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
        {activeTab === 'editor' && (
          <div className="h-[560px] p-4">
            <MonacoEditor height="100%" defaultLanguage="javascript" theme="vs-dark" defaultValue={code} options={{ minimap: { enabled: true }, fontSize: 14, tabSize: 2, automaticLayout: true }} />
          </div>
        )}
        {activeTab === 'chat' && (
          <div className="grid h-[560px] grid-rows-[1fr_auto] p-4">
            <div className="space-y-4 overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="rounded-2xl bg-slate-800 p-4 text-sm leading-6 text-slate-200">
                Halo, saya AI Workspace. Saya bisa membaca project, mencari bug, membuat patch, generate plugin, dokumentasi, Dockerfile, test, dan CI.
              </div>
              <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-100">
                BETABOTZ-MD2 mode aktif untuk CommonJS handler, command array, Node.js 22, dan Baileys.
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <textarea className="min-h-24 flex-1 rounded-2xl border border-slate-800 bg-slate-950 p-4 outline-none focus:border-blue-500" placeholder="Tanya AI tentang workspace ini..." />
              <button className="rounded-2xl bg-blue-600 px-6 font-bold">Send</button>
            </div>
          </div>
        )}
        {activeTab === 'history' && <Panel icon={History} title="Conversation History" text="Semua percakapan tersimpan di SQLite dan dapat dibuka kembali per user/workspace." />}
        {activeTab === 'settings' && <Panel icon={KeyRound} title="API & Model Settings" text="User dapat menyimpan provider, base URL, API key, model, temperature, top_p, dan max tokens." />}
      </section>

      <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="mb-4 flex items-center gap-2 font-bold"><Shield size={18} /> System Status</h2>
        <div className="space-y-3">
          {statusItems.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 font-semibold text-slate-200">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
          <Terminal className="mb-2" size={18} /> Jalankan backend dengan <code>npm run dev:backend</code> dan frontend dengan <code>npm run dev:frontend</code>.
        </div>
      </aside>
    </section>
  );
}

function Panel({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex h-[560px] items-center justify-center p-8 text-center">
      <div className="max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-8">
        <Icon className="mx-auto mb-4 text-blue-300" size={36} />
        <h3 className="text-2xl font-black">{title}</h3>
        <p className="mt-3 leading-7 text-slate-400">{text}</p>
      </div>
    </div>
  );
}
