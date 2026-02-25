var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useMarketplaceApps, useUserIntegrations, useConnectIntegration, useDisconnectIntegration, } from "@/hooks/use-marketplace";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Plug2, Unplug, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
var CATEGORY_LABELS = {
    data: "Data sources",
    communication: "Communication",
    automation: "Automation",
    bi: "BI & dashboards",
};
export default function Integrations() {
    var _a, _b, _c, _d, _e;
    var _f = useMarketplaceApps(), apps = _f.data, isLoading = _f.isLoading;
    var _g = useUserIntegrations(), integrations = _g.data, loadingIntegrations = _g.isLoading;
    var connect = useConnectIntegration();
    var disconnect = useDisconnectIntegration();
    var toast = useToast().toast;
    var _h = useState(false), open = _h[0], setOpen = _h[1];
    var _j = useState(null), selectedApp = _j[0], setSelectedApp = _j[1];
    var _k = useState({}), config = _k[0], setConfig = _k[1];
    var connectedAppIds = new Set((_a = integrations === null || integrations === void 0 ? void 0 : integrations.map(function (i) { return i.appId; })) !== null && _a !== void 0 ? _a : []);
    var handleConnect = function (e) {
        e.preventDefault();
        if (!selectedApp)
            return;
        connect.mutate({ app_id: selectedApp.id, config: config }, {
            onSuccess: function () {
                setOpen(false);
                setSelectedApp(null);
                setConfig({});
                toast({ title: "".concat(selectedApp.name, " connected") });
            },
            onError: function (err) {
                return toast({ title: "Connection failed", description: err.message, variant: "destructive" });
            },
        });
    };
    var handleDisconnect = function (id, name) {
        if (!confirm("Disconnect ".concat(name, "?")))
            return;
        disconnect.mutate(id, {
            onSuccess: function () { return toast({ title: "Disconnected" }); },
            onError: function (err) {
                return toast({ title: "Error", description: err.message, variant: "destructive" });
            },
        });
    };
    return (_jsxs("div", { className: "p-6 md:p-8 max-w-7xl mx-auto", children: [_jsx(PageHeader, { title: "Integrations", description: "Connect data sources, automation tools, and BI platforms for advanced probabilistic workflows.", children: _jsxs(Dialog, { open: open, onOpenChange: function (o) { setOpen(o); if (!o)
                        setSelectedApp(null); setConfig({}); }, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), " Add Integration"] }) }), _jsx(DialogContent, { className: "max-w-md", children: selectedApp ? (_jsxs("form", { onSubmit: handleConnect, children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: ["Connect ", selectedApp.name] }), _jsxs(DialogDescription, { children: ["Configure your ", selectedApp.name, " connection. Credentials are stored securely."] })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [(_c = (_b = selectedApp.configSchema) === null || _b === void 0 ? void 0 : _b.fields) === null || _c === void 0 ? void 0 : _c.map(function (f) {
                                                var _a;
                                                return (_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: f.key, children: f.label }), _jsx(Input, { id: f.key, type: f.key.includes("key") || f.key.includes("secret") ? "password" : "text", value: (_a = config[f.key]) !== null && _a !== void 0 ? _a : "", onChange: function (e) { return setConfig(function (c) {
                                                                var _a;
                                                                return (__assign(__assign({}, c), (_a = {}, _a[f.key] = e.target.value, _a)));
                                                            }); }, placeholder: "Enter ".concat(f.label.toLowerCase()) })] }, f.key));
                                            }), (!((_d = selectedApp.configSchema) === null || _d === void 0 ? void 0 : _d.fields) || selectedApp.configSchema.fields.length === 0) && (_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "webhook_url", children: "Webhook URL or API Key" }), _jsx(Input, { id: "webhook_url", type: "password", value: (_e = config.webhook_url) !== null && _e !== void 0 ? _e : "", onChange: function (e) { return setConfig(function (c) { return (__assign(__assign({}, c), { webhook_url: e.target.value })); }); }, placeholder: "Paste your webhook URL or API key" })] }))] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: function () { return setSelectedApp(null); }, children: "Back" }), _jsx(Button, { type: "submit", disabled: connect.isPending, children: connect.isPending ? "Connecting..." : "Connect" })] })] })) : (_jsxs(_Fragment, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Choose an app" }), _jsx(DialogDescription, { children: "Select an integration to connect to Probable." })] }), _jsx("div", { className: "grid gap-2 py-4 max-h-[60vh] overflow-y-auto", children: apps === null || apps === void 0 ? void 0 : apps.map(function (app) {
                                            var _a, _b;
                                            return (_jsxs("button", { type: "button", onClick: function () { return setSelectedApp(app); }, className: "flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 text-left transition-colors", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center font-bold text-amber-600", children: app.icon }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "font-medium", children: app.name }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [(_a = CATEGORY_LABELS[app.category]) !== null && _a !== void 0 ? _a : app.category, ((_b = app.workflows) === null || _b === void 0 ? void 0 : _b.length) ? " \u00B7 ".concat(app.workflows.length, " workflows") : ""] })] }), connectedAppIds.has(app.id) && (_jsx(Badge, { variant: "secondary", className: "text-xs", children: "Connected" }))] }, app.id));
                                        }) })] })) })] }) }), _jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4", children: "Connected" }), loadingIntegrations ? (_jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: [1, 2, 3].map(function (i) { return (_jsx("div", { className: "h-24 bg-card rounded-xl border border-border animate-pulse" }, i)); }) })) : (integrations === null || integrations === void 0 ? void 0 : integrations.length) === 0 ? (_jsxs("div", { className: "text-center py-12 bg-card rounded-xl border border-border border-dashed", children: [_jsx(Plug2, { className: "w-12 h-12 text-muted-foreground mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-foreground", children: "No integrations yet" }), _jsx("p", { className: "text-sm text-muted-foreground mt-1 max-w-md mx-auto", children: "Connect apps to sync data, automate forecasts, and send alerts. Sign in to connect." }), _jsxs(Button, { variant: "outline", className: "mt-4", onClick: function () { return setOpen(true); }, children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), " Add Integration"] })] })) : (_jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: integrations === null || integrations === void 0 ? void 0 : integrations.map(function (i) {
                            var _a;
                            return (_jsxs("div", { className: "flex items-center gap-4 p-4 bg-card rounded-xl border border-border", children: [_jsx("div", { className: "w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center font-bold text-amber-600", children: i.appIcon }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "font-medium", children: i.appName }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [(_a = CATEGORY_LABELS[i.category]) !== null && _a !== void 0 ? _a : i.category, i.lastSyncAt && " \u00B7 Synced ".concat(new Date(i.lastSyncAt).toLocaleDateString())] })] }), _jsx(Button, { variant: "ghost", size: "icon", className: "text-destructive hover:bg-destructive/10", onClick: function () { return handleDisconnect(i.id, i.appName); }, children: _jsx(Unplug, { className: "w-4 h-4" }) })] }, i.id));
                        }) }))] }), _jsx("h3", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4", children: "Available apps" }), isLoading ? (_jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: [1, 2, 3, 4, 5, 6].map(function (i) { return (_jsx("div", { className: "h-40 bg-card rounded-xl border border-border animate-pulse" }, i)); }) })) : (_jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: apps === null || apps === void 0 ? void 0 : apps.map(function (app) {
                    var _a, _b;
                    return (_jsxs("div", { className: "p-5 bg-card rounded-xl border border-border hover:border-amber-500/30 transition-colors", children: [_jsxs("div", { className: "flex items-start gap-3 mb-3", children: [_jsx("div", { className: "w-11 h-11 rounded-lg bg-amber-500/10 flex items-center justify-center font-bold text-amber-600 flex-shrink-0", children: app.icon }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold", children: app.name }), _jsx(Badge, { variant: "secondary", className: "text-[10px] mt-1", children: (_a = CATEGORY_LABELS[app.category]) !== null && _a !== void 0 ? _a : app.category })] })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-4 line-clamp-2", children: app.description }), ((_b = app.workflows) === null || _b === void 0 ? void 0 : _b.length) ? (_jsx("div", { className: "flex flex-wrap gap-1 mb-4", children: app.workflows.slice(0, 3).map(function (w) { return (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/5 text-[11px] font-medium text-amber-700", children: [_jsx(Zap, { className: "w-3 h-3" }), w.name] }, w.id)); }) })) : null, _jsx(Button, { variant: connectedAppIds.has(app.id) ? "outline" : "default", size: "sm", className: "w-full", onClick: function () {
                                    if (connectedAppIds.has(app.id))
                                        return;
                                    setSelectedApp(app);
                                    setOpen(true);
                                }, disabled: connectedAppIds.has(app.id), children: connectedAppIds.has(app.id) ? ("Connected") : (_jsxs(_Fragment, { children: [_jsx(Plug2, { className: "w-4 h-4 mr-2" }), "Connect"] })) })] }, app.id));
                }) }))] }));
}
