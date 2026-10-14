import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { api, rp } from "@/lib/api";
import { projectCreateSchema, type ProjectCreate } from "../../shared/types";
import type { Project, ProjectItem } from "@/lib/types";

export function ProjectsPage() {
  const qc = useQueryClient();
  const [openProject, setOpenProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [confirmDel, setConfirmDel] = useState<Project | null>(null);
  const [openItemFor, setOpenItemFor] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const projects = useQuery({ queryKey: ["projects"], queryFn: () => api<{ projects: Project[] }>("/api/projects") });
  const form = useForm<ProjectCreate>({ resolver: zodResolver(projectCreateSchema) });

  const createProject = useMutation({
    mutationFn: (v: ProjectCreate) =>
      editingProject
        ? api(`/api/projects/${editingProject.id}`, { method: "PUT", body: JSON.stringify(v) })
        : api("/api/projects", { method: "POST", body: JSON.stringify(v) }),
    onSuccess: () => {
      toast.success(editingProject ? "Perubahan proyek tersimpan." : "Proyek dibuat. Kalender minggu otomatis terbentuk.");
      setEditingProject(null);
      form.reset();
      setOpenProject(false);
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteProject = useMutation({
    mutationFn: (id: number) => api(`/api/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Proyek dihapus beserta data turunannya.");
      setConfirmDel(null);
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["spks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEditProject = (pr: Project) => {
    setEditingProject(pr);
    form.reset({ name: pr.name, company: pr.company, engineer: pr.engineer,
      project_manager: pr.project_manager ?? "", start_date: pr.start_date });
    setOpenProject(true);
  };

  const list = projects.data?.projects ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-pretty">Proyek</h1>
          <p className="text-sm text-ink-soft">Identitas proyek dan daftar pekerjaan per paket (RAB dan RAP)</p>
        </div>
        <Button onClick={() => setOpenProject(true)} className="h-11 bg-survey text-white hover:bg-survey/90">
          <span className="inline-flex items-center gap-1.5"><Plus className="h-4 w-4" aria-hidden />Proyek Baru</span>
        </Button>
      </header>

      <section className="border border-rule bg-sheet">
        <h2 className="border-b border-rule px-5 py-3 text-sm font-semibold">Daftar proyek</h2>
        <div className="p-5">
          {projects.isLoading ? (
            <p className="text-sm text-ink-soft" aria-live="polite">Memuat proyek…</p>
          ) : list.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-ink-soft">Belum ada proyek. Buat proyek pertama, lalu tambahkan pekerjaan di dalamnya.</p>
              <Button size="sm" onClick={() => setOpenProject(true)} className="bg-survey text-white hover:bg-survey/90"><span className="inline-flex items-center gap-1.5"><Plus className="h-4 w-4" aria-hidden />Proyek Baru</span></Button>
            </div>
          ) : (
            <div className="table-wrap"><Table>
              <TableHeader>
                <TableRow className="border-rule hover:bg-transparent">
                  <TableHead className="text-ink-soft">Nama paket</TableHead>
                  <TableHead className="text-ink-soft">Perusahaan</TableHead>
                  <TableHead className="text-ink-soft">Site engineer</TableHead>
                  <TableHead className="text-ink-soft">Project manager</TableHead>
                  <TableHead className="text-ink-soft">Mulai</TableHead>
                  <TableHead className="text-ink-soft">Status</TableHead>
                  <TableHead className="text-ink-soft" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((pr) => (
                  <ProjectRow
                    key={pr.id}
                    project={pr}
                    expanded={expanded === pr.id}
                    onToggle={() => setExpanded(expanded === pr.id ? null : pr.id)}
                    onAddItem={() => setOpenItemFor(pr.id)}
                    openItem={openItemFor === pr.id}
                    onCloseItem={() => setOpenItemFor(null)}
                    onEdit={() => openEditProject(pr)}
                    onDelete={() => setConfirmDel(pr)}
                  />
                ))}
              </TableBody>
            </Table></div>
          )}
        </div>
      </section>

      <Dialog open={openProject} onOpenChange={setOpenProject}>
        <DialogContent className="border-rule bg-sheet sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit proyek" : "Proyek baru"}</DialogTitle>
            <DialogDescription className="text-ink-soft">Kalender minggu opname dibuat otomatis dari tanggal mulai kontrak.</DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit((v) => createProject.mutate(v))} className="space-y-4">
            <Field label="Nama paket" error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} className="h-11 border-rule" />
            </Field>
            <Field label="Perusahaan" error={form.formState.errors.company?.message}>
              <Input {...form.register("company")} className="h-11 border-rule" />
            </Field>
            <Field label="Site engineer" error={form.formState.errors.engineer?.message}>
              <Input {...form.register("engineer")} className="h-11 border-rule" />
            </Field>
            <Field label="Project manager">
              <Input {...form.register("project_manager")} className="h-11 border-rule" />
            </Field>
            <Field label="Tanggal mulai kontrak" error={form.formState.errors.start_date?.message}>
              <Input type="date" {...form.register("start_date")} className="h-11 border-rule" />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpenProject(false); setEditingProject(null); }} className="h-11 border-rule hover:bg-survey/10">Batal</Button>
              <Button type="submit" disabled={createProject.isPending} className="h-11 bg-survey text-white hover:bg-survey/90">
                {createProject.isPending ? "Menyimpan…" : editingProject ? "Simpan perubahan" : "Buat proyek"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <DialogContent className="border-rule bg-sheet sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus proyek?</DialogTitle>
            <DialogDescription className="text-ink-soft">
              {confirmDel?.name} beserta SPK, opname, dan pekerjaannya akan ikut terhapus.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setConfirmDel(null)} className="h-11 border-rule hover:bg-survey/10">Batal</Button>
            <Button onClick={() => confirmDel && deleteProject.mutate(confirmDel.id)} disabled={deleteProject.isPending} className="h-11 bg-destructive text-white hover:bg-destructive/90">
              {deleteProject.isPending ? "Menghapus…" : "Hapus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProjectRow({ project, expanded, onToggle, onAddItem, openItem, onCloseItem, onEdit, onDelete }: {
  project: Project; expanded: boolean; onToggle: () => void;
  onAddItem: () => void; openItem: boolean; onCloseItem: () => void;
  onEdit: () => void; onDelete: () => void;
}) {
  const items = useQuery({
    queryKey: ["project-items", project.id],
    queryFn: () => api<{ items: ProjectItem[] }>(`/api/projects/${project.id}/items`),
    enabled: expanded,
  });
  const itemsList = items.data?.items ?? [];
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [confirmDelItem, setConfirmDelItem] = useState<ProjectItem | null>(null);
  const qc = useQueryClient();
  const deleteItem = useMutation({
    mutationFn: (id: number) => api(`/api/projects/${project.id}/items/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Pekerjaan dihapus.");
      setConfirmDelItem(null);
      qc.invalidateQueries({ queryKey: ["project-items"] });
      qc.invalidateQueries({ queryKey: ["spks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <TableRow className="border-rule cursor-pointer" onClick={onToggle}>
        <TableCell className="font-medium">{project.name}</TableCell>
        <TableCell>{project.company}</TableCell>
        <TableCell>{project.engineer}</TableCell>
        <TableCell>{project.project_manager ?? "-"}</TableCell>
        <TableCell className="font-mono text-sm">{project.start_date}</TableCell>
        <TableCell>
          <Badge variant={project.status === "aktif" ? "default" : "secondary"} className={project.status === "aktif" ? "bg-survey text-white" : ""}>
            {project.status}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1.5">
            <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(); }} className="h-8 rounded-md border border-rule px-2.5 text-sm hover:bg-survey/10">Edit</button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="h-8 rounded-md border border-rule px-2.5 text-sm text-destructive hover:bg-destructive/10">Hapus</button>
            <span className="ml-1 text-sm text-ink-soft">{expanded ? "Tutup" : "Pekerjaan"}</span>
          </div>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="border-rule hover:bg-transparent">
          <TableCell colSpan={7} className="bg-paper p-0">
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">Pekerjaan paket {project.name}</p>
                <Button size="sm" onClick={onAddItem} className="bg-survey text-white hover:bg-survey/90"><span className="inline-flex items-center gap-1.5"><Plus className="h-4 w-4" aria-hidden />Tambahkan Pekerjaan</span></Button>
              </div>
              {items.isLoading ? (
                <p className="text-sm text-ink-soft">Memuat pekerjaan…</p>
              ) : itemsList.length === 0 ? (
                <p className="text-sm text-ink-soft">Belum ada pekerjaan di paket ini.</p>
              ) : (
                <div className="table-wrap"><Table>
                  <TableHeader>
                    <TableRow className="border-rule hover:bg-transparent">
                      <TableHead className="text-ink-soft">Pekerjaan</TableHead>
                      <TableHead className="text-ink-soft">Satuan</TableHead>
                      <TableHead className="text-ink-soft text-right">Volume</TableHead>
                      <TableHead className="text-ink-soft text-right">Harga RAB</TableHead>
                      <TableHead className="text-ink-soft text-right">Jumlah RAB</TableHead>
                      <TableHead className="text-ink-soft text-right">Harga RAP</TableHead>
                      <TableHead className="text-ink-soft text-right">Jumlah RAP</TableHead>
                      <TableHead className="w-32 text-right text-ink-soft">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemsList.map((i) => (
                      <TableRow key={i.id} className="border-rule">
                        <TableCell className="font-medium">{i.description}</TableCell>
                        <TableCell>{i.unit}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums">{i.volume.toLocaleString("id-ID")}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums">{rp(i.price_rab)}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums font-semibold">{rp(Math.round(i.volume * i.price_rab))}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums">{rp(i.price_rap)}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums font-semibold">{rp(Math.round(i.volume * i.price_rap))}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => setEditingItem(i)} className="mr-1.5 h-8 border-rule hover:bg-survey/10">Edit</Button>
                          <Button size="sm" variant="outline" onClick={() => setConfirmDelItem(i)} className="h-8 border-rule text-destructive hover:bg-destructive/10">Hapus</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table></div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
      <Dialog open={!!confirmDelItem} onOpenChange={(o) => !o && setConfirmDelItem(null)}>
        <DialogContent className="border-rule bg-sheet sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus pekerjaan?</DialogTitle>
            <DialogDescription className="text-ink-soft">
              {confirmDelItem?.description} akan dilepas dari semua SPK lalu dihapus.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setConfirmDelItem(null)} className="h-11 border-rule hover:bg-survey/10">Batal</Button>
            <Button onClick={() => confirmDelItem && deleteItem.mutate(confirmDelItem.id)} disabled={deleteItem.isPending} className="h-11 bg-destructive text-white hover:bg-destructive/90">
              {deleteItem.isPending ? "Menghapus…" : "Hapus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ItemDialog key={editingItem ? `edit-${editingItem.id}` : `new-${project.id}`} projectId={project.id} item={editingItem} open={openItem || !!editingItem} onClose={() => { onCloseItem(); setEditingItem(null); }} />
    </>
  );
}

function ItemDialog({ projectId, item, open, onClose }: { projectId: number; item: ProjectItem | null; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [itemForm, setItemForm] = useState({
    description: item?.description ?? "", unit: item?.unit ?? "", volume: item ? String(item.volume) : "",
    price_rab: item ? String(item.price_rab) : "", price_rap: item ? String(item.price_rap) : "",
  });
  const jumlahRab = Number(itemForm.volume) > 0 && Number(itemForm.price_rab) > 0 ? Math.round(Number(itemForm.volume) * Number(itemForm.price_rab)) : 0;
  const jumlahRap = Number(itemForm.volume) > 0 && Number(itemForm.price_rap) > 0 ? Math.round(Number(itemForm.volume) * Number(itemForm.price_rap)) : 0;
  const itemValid = itemForm.description.trim() && itemForm.unit.trim() && Number(itemForm.volume) > 0
    && Number.isInteger(Number(itemForm.price_rab)) && Number.isInteger(Number(itemForm.price_rap));

  const payload = () => JSON.stringify({ description: itemForm.description, unit: itemForm.unit,
    volume: Number(itemForm.volume), price_rab: Number(itemForm.price_rab), price_rap: Number(itemForm.price_rap) });
  const createItem = useMutation({
    mutationFn: () =>
      item
        ? api(`/api/projects/${projectId}/items/${item.id}`, { method: "PUT", body: payload() })
        : api(`/api/projects/${projectId}/items`, { method: "POST", body: payload() }),
    onSuccess: () => {
      toast.success(item ? "Perubahan pekerjaan tersimpan." : "Pekerjaan ditambahkan.");
      setItemForm({ description: "", unit: "", volume: "", price_rab: "", price_rap: "" });
      onClose();
      qc.invalidateQueries({ queryKey: ["project-items"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="border-rule bg-sheet sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Edit pekerjaan" : "Tambahkan pekerjaan"}</DialogTitle>
          <DialogDescription className="text-ink-soft">Jumlah RAB dan RAP dihitung otomatis dari volume kali harga.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); if (itemValid) createItem.mutate(); }} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-ink-soft">Nama pekerjaan</Label>
            <Input value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} className="h-11 border-rule" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-ink-soft">Volume</Label>
              <Input type="number" step="any" value={itemForm.volume} onChange={(e) => setItemForm({ ...itemForm, volume: e.target.value })} className="h-11 border-rule font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-ink-soft">Satuan</Label>
              <Input value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })} className="h-11 border-rule" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-ink-soft">Harga satuan RAB</Label>
              <Input type="number" value={itemForm.price_rab} onChange={(e) => setItemForm({ ...itemForm, price_rab: e.target.value })} className="h-11 border-rule font-mono" />
              <p className="text-xs text-ink-soft">Jumlah RAB: <span className="font-mono font-semibold text-ink">{rp(jumlahRab)}</span></p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-ink-soft">Harga satuan RAP</Label>
              <Input type="number" value={itemForm.price_rap} onChange={(e) => setItemForm({ ...itemForm, price_rap: e.target.value })} className="h-11 border-rule font-mono" />
              <p className="text-xs text-ink-soft">Jumlah RAP: <span className="font-mono font-semibold text-ink">{rp(jumlahRap)}</span></p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="h-11 border-rule hover:bg-survey/10">Batal</Button>
            <Button type="submit" disabled={!itemValid || createItem.isPending} className="h-11 bg-survey text-white hover:bg-survey/90 disabled:opacity-50">
              {createItem.isPending ? "Menyimpan…" : item ? "Simpan perubahan" : "Tambah pekerjaan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-ink-soft">{label}</Label>
      {children}
      {error && <p role="alert" className="text-xs text-marker">{error}</p>}
    </div>
  );
}
