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

// ─── Nav config ───────────────────────────────────────────────────────────────

type Page = "dashboard" | "users" | "movibers" | "baladas" | "events" | "rsvps";

const NAV: { id: Page; emoji: string; color: string }[] = [
  { id: "dashboard", emoji: "📊", color: "text-textSecondary" },
  { id: "users", emoji: "👤", color: "text-emerald-600" },
  { id: "movibers", emoji: "🎧", color: "text-primary" },
  { id: "baladas", emoji: "🏠", color: "text-blue-600" },
  { id: "events", emoji: "🎉", color: "text-amber-600" },
  { id: "rsvps", emoji: "✅", color: "text-rose-600" },
];

const PAGE_MAP: Record<Page, React.ReactNode> = {
  dashboard: <Dashboard />,
  users: <Users />,
  movibers: <Movibers />,
  baladas: <Baladas />,
  events: <Events />,
  rsvps: <Rsvps />,
};

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const { t } = useTranslation();
  const [page, setPage] = useState<Page>("dashboard");
  const [sideOpen, setSideOpen] = useState(false);

  return (
    <ThemeProvider defaultTheme="black-purple-premium">
      <div className="min-h-screen bg-background flex">
        {/* ── Mobile overlay ── */}
        {sideOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setSideOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`
            fixed top-0 left-0 h-full w-64 z-30
            flex flex-col transition-transform duration-300 ease-out
            ${sideOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
          style={{
            background: 'linear-gradient(180deg, var(--color-backgroundSecondary) 0%, var(--color-background) 100%)',
            borderRight: '1px solid var(--color-surfaceBorder)',
            boxShadow: '4px 0 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.08)',
          }}
        >
          {/* Glow overlay sutil no topo */}
          <div
            className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 120% 80% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)',
            }}
          />

          {/* Logo */}
          <div
            className="relative flex items-center gap-3 px-6 py-5"
            style={{
              background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-backgroundSecondary) 100%)',
              borderBottom: '1px solid var(--color-surfaceBorder)',
              boxShadow: 'inset 0 0 0 1px rgba(124,58,237,0.08)',
            }}
          >
            <div className="relative shrink-0">
              <img
                src="/logoMovibe.png"
                alt="Movibe Logo"
                className="w-10 h-10 rounded-2xl"
                style={{
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4), 0 0 24px rgba(124,58,237,0.4)',
                }}
              />
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)',
                  filter: 'blur(10px)',
                }}
              />
            </div>
            <div>
              <p className="text-base font-bold text-textPrimary leading-tight tracking-tight">
                Movibe
              </p>
              <p className="text-xs text-textTertiary mt-0.5">Admin Dashboard</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="relative flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV.map((n) => {
              const isActive = page === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => { setPage(n.id); setSideOpen(false); }}
                  className="group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left overflow-hidden"
                  style={
                    isActive
                      ? {
                          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                          color: '#ffffff',
                          boxShadow: '0 4px 20px rgba(124,58,237,0.4), inset 0 0 0 1px rgba(255,255,255,0.12)',
                        }
                      : {
                          color: 'var(--color-textSecondary)',
                        }
                  }
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surfaceHover) 100%)'
                      ;(e.currentTarget as HTMLElement).style.color = 'var(--color-textPrimary)'
                      ;(e.currentTarget as HTMLElement).style.boxShadow = 'inset 0 0 0 1px var(--color-surfaceBorder)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = ''
                      ;(e.currentTarget as HTMLElement).style.color = 'var(--color-textSecondary)'
                      ;(e.currentTarget as HTMLElement).style.boxShadow = ''
                    }
                  }}
                >
                  {/* Shimmer do item ativo */}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)',
                      }}
                    />
                  )}

                  {/* Barra lateral esquerda no item ativo */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
                      style={{
                        background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.4) 100%)',
                        boxShadow: '0 0 8px rgba(255,255,255,0.5)',
                      }}
                    />
                  )}

                  {/* Emoji */}
                  <span className={`text-lg transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                    {n.emoji}
                  </span>

                  {/* Label */}
                  <span className="relative z-10">{t('nav.' + n.id)}</span>

                  {/* Dot no item ativo */}
                  {isActive && (
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                      style={{
                        background: 'rgba(255,255,255,0.8)',
                        boxShadow: '0 0 6px rgba(255,255,255,0.6)',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div
            className="relative px-4 py-4"
            style={{
              background: 'linear-gradient(0deg, var(--color-backgroundSecondary) 0%, var(--color-surface) 100%)',
              borderTop: '1px solid var(--color-surfaceBorder)',
              boxShadow: 'inset 0 1px 0 rgba(124,58,237,0.08)',
            }}
          >
            <div className="space-y-2">
              <ThemeSelector />
              <LanguageSelector />
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
          {/* Topbar (mobile) */}
          <header className="lg:hidden flex items-center gap-4 bg-surface border-b border-surfaceBorder px-4 py-3 shadow-theme sticky top-0 z-10">
            <button
              onClick={() => setSideOpen(true)}
              className="p-1.5 rounded-lg hover:bg-surface transition"
            >
              <svg
                className="w-5 h-5 text-textSecondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <p className="text-sm font-bold text-textPrimary">
              {NAV.find((n) => n.id === page)?.emoji}{" "}
              {t('nav.' + page)}
            </p>
          </header>

          {/* Page content */}
          <main className="flex-1 p-8 lg:p-10 max-w-7xl w-full mx-auto">
            {PAGE_MAP[page]}
          </main>
        </div>
    </div>
    </ThemeProvider>
  );
}
