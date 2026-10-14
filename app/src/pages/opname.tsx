import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { api, rp } from "@/lib/api";
import type { Mandor, Project, Realization, Recap, Spk, Week } from "@/lib/types";

export function OpnamePage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [spkId, setSpkId] = useState("");
  const [weekId, setWeekId] = useState("");
  const [volumeDraft, setVolumeDraft] = useState<Record<number, string>>({});

  const mandors = useQuery({ queryKey: ["mandors"], queryFn: () => api<{ mandors: Mandor[] }>("/api/mandors") });
  const spks = useQuery({ queryKey: ["spks"], queryFn: () => api<{ spks: Spk[] }>("/api/spks") });
  const projects = useQuery({ queryKey: ["projects"], queryFn: () => api<{ projects: Project[] }>("/api/projects") });
  const weeks = useQuery({
    queryKey: ["weeks", spkId],
    queryFn: () => {
      const spk = spks.data?.spks.find((s) => s.id === Number(spkId));
      return api<{ weeks: Week[] }>(`/api/projects/${spk?.project_id}/weeks`);
    },
    enabled: !!spkId,
  });
  const recap = useQuery({
    queryKey: ["opname-recap", spkId, weekId],
    queryFn: () => api<{ recap: Recap }>(`/api/opnames/recap?spk_id=${spkId}&week_id=${weekId}`),
    enabled: !!spkId && !!weekId,
  });
  const realizations = useQuery({
    queryKey: ["realizations", spkId],
    queryFn: () => api<{ realizations: Realization[] }>(`/api/realizations?spk_id=${spkId}`),
    enabled: !!spkId,
  });

  // Search universal: filter SPK by no_spk, nama paket, nama mandor
  const spkOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    const mandorName = (id: number) => mandors.data?.mandors.find((m) => m.id === id)?.name ?? "";
    return (spks.data?.spks ?? []).filter((s) =>
      !q || s.no_spk.toLowerCase().includes(q)
        || projectName(s.project_id).toLowerCase().includes(q)
        || mandorName(s.mandor_id).toLowerCase().includes(q),
    );
  }, [spks.data, mandors.data, projects.data, search]);

  const projectName = (id: number) => projects.data?.projects.find((p) => p.id === id)?.name ?? "-";

  const saveVolume = useMutation({
    mutationFn: (v: { spk_item_id: number; volume: number }) => api("/api/opnames", {
      method: "PUT",
      body: JSON.stringify({ ...v, week_id: Number(weekId) }),
    }),
    onSuccess: () => {
      toast.success("Volume opname tersimpan.");
      setVolumeDraft({});
      qc.invalidateQueries({ queryKey: ["opname-recap"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [realForm, setRealForm] = useState({ amount: "", method: "BG 30 Hari", date: "", note: "" });
  const addRealization = useMutation({
    mutationFn: () => api("/api/realizations", {
      method: "POST",
      body: JSON.stringify({ spk_id: Number(spkId), week_id: Number(weekId) || null,
        amount: Number(realForm.amount), method: realForm.method, date: realForm.date, note: realForm.note }),
    }),
    onSuccess: () => {
      toast.success("Realisasi pembayaran tercatat.");
      setRealForm({ amount: "", method: "BG 30 Hari", date: "", note: "" });
      qc.invalidateQueries({ queryKey: ["realizations"] });
      qc.invalidateQueries({ queryKey: ["opname-recap"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delRealization = useMutation({
    mutationFn: (id: number) => api(`/api/realizations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Realisasi dihapus.");
      qc.invalidateQueries({ queryKey: ["realizations"] });
      qc.invalidateQueries({ queryKey: ["opname-recap"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-pretty">Opname Mingguan</h1>
          <p className="text-sm text-ink-soft">Opname = pengajuan. Data selalu bisa diedit ulang.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="h-11 bg-survey text-white hover:bg-survey/90">+ Opname Baru</Button>
      </header>

      {!spkId || !weekId ? (
        <section className="border border-rule bg-sheet p-5">
          <p className="text-sm text-ink-soft">Pilih SPK dan minggu lewat tombol Opname Baru, lalu detail opname tampil di sini.</p>
        </section>
      ) : recap.isLoading || !recap.data ? (
        <section className="border border-rule bg-sheet p-5">
          <p className="text-sm text-ink-soft" aria-live="polite">Memuat detail opname…</p>
        </section>
      ) : (
        <>
          <section className="border border-rule bg-sheet">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-5 py-3">
              <h2 className="text-sm font-semibold">Detail Opname</h2>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-ink-soft">No SPK: <span className="font-mono text-ink">{spks.data?.spks.find((s) => s.id === Number(spkId))?.no_spk}</span></span>
                <span className="text-ink-soft">Minggu ke: <span className="font-mono text-ink">{weeks.data?.weeks.find((w) => w.id === Number(weekId))?.number}</span></span>
              </div>
            </div>
            <div className="p-5">
              <div className="table-wrap"><Table>
                <TableHeader>
                  <TableRow className="border-rule hover:bg-transparent">
                    <TableHead className="text-ink-soft">Pekerjaan</TableHead>
                    <TableHead className="text-ink-soft">Satuan</TableHead>
                    <TableHead className="text-ink-soft text-right">Vol minggu ini</TableHead>
                    <TableHead className="text-ink-soft text-right">Vol kumulatif / kontrak</TableHead>
                    <TableHead className="text-ink-soft text-right">Harga kontrak</TableHead>
                    <TableHead className="text-ink-soft text-right">Nilai minggu ini</TableHead>
                    <TableHead className="text-ink-soft text-right">Akumulasi s/d minggu ini</TableHead>
                    <TableHead className="text-ink-soft text-right">Progres</TableHead>
                    <TableHead className="w-20 text-right text-ink-soft">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recap.data.recap.items.map((i) => {
                    const over = i.volume_cum > i.contract_volume;
                    return (
                      <TableRow key={i.spk_item_id} className="border-rule">
                        <TableCell className="font-medium">{i.description}</TableCell>
                        <TableCell>{i.unit}</TableCell>
                        <TableCell className="text-right">
                          <Input type="number" step="any" value={volumeDraft[i.spk_item_id] ?? String(i.volume_week || "")}
                            onChange={(e) => setVolumeDraft({ ...volumeDraft, [i.spk_item_id]: e.target.value })}
                            onBlur={() => {
                              const v = Number(volumeDraft[i.spk_item_id]);
                              if (volumeDraft[i.spk_item_id] !== undefined && Number.isFinite(v) && v >= 0 && v !== i.volume_week) {
                                saveVolume.mutate({ spk_item_id: i.spk_item_id, volume: v });
                              }
                            }}
                            className="h-9 w-24 border-rule text-right font-mono" />
                        </TableCell>
                        <TableCell className={`text-right font-mono tabular-nums ${over ? "text-marker font-semibold" : ""}`}>
                          {i.volume_cum.toLocaleString("id-ID")} / {i.contract_volume.toLocaleString("id-ID")}{over ? " (over)" : ""}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">{rp(i.unit_price)}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums">{rp(i.nilai_week)}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums font-semibold">{rp(i.nilai_cum)}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {i.contract_volume > 0 ? Math.round((i.volume_cum / i.contract_volume) * 100) : 0}%
                        </TableCell>
                        <TableCell className="text-right">
                          {i.volume_week > 0 && (
                            <Button size="sm" variant="outline"
                              onClick={() => saveVolume.mutate({ spk_item_id: i.spk_item_id, volume: 0 })}
                              className="h-8 border-rule text-destructive hover:bg-destructive/10">
                              Kosongkan
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table></div>
            </div>
          </section>

          <section className="border border-rule bg-sheet">
            <h2 className="border-b border-rule px-5 py-3 text-sm font-semibold">Rekap minggu ini</h2>
            <div className="grid grid-cols-2 gap-4 p-4 text-sm sm:grid-cols-4 sm:p-5">
              <div><p className="text-ink-soft">Total opname minggu ini</p><p className="font-mono text-lg font-bold">{rp(recap.data.recap.total_week)}</p></div>
              <div><p className="text-ink-soft">Retensi ({recap.data.recap.retensi_pct}%)</p><p className="font-mono text-lg font-bold">{rp(recap.data.recap.retensi)}</p></div>
              <div><p className="text-ink-soft">Akumulasi s/d minggu ini</p><p className="font-mono text-lg font-bold">{rp(recap.data.recap.total_cum)}</p></div>
              <div><p className="text-ink-soft">Nilai diajukan minggu ini</p><p className="font-mono text-lg font-bold text-survey">{rp(recap.data.recap.dibayar_minggu_ini)}</p></div>
            </div>
          </section>

          <section className="border border-rule bg-sheet">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-5 py-3">
              <h2 className="text-sm font-semibold">Realisasi pembayaran</h2>
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <Label className="text-ink-soft">Nominal</Label>
                  <Input type="number" value={realForm.amount} onChange={(e) => setRealForm({ ...realForm, amount: e.target.value })} className="h-9 w-36 border-rule font-mono" />
                </div>
                <div>
                  <Label className="text-ink-soft">Metode</Label>
                  <Select value={realForm.method} onValueChange={(v) => setRealForm({ ...realForm, method: v })}>
                    <SelectTrigger className="h-9 w-32 border-rule"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["BG 30 Hari", "BG 60 Hari", "Cash", "Transfer"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-ink-soft">Tanggal</Label>
                  <Input type="date" value={realForm.date} onChange={(e) => setRealForm({ ...realForm, date: e.target.value })} className="h-9 border-rule" />
                </div>
                <Button size="sm" disabled={!Number.isInteger(Number(realForm.amount)) || Number(realForm.amount) <= 0 || !realForm.date || addRealization.isPending}
                  onClick={() => addRealization.mutate()} className="h-9 bg-survey text-white hover:bg-survey/90 disabled:opacity-50">
                  + Catat realisasi
                </Button>
              </div>
            </div>
            <div className="p-5">
              {(realizations.data?.realizations ?? []).length === 0 ? (
                <p className="text-sm text-ink-soft">Belum ada realisasi untuk SPK ini.</p>
              ) : (
                <div className="table-wrap"><Table>
                  <TableHeader>
                    <TableRow className="border-rule hover:bg-transparent">
                      <TableHead className="text-ink-soft">Tanggal</TableHead>
                      <TableHead className="text-ink-soft">Metode</TableHead>
                      <TableHead className="text-ink-soft text-right">Nominal</TableHead>
                      <TableHead className="text-ink-soft">Keterangan</TableHead>
                      <TableHead className="w-20 text-right text-ink-soft">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(realizations.data?.realizations ?? []).map((r) => (
                      <TableRow key={r.id} className="border-rule">
                        <TableCell className="font-mono text-sm">{r.date}</TableCell>
                        <TableCell><Badge variant="secondary">{r.method ?? "-"}</Badge></TableCell>
                        <TableCell className="text-right font-mono tabular-nums">{rp(r.amount)}</TableCell>
                        <TableCell>{r.note ?? "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => delRealization.mutate(r.id)} className="h-8 border-rule text-destructive hover:bg-destructive/10">Hapus</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table></div>
              )}
            </div>
          </section>
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-rule bg-sheet sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Opname baru</DialogTitle>
            <DialogDescription className="text-ink-soft">Cari dengan no SPK, nama paket, atau nama mandor. Pilih pekerjaan lalu isi volume.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-ink-soft">Cari (no SPK, paket, mandor)</Label>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 border-rule" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-ink-soft">SPK</Label>
              <Select value={spkId} onValueChange={(v) => { setSpkId(v); setWeekId(""); }}>
                <SelectTrigger className="w-full border-rule"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {spkOptions.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.no_spk} - {projectName(s.project_id)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-ink-soft">Minggu ke</Label>
              <Select value={weekId} onValueChange={setWeekId}>
                <SelectTrigger className="w-full border-rule"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(weeks.data?.weeks ?? []).slice(0, 30).map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>Minggu {w.number} ({w.startDate} s/d {w.endDate})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="h-11 border-rule hover:bg-survey/10">Tutup</Button>
              <Button disabled={!spkId || !weekId} onClick={() => { setOpen(false); }}
                className="h-11 bg-survey text-white hover:bg-survey/90 disabled:opacity-50">
                Buka detail opname
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
