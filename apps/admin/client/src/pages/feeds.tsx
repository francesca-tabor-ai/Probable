import { useState } from "react";
import { useFeeds, useCreateFeed, useDeleteFeed } from "@/hooks/use-feeds";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Search, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Feeds() {
  const { data: feeds, isLoading } = useFeeds();
  const createFeed = useCreateFeed();
  const deleteFeed = useDeleteFeed();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    category: "",
  });

  const filteredFeeds = feeds?.filter((feed: any) => 
    feed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feed.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFeed.mutate(formData, {
      onSuccess: () => {
        setIsOpen(false);
        setFormData({ name: "", url: "", category: "" });
        toast({ title: "Success", description: "RSS Feed added successfully." });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader 
        title="RSS Feeds" 
        description="Manage the data sources driving your journalism pipelines."
      >
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4 mr-2" /> Add Feed
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Data Source</DialogTitle>
                <DialogDescription>
                  Enter the RSS feed details to begin indexing articles automatically.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Feed Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. TechCrunch AI"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="url">RSS URL</Label>
                  <Input 
                    id="url" 
                    type="url" 
                    placeholder="https://..."
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input 
                    id="category" 
                    placeholder="e.g. Technology"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createFeed.isPending}>
                  {createFeed.isPending ? "Adding..." : "Add Feed"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center gap-2 bg-muted/20">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search feeds..." 
            className="border-0 bg-transparent focus-visible:ring-0 shadow-none px-0 h-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Last Fetched</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Loading feeds...
                </TableCell>
              </TableRow>
            ) : filteredFeeds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No feeds found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredFeeds.map((feed: any) => (
                <TableRow key={feed.id} className="group transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {feed.name}
                      <a href={feed.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>{feed.category}</TableCell>
                  <TableCell><StatusBadge status={feed.status} /></TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {feed.articlesCount || 0}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {feed.lastFetched ? format(new Date(feed.lastFetched), 'MMM d, h:mm a') : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this feed?')) {
                          deleteFeed.mutate(feed.id);
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
    </div>
  );
}
