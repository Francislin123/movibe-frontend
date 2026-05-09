import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Movibers from "./pages/Movibers";
import Baladas from "./pages/Baladas";
import Events from "./pages/Events";
import Rsvps from "./pages/Rsvps";

// ─── Nav config ───────────────────────────────────────────────────────────────

type Page = "dashboard" | "users" | "movibers" | "baladas" | "events" | "rsvps";

const NAV: { id: Page; label: string; emoji: string; color: string }[] = [
  { id: "dashboard", label: "Dashboard", emoji: "📊", color: "text-slate-600" },
  { id: "users", label: "Usuários", emoji: "👤", color: "text-emerald-600" },
  { id: "movibers", label: "Movibers", emoji: "🎧", color: "text-violet-600" },
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
    <div className="min-h-screen bg-slate-50 flex">
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
          fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-100 shadow-sm z-30
          flex flex-col transition-transform duration-200
          ${sideOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow">
            M
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">
              Movibe
            </p>
            <p className="text-xs text-gray-400">Rules Service</p>
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
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left
                ${
                  page === n.id
                    ? "bg-violet-50 text-violet-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <span className="text-base">{n.emoji}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-mono">:8080 → proxy :5173</p>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar (mobile) */}
        <header className="lg:hidden flex items-center gap-4 bg-white border-b border-gray-100 px-4 py-3 shadow-sm sticky top-0 z-10">
          <button
            onClick={() => setSideOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <svg
              className="w-5 h-5 text-gray-600"
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
          <p className="text-sm font-bold text-gray-800">
            {NAV.find((n) => n.id === page)?.emoji}{" "}
            {NAV.find((n) => n.id === page)?.label}
          </p>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
          {PAGE_MAP[page]}
        </main>
      </div>
    </div>
  );
}
