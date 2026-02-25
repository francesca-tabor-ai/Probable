import { useState } from "react";
import { useDatasets, useCreateDataset, useDeleteDataset } from "@/hooks/use-datasets";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Datasets() {
  const { data: datasets, isLoading } = useDatasets();
  const create = useCreateDataset();
  const remove = useDeleteDataset();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ topic: "", source: "Admin", data: "{}" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(form.data || "{}");
    } catch {
      toast({ title: "Invalid JSON", variant: "destructive" });
      return;
    }
    create.mutate({ topic: form.topic, source: form.source, data }, {
      onSuccess: () => {
        setOpen(false);
        setForm({ topic: "", source: "Admin", data: "{}" });
        toast({ title: "Dataset created" });
      },
      onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this dataset?")) return;
    remove.mutate(id, {
      onSuccess: () => toast({ title: "Deleted" }),
      onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Datasets"
        description="Cleaned data blobs linked to articles."
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" /> Add Dataset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add Dataset</DialogTitle>
                <DialogDescription>Create a new dataset with topic and JSON data.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Topic</Label>
                  <Input value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} placeholder="e.g. politics" required />
                </div>
                <div className="grid gap-2">
                  <Label>Source</Label>
                  <Input value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} placeholder="Admin" />
                </div>
                <div className="grid gap-2">
                  <Label>Data (JSON)</Label>
                  <Input value={form.data} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))} placeholder='{"key": "value"}' />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={create.isPending}>{create.isPending ? "Creating..." : "Create"}</Button>
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
              <TableHead>Source</TableHead>
              <TableHead>Article ID</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : datasets?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No datasets.</TableCell>
              </TableRow>
            ) : (
              datasets?.map((d: { id: number; topic: string; source: string; articleId?: number; createdAt?: string }) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono">{d.id}</TableCell>
                  <TableCell className="font-medium">{d.topic}</TableCell>
                  <TableCell>{d.source}</TableCell>
                  <TableCell className="text-muted-foreground">{d.articleId ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{d.createdAt ? format(new Date(d.createdAt), "MMM d, yyyy") : "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(d.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
