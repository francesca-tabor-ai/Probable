import { useState } from "react";
import { useArticles, useUpdateArticle, useDeleteArticle } from "@/hooks/use-articles";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ExternalLink, Trash2, Search, Filter, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function Articles() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editing, setEditing] = useState<{ id: number; title: string; url: string; content?: string; topics?: string[]; entities?: string[] } | null>(null);
  const [formData, setFormData] = useState({ title: "", url: "", content: "", topics: "", entities: "" });
  
  const { data: articles, isLoading } = useArticles(statusFilter !== "all" ? statusFilter : undefined);
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();
  const { toast } = useToast();

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    updateArticle.mutate(
      {
        id: editing.id,
        data: {
          title: formData.title,
          url: formData.url,
          content: formData.content || undefined,
          topics: formData.topics ? formData.topics.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
          entities: formData.entities ? formData.entities.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        },
      },
      {
        onSuccess: () => {
          setEditing(null);
          toast({ title: "Article updated" });
        },
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      }
    );
  };

  const openEdit = (article: { id: number; title: string; url: string; content?: string; topics?: string[]; entities?: string[] }) => {
    setEditing(article);
    setFormData({
      title: article.title,
      url: article.url,
      content: article.content ?? "",
      topics: article.topics?.join(", ") ?? "",
      entities: article.entities?.join(", ") ?? "",
    });
  };

  const filteredArticles = articles?.filter((article: any) => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader 
        title="Articles Queue" 
        description="Raw indexed content awaiting processing by generative AI agents."
      />

      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-muted/20">
          <div className="flex items-center gap-2 flex-1 w-full border rounded-md px-3 bg-background">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search article titles..." 
              className="border-0 bg-transparent focus-visible:ring-0 shadow-none px-0 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-background">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-1/2">Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Topics</TableHead>
              <TableHead>Fetched</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Loading articles...
                </TableCell>
              </TableRow>
            ) : filteredArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  No articles found in the queue.
                </TableCell>
              </TableRow>
            ) : (
              filteredArticles.map((article: any) => (
                <TableRow key={article.id} className="group transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-start gap-2">
                      <span className="line-clamp-2">{article.title}</span>
                      <a href={article.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0 mt-1">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={article.status} /></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {article.topics?.slice(0, 2).map((topic: string) => (
                        <span key={topic} className="px-2 py-0.5 rounded-full bg-secondary text-xs text-secondary-foreground font-medium">
                          {topic}
                        </span>
                      ))}
                      {article.topics?.length > 2 && (
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground font-medium">
                          +{article.topics.length - 2}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {article.fetchedAt ? format(new Date(article.fetchedAt), 'MMM d, h:mm a') : 'Unknown'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(article)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this article?')) {
                          deleteArticle.mutate(article.id);
                        }
                      }}
                    >
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
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleUpdate}>
              <DialogHeader>
                <DialogTitle>Edit Article</DialogTitle>
                <DialogDescription>Update the article details. Content is truncated in list; full body may need a refresh.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Title</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="grid gap-2">
                  <Label>URL</Label>
                  <Input value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} required />
                </div>
                <div className="grid gap-2">
                  <Label>Content (excerpt)</Label>
                  <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} />
                </div>
                <div className="grid gap-2">
                  <Label>Topics (comma-separated)</Label>
                  <Input value={formData.topics} onChange={(e) => setFormData({ ...formData, topics: e.target.value })} placeholder="politics, uk-election" />
                </div>
                <div className="grid gap-2">
                  <Label>Entities (comma-separated)</Label>
                  <Input value={formData.entities} onChange={(e) => setFormData({ ...formData, entities: e.target.value })} placeholder="Labour, Conservative" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit" disabled={updateArticle.isPending}>{updateArticle.isPending ? "Saving..." : "Save"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
