import { Activity, Bot, Database, FolderGit2, KeyRound, PanelsTopLeft, ShieldCheck, TerminalSquare } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';

const features = [
  { icon: FolderGit2, title: 'Workspace Manager', text: 'Upload ZIP, explorer, editor, download, clone, rename, dan delete workspace.' },
  { icon: Bot, title: 'AI Coding Agent', text: 'Provider abstraction untuk FreeModel.dev dan OpenAI-compatible API.' },
  { icon: TerminalSquare, title: 'BETABOTZ-MD2 Mode', text: 'Mode khusus CommonJS, handler, plugin, command, Baileys, dan Node.js 22.' },
  { icon: ShieldCheck, title: 'Security Baseline', text: 'JWT, hashed password, CORS, Helmet, rate limit, upload limit, dan path safety.' },
  { icon: Database, title: 'SQLite Memory', text: 'User, workspace, chat history, settings, API provider, session, logs, dan prompt library.' },
  { icon: PanelsTopLeft, title: 'Cursor-like UI', text: 'Explorer, Monaco editor, chat, settings, model manager, dan logs.' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="border-b border-slate-800 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,.28),transparent_30rem)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 md:px-8 lg:flex-row lg:items-center lg:py-14">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200">
              <Activity size={16} /> Production AI Workspace
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight md:text-6xl">Claude Code / Cursor Clone untuk VPS & Pterodactyl</h1>
              <p className="text-lg leading-8 text-slate-300">
                Workspace AI modular dengan backend Express, Socket.IO, JWT, SQLite, dan frontend Next.js + Tailwind + Monaco Editor.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="rounded-full bg-slate-900 px-4 py-2 ring-1 ring-slate-700">Node.js 22+</span>
              <span className="rounded-full bg-slate-900 px-4 py-2 ring-1 ring-slate-700">FreeModel.dev</span>
              <span className="rounded-full bg-slate-900 px-4 py-2 ring-1 ring-slate-700">Docker Ready</span>
              <span className="rounded-full bg-slate-900 px-4 py-2 ring-1 ring-slate-700">Monorepo</span>
            </div>
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            {features.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/20 backdrop-blur">
                <item.icon className="mb-4 text-blue-300" size={24} />
                <h2 className="font-bold text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <WorkspaceShell />
    </main>
  );
}
