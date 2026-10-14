import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, rp } from "@/lib/api";
import type { Project, Spk } from "@/lib/types";
import type { NavKey } from "@/App";
import { HardHat } from "lucide-react";

interface DashTotals {
  total_spk: number;
  total_opname: number;
  total_retensi: number;
  total_realisasi: number;
  sisa_spk: number;
  total_kasbon: number;
}
interface DashSpk extends Spk { opname_cum: number; realisasi: number }
interface DashProject extends Project { vol_kontrak: number; vol_opname: number }
interface Dash {
  totals: DashTotals;
  spks: DashSpk[];
  projects: DashProject[];
  mandorKasbon: { id: number; name: string; total: number }[];
}

export function DashboardPage({ onNavigate }: { onNavigate: (k: NavKey) => void }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<Dash>("/api/dashboard"),
  });
  const spks = data?.spks ?? [];
  const totals = data?.totals;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-pretty">Dashboard</h1>
        <p className="text-sm text-ink-soft">Ringkasan uang dan progres semua paket</p>
      </header>

      {isLoading ? (
        <p className="text-sm text-ink-soft" aria-live="polite">Memuat ringkasan…</p>
      ) : isError ? (
        <p className="text-sm text-marker" role="alert">Gagal memuat data. Coba muat ulang halaman.</p>
      ) : (
        <>
          <section>
            <h2 className="mb-3 text-sm font-semibold">Ringkasan uang</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard label="Total nilai SPK" value={rp(totals?.total_spk ?? 0)} onClick={() => onNavigate("spks")} />
              <StatCard label="Total opname" value={rp(totals?.total_opname ?? 0)} onClick={() => onNavigate("opname")} />
              <StatCard label="Retensi tertahan" value={rp(totals?.total_retensi ?? 0)} onClick={() => onNavigate("opname")} />
              <StatCard label="Realisasi terbayar" value={rp(totals?.total_realisasi ?? 0)} onClick={() => onNavigate("opname")} />
              <StatCard label="Sisa nilai SPK" value={rp(totals?.sisa_spk ?? 0)} onClick={() => onNavigate("spks")} />
              <StatCard label="Total kasbon" value={rp(totals?.total_kasbon ?? 0)} onClick={() => onNavigate("kasbons")} />
            </div>
          </section>

          <section className="border border-rule bg-sheet">
            <div className="flex items-center justify-between border-b border-rule px-5 py-3">
              <h2 className="text-sm font-semibold">Progres per paket</h2>
              <Button size="sm" variant="ghost" onClick={() => onNavigate("projects")} className="text-survey hover:bg-survey/10 hover:text-survey">
                Kelola proyek
              </Button>
            </div>
            <div className="p-5">
              {(data?.projects ?? []).length === 0 ? (
                <p className="text-sm text-ink-soft">Belum ada proyek. Buat proyek dulu di menu Proyek.</p>
              ) : (
                <div className="space-y-4">
                  {(data?.projects ?? []).map((pr) => {
                    const pct = pr.vol_kontrak > 0 ? Math.min(100, Math.round((pr.vol_opname / pr.vol_kontrak) * 100)) : 0;
                    return (
                      <button key={pr.id} onClick={() => onNavigate("projects")} className="block w-full text-left">
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium">{pr.name}</span>
                          <span className="font-mono tabular-nums text-ink-soft">{pct}%</span>
                        </div>
                        <Progress value={pct} className="h-2.5" />
                        <p className="mt-1 text-xs text-ink-soft">
                          {pr.vol_opname.toLocaleString("id-ID")} / {pr.vol_kontrak.toLocaleString("id-ID")} (volume)
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="border border-rule bg-sheet">
            <div className="flex items-center justify-between border-b border-rule px-5 py-3">
              <h2 className="text-sm font-semibold">Daftar SPK</h2>
              {spks.length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => onNavigate("spks")} className="text-survey hover:bg-survey/10 hover:text-survey">
                  Lihat semua SPK
                </Button>
              )}
            </div>
            <div className="p-5">
              {spks.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-ink-soft">
                    Belum ada SPK. Mulai dengan membuat proyek, mendaftarkan mandor, lalu buat SPK.
                  </p>
                  <Button size="sm" onClick={() => onNavigate("spks")} className="bg-survey text-white hover:bg-survey/90">
                    Buat SPK pertama
                  </Button>
                </div>
              ) : (
                <div className="table-wrap"><Table>
                  <TableHeader>
                    <TableRow className="border-rule hover:bg-transparent">
                      <TableHead className="text-ink-soft">No SPK</TableHead>
                      <TableHead className="text-ink-soft">Nilai</TableHead>
                      <TableHead className="text-ink-soft text-right">Opname</TableHead>
                      <TableHead className="text-ink-soft text-right">Realisasi</TableHead>
                      <TableHead className="text-ink-soft text-right">Sisa</TableHead>
                      <TableHead className="text-ink-soft">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {spks.map((s) => {
                      const sisa = Number(s.value) - Number(s.opname_cum);
                      return (
                        <TableRow key={s.id} className="h-11 border-rule">
                          <TableCell className="font-mono text-sm">{s.no_spk}</TableCell>
                          <TableCell className="font-mono tabular-nums">{rp(Number(s.value))}</TableCell>
                          <TableCell className="text-right font-mono tabular-nums">{rp(Number(s.opname_cum))}</TableCell>
                          <TableCell className="text-right font-mono tabular-nums">{rp(Number(s.realisasi))}</TableCell>
                          <TableCell className="text-right font-mono tabular-nums">{rp(sisa)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={s.status === "aktif" ? "default" : "secondary"}
                              className={s.status === "aktif" ? "bg-survey text-white" : ""}
                            >
                              {s.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table></div>
              )}
            </div>
          </section>

          {(data?.mandorKasbon ?? []).some((m) => m.total > 0) && (
            <section className="border border-rule bg-sheet">
              <div className="flex items-center justify-between border-b border-rule px-5 py-3">
                <h2 className="text-sm font-semibold">Kasbon teratas per mandor</h2>
                <Button size="sm" variant="ghost" onClick={() => onNavigate("kasbons")} className="text-survey hover:bg-survey/10 hover:text-survey">
                  Menu Kasbon
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
                {(data?.mandorKasbon ?? []).filter((m) => m.total > 0).map((m) => (
                  <div key={m.id} className="flex items-center gap-3 border border-rule bg-paper p-4">
                    <HardHat className="h-5 w-5 text-survey" aria-hidden />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{m.name}</p>
                      <p className="font-mono text-sm tabular-nums text-ink-soft">{rp(m.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="border border-rule bg-sheet px-4 py-3.5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-survey/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-survey"
    >
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="mt-1 font-mono text-lg font-bold tabular-nums text-ink sm:text-xl">{value}</p>
    </button>
  );
}
