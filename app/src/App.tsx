import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { DashboardPage } from "@/pages/dashboard";
import { ProjectsPage } from "@/pages/projects";
import { MandorsPage } from "@/pages/mandors";
import { SpksPage } from "@/pages/spks";
import { OpnamePage } from "@/pages/opname";
import { KasbonsPage } from "@/pages/kasbons";
import { Landing } from "@/pages/landing";
import { ErrorBoundary } from "@/components/error-boundary";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FolderKanban, HardHat, FileSignature, Ruler, Wallet } from "lucide-react";

export type NavKey = "dashboard" | "projects" | "mandors" | "spks" | "opname" | "kasbons";

const NAV: { key: NavKey; path: string; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "projects", path: "/proyek", label: "Proyek", icon: FolderKanban },
  { key: "mandors", path: "/mandor", label: "Mandor", icon: HardHat },
  { key: "spks", path: "/spk", label: "SPK", icon: FileSignature },
  { key: "opname", path: "/opname", label: "Opname", icon: Ruler },
  { key: "kasbons", path: "/kasbon", label: "Kasbon", icon: Wallet },
];

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 60_000, gcTime: 10 * 60_000 } },
});

function Shell() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink md:flex-row">
      <aside className="hidden w-60 flex-col border-r border-rule bg-sheet md:flex">
        <div className="border-b border-rule px-6 py-5">
          <p className="text-xl font-extrabold tracking-tight text-ink">
            GAS<span className="text-survey">opname</span>
          </p>
          <p className="mt-0.5 text-xs text-ink-soft">Sistem opname konstruksi</p>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                  isActive ? "bg-survey/10 text-survey" : "text-ink-soft hover:bg-paper hover:text-ink",
                )
              }
            >
              <item.icon className="h-4.5 w-4.5" aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-rule px-6 py-3 text-[11px] text-ink-soft">
          Lembar kerja mingguan
        </div>
      </aside>
      <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-rule bg-sheet pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium transition-colors",
                isActive ? "text-survey" : "text-ink-soft",
              )
            }
          >
            <item.icon className="h-5 w-5" aria-hidden />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 md:px-10 md:py-8 pb-24 md:pb-8">
        <ErrorBoundary>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage onNavigate={(k) => navigate(NAV.find((n) => n.key === k)!.path)} />} />
            <Route path="/proyek" element={<ProjectsPage />} />
            <Route path="/mandor" element={<MandorsPage />} />
            <Route path="/spk" element={<SpksPage />} />
            <Route path="/opname" element={<OpnamePage />} />
            <Route path="/kasbon" element={<KasbonsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<Shell />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" theme="light" />
    </QueryClientProvider>
  );
}
