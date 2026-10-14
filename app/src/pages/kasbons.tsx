import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { api, rp } from "@/lib/api";

const EMPTY = { mandor_id: "", spk_id: "", amount: "", date: "", note: "" };

interface Kasbon { id: number; mandor_id: number; spk_id: number | null; amount: number; date: string; note: string | null }
interface Mandor { id: number; name: string }
interface Saldo { mandor_id: number; name: string; total_kasbon: number }

export function KasbonsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Kasbon | null>(null);
  const [confirmDel, setConfirmDel] = useState<Kasbon | null>(null);
  const [form, setForm] = useState(EMPTY);

  const mandors = useQuery({ queryKey: ["mandors"], queryFn: () => api<{ mandors: Mandor[] }>("/api/mandors") });
  const kasbons = useQuery({ queryKey: ["kasbons"], queryFn: () => api<{ kasbons: Kasbon[] }>("/api/kasbons") });
  const saldo = useQuery({ queryKey: ["kasbon-saldo"], queryFn: () => api<{ saldo: Saldo[] }>("/api/kasbons/saldo") });

  const mandorName = (id: number) => mandors.data?.mandors.find((m) => m.id === id)?.name ?? "-";

  const save = useMutation({
    mutationFn: () =>
      editing
        ? api(`/api/kasbons/${editing.id}`, { method: "PUT", body: JSON.stringify({
            mandor_id: Number(form.mandor_id), spk_id: form.spk_id ? Number(form.spk_id) : null,
            amount: Number(form.amount), date: form.date, note: form.note }),
          })
        : api("/api/kasbons", { method: "POST", body: JSON.stringify({
            mandor_id: Number(form.mandor_id), spk_id: form.spk_id ? Number(form.spk_id) : null,
            amount: Number(form.amount), date: form.date, note: form.note,
          }) }),
    onSuccess: () => {
      toast.success(editing ? "Perubahan kasbon tersimpan." : "Kasbon tercatat.");
      setEditing(null); setForm(EMPTY); setOpen(false);
      qc.invalidateQueries({ queryKey: ["kasbons"] });
      qc.invalidateQueries({ queryKey: ["kasbon-saldo"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api(`/api/kasbons/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Kasbon dihapus.");
      setConfirmDel(null);
      qc.invalidateQueries({ queryKey: ["kasbons"] });
      qc.invalidateQueries({ queryKey: ["kasbon-saldo"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (k: Kasbon) => {
    setEditing(k);
    setForm({ mandor_id: String(k.mandor_id), spk_id: k.spk_id ? String(k.spk_id) : "",
      amount: String(k.amount), date: k.date, note: k.note ?? "" });
    setOpen(true);
  };

  const valid = form.mandor_id && Number.isInteger(Number(form.amount)) && Number(form.amount) > 0 && form.date;
  const list = (kasbons.data?.kasbons ?? []).slice().reverse();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-pretty">Kasbon</h1>
          <p className="text-sm text-ink-soft">Kasbon per mandor dengan saldo berjalan</p>
        </div>
        <Button onClick={() => setOpen(true)} className="h-11 bg-survey text-white hover:bg-survey/90"><span className="inline-flex items-center gap-1.5"><Plus className="h-4 w-4" aria-hidden />Kasbon Baru</span></Button>
      </header>

      <section className="border border-rule bg-sheet">
        <h2 className="border-b border-rule px-5 py-3 text-sm font-semibold">Saldo per mandor</h2>
        <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3">
          {(saldo.data?.saldo ?? []).filter((s) => s.total_kasbon > 0).length === 0 ? (
            <p className="text-sm text-ink-soft">Belum ada kasbon.</p>
          ) : (saldo.data?.saldo ?? []).filter((s) => s.total_kasbon > 0).map((s) => (
            <div key={s.mandor_id} className="border border-rule bg-paper p-4">
              <p className="text-sm text-ink-soft">{s.name}</p>
              <p className="font-mono text-lg font-bold">{rp(s.total_kasbon)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-rule bg-sheet">
        <h2 className="border-b border-rule px-5 py-3 text-sm font-semibold">Riwayat kasbon</h2>
        <div className="p-5">
          {kasbons.isLoading ? (
            <p className="text-sm text-ink-soft" aria-live="polite">Memuat kasbon…</p>
          ) : list.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-ink-soft">Belum ada kasbon. Catat kasbon pertama.</p>
              <Button size="sm" onClick={() => setOpen(true)} className="bg-survey text-white hover:bg-survey/90"><span className="inline-flex items-center gap-1.5"><Plus className="h-4 w-4" aria-hidden />Kasbon Baru</span></Button>
            </div>
          ) : (
            <div className="table-wrap"><Table>
              <TableHeader>
                <TableRow className="border-rule hover:bg-transparent">
                  <TableHead className="text-ink-soft">Tanggal</TableHead>
                  <TableHead className="text-ink-soft">Mandor</TableHead>
                  <TableHead className="text-ink-soft text-right">Nominal</TableHead>
                  <TableHead className="text-ink-soft">Keterangan</TableHead>
                  <TableHead className="w-36 text-right text-ink-soft">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((k) => (
                  <TableRow key={k.id} className="border-rule">
                    <TableCell className="font-mono text-sm">{k.date}</TableCell>
                    <TableCell className="font-medium">{mandorName(k.mandor_id)}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{rp(k.amount)}</TableCell>
                    <TableCell>{k.note ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => openEdit(k)} className="mr-1.5 h-8 border-rule hover:bg-survey/10">Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmDel(k)} className="h-8 border-rule text-destructive hover:bg-destructive/10">Hapus</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></div>
          )}
        </div>
      </section>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm(EMPTY); } }}>
        <DialogContent className="border-rule bg-sheet sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit kasbon" : "Kasbon baru"}</DialogTitle>
            <DialogDescription className="text-ink-soft">Kasbon tercatat per mandor dan bisa diedit kapan saja.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-ink-soft">Mandor</Label>
              <Select value={form.mandor_id} onValueChange={(v) => setForm({ ...form, mandor_id: v })}>
                <SelectTrigger className="w-full border-rule"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(mandors.data?.mandors ?? []).map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-ink-soft">Nominal</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="h-11 border-rule font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-ink-soft">Tanggal</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-11 border-rule" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-ink-soft">Keterangan</Label>
              <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="h-11 border-rule" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditing(null); setForm(EMPTY); }} className="h-11 border-rule hover:bg-survey/10">Batal</Button>
              <Button disabled={!valid || save.isPending} onClick={() => save.mutate()} className="h-11 bg-survey text-white hover:bg-survey/90 disabled:opacity-50">
                {save.isPending ? "Menyimpan…" : editing ? "Simpan perubahan" : "Catat kasbon"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <DialogContent className="border-rule bg-sheet sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus kasbon?</DialogTitle>
            <DialogDescription className="text-ink-soft">
              Kasbon {confirmDel ? rp(confirmDel.amount) : ""} atas nama {confirmDel ? mandorName(confirmDel.mandor_id) : ""} akan dihapus.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setConfirmDel(null)} className="h-11 border-rule hover:bg-survey/10">Batal</Button>
            <Button onClick={() => confirmDel && remove.mutate(confirmDel.id)} disabled={remove.isPending} className="h-11 bg-destructive text-white hover:bg-destructive/90">
              {remove.isPending ? "Menghapus…" : "Hapus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
