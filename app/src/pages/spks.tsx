import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { api, rp } from "@/lib/api";
import type { Mandor, Project, ProjectItem, Spk } from "@/lib/types";

const PAYMENT_METHODS = ["BG 30 Hari", "BG 60 Hari", "Cash", "Transfer"];

interface Picked { project_item_id: number; description: string; unit: string; volume: number; unit_price: string }

export function SpksPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Spk | null>(null);
  const [confirmDel, setConfirmDel] = useState<Spk | null>(null);
  const [projectId, setProjectId] = useState("");
  const projects = useQuery({ queryKey: ["projects"], queryFn: () => api<{ projects: Project[] }>("/api/projects") });
  const mandors = useQuery({ queryKey: ["mandors"], queryFn: () => api<{ mandors: Mandor[] }>("/api/mandors") });
  const spks = useQuery({ queryKey: ["spks"], queryFn: () => api<{ spks: Spk[] }>("/api/spks") });
  const items = useQuery({
    queryKey: ["project-items", projectId],
    queryFn: () => api<{ items: ProjectItem[] }>(`/api/projects/${projectId}/items`),
    enabled: !!projectId,
  });
  const [mandorId, setMandorId] = useState("");
  const [noSpk, setNoSpk] = useState("");
  const [retention, setRetention] = useState("5");
  const [payment, setPayment] = useState("");
  const [picked, setPicked] = useState<Picked[]>([]);

  const toggleItem = (it: ProjectItem) => {
    setPicked((prev) =>
      prev.some((p) => p.project_item_id === it.id)
        ? prev.filter((p) => p.project_item_id !== it.id)
        : [...prev, { project_item_id: it.id, description: it.description, unit: it.unit, volume: it.volume, unit_price: "" }],
    );
  };
  const setPrice = (id: number, price: string) =>
    setPicked((prev) => prev.map((p) => (p.project_item_id === id ? { ...p, unit_price: price } : p)));
  const totalValue = picked.reduce((a, p) => a + (Number(p.unit_price) > 0 ? Math.round(p.volume * Number(p.unit_price)) : 0), 0);
  const canSubmit = projectId && mandorId && noSpk.trim() && (editing || (picked.length > 0
    && picked.every((p) => Number.isInteger(Number(p.unit_price)) && Number(p.unit_price) > 0)));

  const create = useMutation({
    mutationFn: () =>
      editing
        ? api(`/api/spks/${editing.id}`, {
            method: "PUT",
            body: JSON.stringify({
              project_id: Number(projectId), mandor_id: Number(mandorId), no_spk: noSpk,
              retention_pct: Number(retention), payment_method: payment || null,
            }),
          })
        : api("/api/spks", {
            method: "POST",
            body: JSON.stringify({
              project_id: Number(projectId), mandor_id: Number(mandorId), no_spk: noSpk,
              retention_pct: Number(retention), payment_method: payment || null,
              items: picked.map((p) => ({ project_item_id: p.project_item_id, unit_price: Number(p.unit_price) })),
            }),
          }),
    onSuccess: () => {
      toast.success(editing ? "Perubahan SPK tersimpan." : "SPK dibuat. Nilai SPK dihitung otomatis.");
      setEditing(null);
      setNoSpk(""); setPicked([]); setOpen(false);
      qc.invalidateQueries({ queryKey: ["spks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteSpk = useMutation({
    mutationFn: (id: number) => api(`/api/spks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("SPK dihapus beserta opname dan realisasinya.");
      setConfirmDel(null);
      qc.invalidateQueries({ queryKey: ["spks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (s: Spk) => {
    setEditing(s);
    setProjectId(String(s.project_id));
    setMandorId(String(s.mandor_id));
    setNoSpk(s.no_spk);
    setRetention(String(s.retention_pct));
    setPayment(s.payment_method ?? "");
    setOpen(true);
  };

  const list = spks.data?.spks ?? [];
  const projectName = (id: number) => projects.data?.projects.find((p) => p.id === id)?.name ?? "-";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-pretty">SPK</h1>
          <p className="text-sm text-ink-soft">Nilai SPK dihitung otomatis dari pekerjaan terpilih kali harga satuan kontrak</p>
        </div>
        <Button onClick={() => setOpen(true)} className="h-11 bg-survey text-white hover:bg-survey/90"><span className="inline-flex items-center gap-1.5"><Plus className="h-4 w-4" aria-hidden />SPK Baru</span></Button>
      </header>

      <section className="border border-rule bg-sheet">
        <h2 className="border-b border-rule px-5 py-3 text-sm font-semibold">Daftar SPK</h2>
        <div className="p-5">
          {spks.isLoading ? (
            <p className="text-sm text-ink-soft" aria-live="polite">Memuat daftar SPK…</p>
          ) : list.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-ink-soft">Belum ada SPK. Pilih pekerjaan dari proyek, isi harga satuan kontrak, lalu buat SPK.</p>
              <Button size="sm" onClick={() => setOpen(true)} className="bg-survey text-white hover:bg-survey/90"><span className="inline-flex items-center gap-1.5"><Plus className="h-4 w-4" aria-hidden />SPK Baru</span></Button>
            </div>
          ) : (
            <div className="table-wrap"><Table>
              <TableHeader>
                <TableRow className="border-rule hover:bg-transparent">
                  <TableHead className="text-ink-soft">No SPK</TableHead>
                  <TableHead className="text-ink-soft">Nama paket</TableHead>
                  <TableHead className="text-ink-soft">Pembayaran</TableHead>
                  <TableHead className="text-ink-soft text-right">Nilai</TableHead>
                  <TableHead className="text-ink-soft">Retensi</TableHead>
                  <TableHead className="text-ink-soft">Status</TableHead>
                  <TableHead className="w-36 text-right text-ink-soft">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((s) => (
                  <TableRow key={s.id} className="border-rule">
                    <TableCell className="font-mono text-sm">{s.no_spk}</TableCell>
                    <TableCell>{projectName(s.project_id)}</TableCell>
                    <TableCell>{s.payment_method ?? "-"}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{rp(s.value)}</TableCell>
                    <TableCell>{s.retention_pct}%</TableCell>
                    <TableCell>
                      <Badge variant={s.status === "aktif" ? "default" : "secondary"} className={s.status === "aktif" ? "bg-survey text-white" : ""}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => openEdit(s)} className="mr-1.5 h-8 border-rule hover:bg-survey/10">Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmDel(s)} className="h-8 border-rule text-destructive hover:bg-destructive/10">Hapus</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></div>
          )}
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-rule bg-sheet sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit SPK" : "SPK baru"}</DialogTitle>
            <DialogDescription className="text-ink-soft">{editing ? "Ubah data header SPK. Harga satuan kontrak tiap pekerjaan tetap bisa diubah dari detail." : "Pilih satu atau beberapa pekerjaan, lalu isi harga satuan kontrak."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (canSubmit) create.mutate(); }} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-ink-soft">Nama paket</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger className="w-full border-rule"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(projects.data?.projects ?? []).map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-ink-soft">Nama mandor</Label>
                <Select value={mandorId} onValueChange={setMandorId}>
                  <SelectTrigger className="w-full border-rule"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(mandors.data?.mandors ?? []).map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-ink-soft">No SPK</Label>
                <Input value={noSpk} onChange={(e) => setNoSpk(e.target.value)} className="h-11 border-rule font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-ink-soft">Retensi (%)</Label>
                <Input type="number" min={0} max={100} value={retention} onChange={(e) => setRetention(e.target.value)} className="h-11 border-rule font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-ink-soft">Sistem pembayaran</Label>
                <Select value={payment} onValueChange={setPayment}>
                  <SelectTrigger className="w-full border-rule"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-ink-soft">Pilih pekerjaan</Label>
              {(items.data?.items ?? []).length === 0 ? (
                <p className="text-sm text-ink-soft">Proyek belum punya pekerjaan. Tambahkan dulu di menu Proyek.</p>
              ) : (
                <div className="divide-y divide-rule border border-rule">
                  {(items.data?.items ?? []).map((it) => {
                    const on = picked.some((p) => p.project_item_id === it.id);
                    return (
                      <div key={it.id} className="flex flex-wrap items-center gap-3 px-3 py-2">
                        <label className="flex flex-1 cursor-pointer items-center gap-2">
                          <input type="checkbox" checked={on} onChange={() => toggleItem(it)}
                            className="size-4 accent-[#0E7490]" />
                          <span className="text-sm">{it.description} <span className="text-ink-soft">({it.unit}, vol {it.volume.toLocaleString("id-ID")})</span></span>
                        </label>
                        {on && (
                          <Input type="number" placeholder="Harga satuan kontrak" value={picked.find((p) => p.project_item_id === it.id)?.unit_price ?? ""}
                            onChange={(e) => setPrice(it.id, e.target.value)} className="h-9 w-44 border-rule font-mono" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="text-sm text-ink-soft">Nilai SPK: <span className="font-mono text-base font-bold text-ink">{rp(totalValue)}</span></p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-11 border-rule hover:bg-survey/10">Batal</Button>
              <Button type="submit" disabled={!canSubmit || create.isPending} className="h-11 bg-survey text-white hover:bg-survey/90 disabled:opacity-50">
                {create.isPending ? "Menyimpan…" : editing ? "Simpan perubahan" : "Buat SPK"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <DialogContent className="border-rule bg-sheet sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus SPK?</DialogTitle>
            <DialogDescription className="text-ink-soft">
              {confirmDel?.no_spk} beserta opname dan realisasinya akan ikut terhapus.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setConfirmDel(null)} className="h-11 border-rule hover:bg-survey/10">Batal</Button>
            <Button onClick={() => confirmDel && deleteSpk.mutate(confirmDel.id)} disabled={deleteSpk.isPending} className="h-11 bg-destructive text-white hover:bg-destructive/90">
              {deleteSpk.isPending ? "Menghapus…" : "Hapus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
