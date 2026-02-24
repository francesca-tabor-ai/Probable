import { useState } from "react";
import { useUsers, useUpdateUser, useDeleteUser } from "@/hooks/use-users";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Trash2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Users() {
  const { data: users, isLoading } = useUsers();
  const update = useUpdateUser();
  const remove = useDeleteUser();
  const { toast } = useToast();
  const [editing, setEditing] = useState<{ id: number; email: string; fullName?: string; isActive: boolean } | null>(null);
  const [form, setForm] = useState({ fullName: "", isActive: true });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    update.mutate({ id: editing.id, data: { fullName: form.fullName || undefined, isActive: form.isActive } }, {
      onSuccess: () => {
        setEditing(null);
        toast({ title: "User updated" });
      },
      onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    remove.mutate(id, {
      onSuccess: () => toast({ title: "Deleted" }),
      onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  const openEdit = (u: { id: number; email: string; fullName?: string; isActive: boolean }) => {
    setEditing(u);
    setForm({ fullName: u.fullName ?? "", isActive: u.isActive });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Users"
        description="Manage user accounts."
      />

      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/20">
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No users.</TableCell>
              </TableRow>
            ) : (
              users?.map((u: { id: number; email: string; fullName?: string; isActive: boolean; createdAt?: string }) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono">{u.id}</TableCell>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell className="text-muted-foreground">{u.fullName ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? "default" : "secondary"}>{u.isActive ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(u)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(u.id)}>
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
                <DialogTitle>Edit User</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input value={editing.email} disabled className="bg-muted" />
                </div>
                <div className="grid gap-2">
                  <Label>Full Name</Label>
                  <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} placeholder="Optional" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
                  <Label>Active</Label>
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
