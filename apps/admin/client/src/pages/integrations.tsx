import { useState } from "react";
import {
  useMarketplaceApps,
  useUserIntegrations,
  useConnectIntegration,
  useDisconnectIntegration,
} from "@/hooks/use-marketplace";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Plug2, Unplug, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORY_LABELS: Record<string, string> = {
  data: "Data sources",
  communication: "Communication",
  automation: "Automation",
  bi: "BI & dashboards",
};

export default function Integrations() {
  const { data: apps, isLoading } = useMarketplaceApps();
  const { data: integrations, isLoading: loadingIntegrations } = useUserIntegrations();
  const connect = useConnectIntegration();
  const disconnect = useDisconnectIntegration();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<{
    id: number;
    name: string;
    slug: string;
    configSchema?: { fields?: { key: string; label: string }[] };
  } | null>(null);
  const [config, setConfig] = useState<Record<string, string>>({});

  const connectedAppIds = new Set(integrations?.map((i: { appId: number }) => i.appId) ?? []);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    connect.mutate(
      { app_id: selectedApp.id, config },
      {
        onSuccess: () => {
          setOpen(false);
          setSelectedApp(null);
          setConfig({});
          toast({ title: `${selectedApp.name} connected` });
        },
        onError: (err: Error) =>
          toast({ title: "Connection failed", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleDisconnect = (id: number, name: string) => {
    if (!confirm(`Disconnect ${name}?`)) return;
    disconnect.mutate(id, {
      onSuccess: () => toast({ title: "Disconnected" }),
      onError: (err: Error) =>
        toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Integrations"
        description="Connect data sources, automation tools, and BI platforms for advanced probabilistic workflows."
      >
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSelectedApp(null); setConfig({}); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" /> Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            {selectedApp ? (
              <form onSubmit={handleConnect}>
                <DialogHeader>
                  <DialogTitle>Connect {selectedApp.name}</DialogTitle>
                  <DialogDescription>
                    Configure your {selectedApp.name} connection. Credentials are stored securely.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {selectedApp.configSchema?.fields?.map((f: { key: string; label: string }) => (
                    <div key={f.key} className="grid gap-2">
                      <Label htmlFor={f.key}>{f.label}</Label>
                      <Input
                        id={f.key}
                        type={f.key.includes("key") || f.key.includes("secret") ? "password" : "text"}
                        value={config[f.key] ?? ""}
                        onChange={(e) => setConfig((c) => ({ ...c, [f.key]: e.target.value }))}
                        placeholder={`Enter ${f.label.toLowerCase()}`}
                      />
                    </div>
                  ))}
                  {(!selectedApp.configSchema?.fields || selectedApp.configSchema.fields.length === 0) && (
                    <div className="grid gap-2">
                      <Label htmlFor="webhook_url">Webhook URL or API Key</Label>
                      <Input
                        id="webhook_url"
                        type="password"
                        value={config.webhook_url ?? ""}
                        onChange={(e) => setConfig((c) => ({ ...c, webhook_url: e.target.value }))}
                        placeholder="Paste your webhook URL or API key"
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setSelectedApp(null)}>
                    Back
                  </Button>
                  <Button type="submit" disabled={connect.isPending}>
                    {connect.isPending ? "Connecting..." : "Connect"}
                  </Button>
                </DialogFooter>
              </form>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Choose an app</DialogTitle>
                  <DialogDescription>Select an integration to connect to Probable.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 py-4 max-h-[60vh] overflow-y-auto">
                  {apps?.map((app: { id: number; name: string; slug: string; category: string; icon: string; workflows?: { name: string }[]; configSchema?: { fields?: { key: string; label: string }[] } }) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setSelectedApp(app)}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 text-left transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center font-bold text-amber-600">
                        {app.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{app.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {CATEGORY_LABELS[app.category] ?? app.category}
                          {app.workflows?.length ? ` · ${app.workflows.length} workflows` : ""}
                        </div>
                      </div>
                      {connectedAppIds.has(app.id) && (
                        <Badge variant="secondary" className="text-xs">Connected</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Connected integrations */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Connected
        </h3>
        {loadingIntegrations ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-card rounded-xl border border-border animate-pulse" />
            ))}
          </div>
        ) : integrations?.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border border-dashed">
            <Plug2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No integrations yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Connect apps to sync data, automate forecasts, and send alerts. Sign in to connect.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Integration
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations?.map(
              (i: {
                id: number;
                appName: string;
                appIcon: string;
                category: string;
                status: string;
                lastSyncAt: string | null;
              }) => (
                <div
                  key={i.id}
                  className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
                >
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center font-bold text-amber-600">
                    {i.appIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{i.appName}</div>
                    <div className="text-xs text-muted-foreground">
                      {CATEGORY_LABELS[i.category] ?? i.category}
                      {i.lastSyncAt && ` · Synced ${new Date(i.lastSyncAt).toLocaleDateString()}`}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDisconnect(i.id, i.appName)}
                  >
                    <Unplug className="w-4 h-4" />
                  </Button>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* App marketplace grid */}
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Available apps
      </h3>
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-card rounded-xl border border-border animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {apps?.map(
            (app: {
              id: number;
              name: string;
              slug: string;
              description: string;
              category: string;
              icon: string;
              workflows?: { id: string; name: string; description: string }[];
            }) => (
              <div
                key={app.id}
                className="p-5 bg-card rounded-xl border border-border hover:border-amber-500/30 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-lg bg-amber-500/10 flex items-center justify-center font-bold text-amber-600 flex-shrink-0">
                    {app.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold">{app.name}</h4>
                    <Badge variant="secondary" className="text-[10px] mt-1">
                      {CATEGORY_LABELS[app.category] ?? app.category}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{app.description}</p>
                {app.workflows?.length ? (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {app.workflows.slice(0, 3).map((w: { id: string; name: string }) => (
                      <span
                        key={w.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/5 text-[11px] font-medium text-amber-700"
                      >
                        <Zap className="w-3 h-3" />
                        {w.name}
                      </span>
                    ))}
                  </div>
                ) : null}
                <Button
                  variant={connectedAppIds.has(app.id) ? "outline" : "default"}
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    if (connectedAppIds.has(app.id)) return;
                    setSelectedApp(app);
                    setOpen(true);
                  }}
                  disabled={connectedAppIds.has(app.id)}
                >
                  {connectedAppIds.has(app.id) ? (
                    "Connected"
                  ) : (
                    <>
                      <Plug2 className="w-4 h-4 mr-2" />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
