import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import type { Mandor } from "@/lib/types";

const EMPTY = { name: "", bank: "", account_no: "", account_name: "" };


export function MandorsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDel, setConfirmDel] = useState<Mandor | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["mandors"],
    queryFn: () => api<{ mandors: Mandor[] }>("/api/mandors"),
  });
  const [form, setForm] = useState(EMPTY);
  const create = useMutation({
    mutationFn: () =>
      editingId
        ? api(`/api/mandors/${editingId}`, { method: "PUT", body: JSON.stringify(form) })
        : api("/api/mandors", { method: "POST", body: JSON.stringify(form) }),
    onSuccess: () => {
      toast.success(editingId ? "Perubahan mandor tersimpan." : "Mandor terdaftar.");
      setForm(EMPTY);
      setEditingId(null);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["mandors"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api(`/api/mandors/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Mandor dihapus.");
      setConfirmDel(null);
      qc.invalidateQueries({ queryKey: ["mandors"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (m: Mandor) => {
    setEditingId(m.id);
    setForm({ name: m.name ?? "", bank: m.bank ?? "", account_no: m.account_no ?? "", account_name: m.account_name ?? "" });
    setOpen(true);
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });
  const mandors = data?.mandors ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-pretty">Mandor</h1>
          <p className="text-sm text-ink-soft">Data mandor bisa dipakai di banyak proyek dan SPK</p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="h-11 bg-survey text-white hover:bg-survey/90 focus-visible:ring-2 focus-visible:ring-survey/30"
        >
          <span className="inline-flex items-center gap-1.5"><Plus className="h-4 w-4" aria-hidden />Mandor Baru</span>
        </Button>
      </header>

      <section className="border border-rule bg-sheet">
        <h2 className="border-b border-rule px-5 py-3 text-sm font-semibold">Daftar mandor</h2>
        <div className="p-5">
          {isLoading ? (
            <p className="text-sm text-ink-soft" aria-live="polite">Memuat daftar mandor…</p>
          ) : mandors.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-ink-soft">Belum ada mandor. Daftarkan mandor pertama.</p>
              <Button size="sm" onClick={() => setOpen(true)} className="bg-survey text-white hover:bg-survey/90">
                <span className="inline-flex items-center gap-1.5"><Plus className="h-4 w-4" aria-hidden />Mandor Baru</span>
              </Button>
            </div>
          ) : (
            <div className="table-wrap"><Table>
              <TableHeader>
                <TableRow className="border-rule hover:bg-transparent">
                  <TableHead className="text-ink-soft">Nama</TableHead>
                  <TableHead className="text-ink-soft">Bank</TableHead>
                  <TableHead className="text-ink-soft">No rekening</TableHead>
                  <TableHead className="text-ink-soft">Nama rekening</TableHead>
                  <TableHead className="w-36 text-right text-ink-soft">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mandors.map((m) => (
                  <TableRow key={m.id} className="h-11 border-rule">
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.bank ?? "-"}</TableCell>
                    <TableCell className="font-mono text-sm">{m.account_no ?? "-"}</TableCell>
                    <TableCell>{m.account_name ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => openEdit(m)} className="mr-1.5 h-8 border-rule hover:bg-survey/10">Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmDel(m)} className="h-8 border-rule text-destructive hover:bg-destructive/10">Hapus</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></div>
          )}
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-rule bg-sheet sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit mandor" : "Mandor baru"}</DialogTitle>
            <DialogDescription className="text-ink-soft">
              Data rekening dipakai untuk pembayaran maker.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => { e.preventDefault(); create.mutate(); }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label className="text-ink-soft">Nama</Label>
              <Input value={form.name} onChange={set("name")} required className="h-11 border-rule" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-ink-soft">Bank</Label>
              <Input value={form.bank} onChange={set("bank")} className="h-11 border-rule" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-ink-soft">No rekening</Label>
              <Input value={form.account_no} onChange={set("account_no")} className="h-11 border-rule font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-ink-soft">Nama rekening</Label>
              <Input value={form.account_name} onChange={set("account_name")} className="h-11 border-rule" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-11 border-rule hover:bg-survey/10">
                Batal
              </Button>
              <Button type="submit" disabled={create.isPending} className="h-11 bg-survey text-white hover:bg-survey/90">
                {create.isPending ? "Menyimpan…" : editingId ? "Simpan perubahan" : "Daftarkan mandor"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <DialogContent className="border-rule bg-sheet sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus mandor?</DialogTitle>
            <DialogDescription className="text-ink-soft">
              {confirmDel?.name} dan SPK/opname/kasbon yang menempel padanya akan ikut terhapus.
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
