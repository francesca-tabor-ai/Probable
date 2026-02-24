import { useState } from "react";
import { useDataSources, useCreateDataSource, useUpdateDataSource, useDeleteDataSource } from "@/hooks/use-data-sources";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DataSources() {
  const { data: sources, isLoading } = useDataSources();
  const create = useCreateDataSource();
  const update = useUpdateDataSource();
  const remove = useDeleteDataSource();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: number; topic: string; config: Record<string, unknown> } | null>(null);
  const [form, setForm] = useState({ topic: "", config: "{}" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    let config: Record<string, unknown> = {};
    try {
      config = JSON.parse(form.config || "{}");
    } catch {
      toast({ title: "Invalid JSON", variant: "destructive" });
      return;
    }
    create.mutate({ topic: form.topic, config }, {
      onSuccess: () => {
        setOpen(false);
        setForm({ topic: "", config: "{}" });
        toast({ title: "Data source created" });
      },
      onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    let config: Record<string, unknown> = {};
    try {
      config = JSON.parse(form.config || "{}");
    } catch {
      toast({ title: "Invalid JSON", variant: "destructive" });
      return;
    }
    update.mutate({ id: editing.id, data: { topic: form.topic, config } }, {
      onSuccess: () => {
        setEditing(null);
        setForm({ topic: "", config: "{}" });
        toast({ title: "Updated" });
      },
      onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this data source?")) return;
    remove.mutate(id, {
      onSuccess: () => toast({ title: "Deleted" }),
      onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Data Sources"
        description="Configure external data sources per topic."
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" /> Add Source
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add Data Source</DialogTitle>
                <DialogDescription>Topic and config for the data source.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input id="topic" value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} placeholder="e.g. politics" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="config">Config (JSON)</Label>
                  <Input id="config" value={form.config} onChange={(e) => setForm((f) => ({ ...f, config: e.target.value }))} placeholder='{"rss_feeds": []}' />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={create.isPending}>{create.isPending ? "Adding..." : "Add"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/20">
              <TableHead>ID</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Config</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : sources?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No data sources.</TableCell>
              </TableRow>
            ) : (
              sources?.map((s: { id: number; topic: string; config: Record<string, unknown> }) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono">{s.id}</TableCell>
                  <TableCell className="font-medium">{s.topic}</TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-xs truncate">{JSON.stringify(s.config)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(s); setForm({ topic: s.topic, config: JSON.stringify(s.config ?? {}, null, 2) }); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(s.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <form onSubmit={handleUpdate}>
              <DialogHeader>
                <DialogTitle>Edit Data Source</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Topic</Label>
                  <Input value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Config (JSON)</Label>
                  <Input value={form.config} onChange={(e) => setForm((f) => ({ ...f, config: e.target.value }))} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit" disabled={update.isPending}>{update.isPending ? "Saving..." : "Save"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
