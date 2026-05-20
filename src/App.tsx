import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from "./contexts/ThemeContext";
import { ThemeSelector } from "./components/ThemeSelector";
import { LanguageSelector } from "./components/LanguageSelector";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Movibers from "./pages/Movibers";
import Baladas from "./pages/Baladas";
import Events from "./pages/Events";
import Rsvps from "./pages/Rsvps";

// ─── Nav config ───────────────────────────────────────────────────────

type Page = "dashboard" | "users" | "movibers" | "baladas" | "events" | "rsvps";

const NAV: { id: Page; emoji: string; color: string; label?: string }[] = [
  { id: "dashboard", emoji: "📊", color: "text-textSecondary", label: "dashboard" },
  { id: "users", emoji: "👤", color: "text-emerald-600" },
  { id: "movibers", emoji: "🎧", color: "text-primary" },
  { id: "baladas", emoji: "🏠", color: "text-blue-600" },
  { id: "events", emoji: "🎉", color: "text-amber-600" },
  { id: "rsvps", emoji: "✅", color: "text-purple-600", label: "usersEvents" },
];

const PAGE_MAP: Record<Page, React.ReactNode> = {
  dashboard: <Dashboard />,
  users: <Users />,
  movibers: <Movibers />,
  baladas: <Baladas />,
  events: <Events />,
  rsvps: <Rsvps />,
};

// ─── App ──────────────────────────────────────────────────────────────

export default function App() {
  const { t } = useTranslation();
  const [page, setPage] = useState<Page>("dashboard");
  const [sideOpen, setSideOpen] = useState(false);

  return (
    <ThemeProvider defaultTheme="black-purple-premium">
      {/* Adicionado h-screen e overflow-hidden para travar o fundo e liberar o scroll interno */}
      <div className="h-screen w-screen bg-background flex overflow-hidden">

        {/* ── Mobile overlay ── */}
        {sideOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSideOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`
            fixed top-0 left-0 h-screen w-16 hover:w-64 z-50
            flex flex-col transition-all duration-300 ease-in-out group overflow-hidden
            ${sideOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            bg-zinc-950 border-r border-purple-900/30 text-zinc-400
            shadow-[4px_0_24px_rgba(0,0,0,0.8)] hover:shadow-[8px_0_32px_rgba(147,51,234,0.15)]
          `}
        >
          {/* Logo Section */}
          <div className="relative flex items-center gap-3 px-4 py-5 shrink-0">
            <div className="relative shrink-0">
              <img
                src="/logoMovibe.png"
                alt="Movibe Logo"
                className="w-10 h-10 rounded-2xl relative z-10"
              />
              <div className="absolute inset-0 rounded-2xl bg-purple-600/30 blur-lg" />
            </div>
            <p className="text-base font-bold text-textPrimary tracking-tight opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Movibe</p>
          </div>

          {/* Nav - Scrollable */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            {NAV.map((n) => {
              const isActive = page === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => { setPage(n.id); setSideOpen(false); }}
                  className="relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                  style={isActive ? {
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                    color: '#ffffff',
                    boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
                  } : { color: 'var(--color-textSecondary)' }}
                >
                  <span className="text-lg shrink-0">{n.emoji}</span>
                  <span className="truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">{t('nav.' + (n.label || n.id))}</span>
                  {isActive && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
                </button>
              );
            })}
          </nav>

          {/* Footer - Static */}
          <div className="p-4 border-t border-purple-900/30 bg-zinc-950/50">
            <div className="space-y-2">
              <ThemeSelector />
              <LanguageSelector />
            </div>
          </div>
        </aside>

        {/* ── Main Content Container ── */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-16 h-full relative">

          {/* Topbar (mobile) */}
          <header className="lg:hidden flex items-center gap-4 bg-surface/80 backdrop-blur-md border-b border-surfaceBorder px-4 py-3 sticky top-0 z-30">
            <button
              onClick={() => setSideOpen(true)}
              className="p-2 rounded-xl bg-backgroundSecondary"
            >
              <svg className="w-5 h-5 text-textPrimary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-bold text-textPrimary text-sm uppercase tracking-widest">
              {t('nav.' + page)}
            </span>
          </header>

          {/* Page content - Agora com scroll independente e sem largura máxima travada */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-10">
            <div className="mx-auto w-full max-w-[1600px]"> {/* Max-width aumentado para dashboards largos */}
              {PAGE_MAP[page]}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}