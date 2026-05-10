import { useState } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ThemeSelector } from "./components/ThemeSelector";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Movibers from "./pages/Movibers";
import Baladas from "./pages/Baladas";
import Events from "./pages/Events";
import Rsvps from "./pages/Rsvps";

// ─── Nav config ───────────────────────────────────────────────────────────────

type Page = "dashboard" | "users" | "movibers" | "baladas" | "events" | "rsvps";

const NAV: { id: Page; label: string; emoji: string; color: string }[] = [
  { id: "dashboard", label: "Dashboard", emoji: "📊", color: "text-textSecondary" },
  { id: "users", label: "Usuários", emoji: "👤", color: "text-emerald-600" },
  { id: "movibers", label: "Movibers", emoji: "🎧", color: "text-primary" },
  { id: "baladas", label: "Baladas", emoji: "🏠", color: "text-blue-600" },
  { id: "events", label: "Eventos", emoji: "🎉", color: "text-amber-600" },
  { id: "rsvps", label: "RSVPs", emoji: "✅", color: "text-rose-600" },
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
            fixed top-0 left-0 h-full w-64 bg-backgroundSecondary border-r border-surfaceBorder shadow-2xl z-30
            flex flex-col transition-all duration-300 ease-out
            ${sideOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:static lg:z-auto
          `}
          style={{
            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.06)'
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-surfaceBorder bg-surface bg-opacity-40 backdrop-blur-sm">
            <div className="relative">
              <img 
                src="/logoMovibe.png" 
                alt="Movibe Logo" 
                className="w-10 h-10 rounded-2xl shadow-lg"
                style={{
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), 0 0 20px rgba(124, 58, 237, 0.35)'
                }}
              />
              {/* Glow effect */}
              <div 
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, transparent 70%)',
                  filter: 'blur(8px)'
                }}
              />
            </div>
            <div className="flex flex-col">
              <p className="text-base font-bold text-textPrimary leading-tight tracking-tight">
                Movibe
              </p>
              <p className="text-xs text-textTertiary font-medium">Rules Service</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  setPage(n.id);
                  setSideOpen(false);
                }}
                className={`
                  group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 text-left
                  overflow-hidden
                  ${
                    page === n.id
                      ? "text-textInverse bg-primary bg-opacity-90 shadow-lg font-semibold"
                      : "text-textSecondary hover:text-textPrimary hover:bg-surface hover:bg-opacity-50 font-medium"
                  }
                `}
                style={{
                  boxShadow: page === n.id ? `0 4px 16px rgba(124, 58, 237, 0.25), inset 0 0 0 1px rgba(124, 58, 237, 0.2)` : 'none'
                }}
              >
                {/* Active indicator glow */}
                {page === n.id && (
                  <div 
                    className="absolute inset-0 rounded-xl opacity-30"
                    style={{
                      background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3) 0%, transparent 50%)',
                      filter: 'blur(12px)'
                    }}
                  />
                )}
                
                {/* Icon */}
                <span className={`
                  text-lg transition-all duration-200
                  ${page === n.id ? 'scale-110' : 'group-hover:scale-105'}
                `}>
                  {n.emoji}
                </span>
                
                {/* Label */}
                <span className="relative z-10 font-medium">{n.label}</span>
                
                {/* Active dot */}
                {page === n.id && (
                  <div 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-primary"
                    style={{
                      boxShadow: '0 0 8px rgba(124, 58, 237, 0.6)'
                    }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-surfaceBorder bg-surface bg-opacity-40 backdrop-blur-sm">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-textTertiary font-mono bg-surface bg-opacity-60 px-2 py-1 rounded-lg">
                  :8080 → proxy :5173
                </p>
              </div>
              <ThemeSelector />
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="flex-1 flex flex-col min-w-0">
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
              {NAV.find((n) => n.id === page)?.label}
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
