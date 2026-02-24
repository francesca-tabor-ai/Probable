import { useDatasets, useDeleteDataset } from "@/hooks/use-datasets";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Datasets() {
  const { data: datasets, isLoading } = useDatasets();
  const remove = useDeleteDataset();
  const { toast } = useToast();

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
      />

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
