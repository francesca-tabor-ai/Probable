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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    var _a = useDataSources(), sources = _a.data, isLoading = _a.isLoading;
    var create = useCreateDataSource();
    var update = useUpdateDataSource();
    var remove = useDeleteDataSource();
    var toast = useToast().toast;
    var _b = useState(false), open = _b[0], setOpen = _b[1];
    var _c = useState(null), editing = _c[0], setEditing = _c[1];
    var _d = useState({ topic: "", config: "{}" }), form = _d[0], setForm = _d[1];
    var handleCreate = function (e) {
        e.preventDefault();
        var config = {};
        try {
            config = JSON.parse(form.config || "{}");
        }
        catch (_a) {
            toast({ title: "Invalid JSON", variant: "destructive" });
            return;
        }
        create.mutate({ topic: form.topic, config: config }, {
            onSuccess: function () {
                setOpen(false);
                setForm({ topic: "", config: "{}" });
                toast({ title: "Data source created" });
            },
            onError: function (err) { return toast({ title: "Error", description: err.message, variant: "destructive" }); },
        });
    };
    var handleUpdate = function (e) {
        e.preventDefault();
        if (!editing)
            return;
        var config = {};
        try {
            config = JSON.parse(form.config || "{}");
        }
        catch (_a) {
            toast({ title: "Invalid JSON", variant: "destructive" });
            return;
        }
        update.mutate({ id: editing.id, data: { topic: form.topic, config: config } }, {
            onSuccess: function () {
                setEditing(null);
                setForm({ topic: "", config: "{}" });
                toast({ title: "Updated" });
            },
            onError: function (err) { return toast({ title: "Error", description: err.message, variant: "destructive" }); },
        });
    };
    var handleDelete = function (id) {
        if (!confirm("Delete this data source?"))
            return;
        remove.mutate(id, {
            onSuccess: function () { return toast({ title: "Deleted" }); },
            onError: function (err) { return toast({ title: "Error", description: err.message, variant: "destructive" }); },
        });
    };
    return (_jsxs("div", { className: "p-6 md:p-8 max-w-7xl mx-auto", children: [_jsx(PageHeader, { title: "Data Sources", description: "Configure external data sources per topic.", children: _jsxs(Dialog, { open: open, onOpenChange: setOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), " Add Source"] }) }), _jsx(DialogContent, { children: _jsxs("form", { onSubmit: handleCreate, children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add Data Source" }), _jsx(DialogDescription, { children: "Topic and config for the data source." })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "topic", children: "Topic" }), _jsx(Input, { id: "topic", value: form.topic, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { topic: e.target.value })); }); }, placeholder: "e.g. politics", required: true })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "config", children: "Config (JSON)" }), _jsx(Input, { id: "config", value: form.config, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { config: e.target.value })); }); }, placeholder: '{"rss_feeds": []}' })] })] }), _jsx(DialogFooter, { children: _jsx(Button, { type: "submit", disabled: create.isPending, children: create.isPending ? "Adding..." : "Add" }) })] }) })] }) }), _jsx("div", { className: "bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { className: "hover:bg-transparent bg-muted/20", children: [_jsx(TableHead, { children: "ID" }), _jsx(TableHead, { children: "Topic" }), _jsx(TableHead, { children: "Config" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: isLoading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 4, className: "text-center py-10 text-muted-foreground", children: "Loading..." }) })) : (sources === null || sources === void 0 ? void 0 : sources.length) === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 4, className: "text-center py-10 text-muted-foreground", children: "No data sources." }) })) : (sources === null || sources === void 0 ? void 0 : sources.map(function (s) { return (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-mono", children: s.id }), _jsx(TableCell, { className: "font-medium", children: s.topic }), _jsx(TableCell, { className: "text-muted-foreground text-sm max-w-xs truncate", children: JSON.stringify(s.config) }), _jsxs(TableCell, { className: "text-right", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: function () { var _a; setEditing(s); setForm({ topic: s.topic, config: JSON.stringify((_a = s.config) !== null && _a !== void 0 ? _a : {}, null, 2) }); }, children: _jsx(Pencil, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: "text-destructive hover:bg-destructive/10", onClick: function () { return handleDelete(s.id); }, children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, s.id)); })) })] }) }), editing && (_jsx(Dialog, { open: !!editing, onOpenChange: function () { return setEditing(null); }, children: _jsx(DialogContent, { children: _jsxs("form", { onSubmit: handleUpdate, children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Edit Data Source" }) }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "Topic" }), _jsx(Input, { value: form.topic, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { topic: e.target.value })); }); } })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "Config (JSON)" }), _jsx(Input, { value: form.config, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { config: e.target.value })); }); } })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: function () { return setEditing(null); }, children: "Cancel" }), _jsx(Button, { type: "submit", disabled: update.isPending, children: update.isPending ? "Saving..." : "Save" })] })] }) }) }))] }));
}
