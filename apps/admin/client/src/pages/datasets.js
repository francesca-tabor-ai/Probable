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
    var _a = useDatasets(), datasets = _a.data, isLoading = _a.isLoading;
    var create = useCreateDataset();
    var remove = useDeleteDataset();
    var toast = useToast().toast;
    var _b = useState(false), open = _b[0], setOpen = _b[1];
    var _c = useState({ topic: "", source: "Admin", data: "{}" }), form = _c[0], setForm = _c[1];
    var handleCreate = function (e) {
        e.preventDefault();
        var data = {};
        try {
            data = JSON.parse(form.data || "{}");
        }
        catch (_a) {
            toast({ title: "Invalid JSON", variant: "destructive" });
            return;
        }
        create.mutate({ topic: form.topic, source: form.source, data: data }, {
            onSuccess: function () {
                setOpen(false);
                setForm({ topic: "", source: "Admin", data: "{}" });
                toast({ title: "Dataset created" });
            },
            onError: function (err) { return toast({ title: "Error", description: err.message, variant: "destructive" }); },
        });
    };
    var handleDelete = function (id) {
        if (!confirm("Delete this dataset?"))
            return;
        remove.mutate(id, {
            onSuccess: function () { return toast({ title: "Deleted" }); },
            onError: function (err) { return toast({ title: "Error", description: err.message, variant: "destructive" }); },
        });
    };
    return (_jsxs("div", { className: "p-6 md:p-8 max-w-7xl mx-auto", children: [_jsx(PageHeader, { title: "Datasets", description: "Cleaned data blobs linked to articles.", children: _jsxs(Dialog, { open: open, onOpenChange: setOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), " Add Dataset"] }) }), _jsx(DialogContent, { children: _jsxs("form", { onSubmit: handleCreate, children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add Dataset" }), _jsx(DialogDescription, { children: "Create a new dataset with topic and JSON data." })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "Topic" }), _jsx(Input, { value: form.topic, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { topic: e.target.value })); }); }, placeholder: "e.g. politics", required: true })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "Source" }), _jsx(Input, { value: form.source, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { source: e.target.value })); }); }, placeholder: "Admin" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "Data (JSON)" }), _jsx(Input, { value: form.data, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { data: e.target.value })); }); }, placeholder: '{"key": "value"}' })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: function () { return setOpen(false); }, children: "Cancel" }), _jsx(Button, { type: "submit", disabled: create.isPending, children: create.isPending ? "Creating..." : "Create" })] })] }) })] }) }), _jsx("div", { className: "bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { className: "hover:bg-transparent bg-muted/20", children: [_jsx(TableHead, { children: "ID" }), _jsx(TableHead, { children: "Topic" }), _jsx(TableHead, { children: "Source" }), _jsx(TableHead, { children: "Article ID" }), _jsx(TableHead, { children: "Created" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: isLoading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "text-center py-10 text-muted-foreground", children: "Loading..." }) })) : (datasets === null || datasets === void 0 ? void 0 : datasets.length) === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "text-center py-10 text-muted-foreground", children: "No datasets." }) })) : (datasets === null || datasets === void 0 ? void 0 : datasets.map(function (d) {
                                var _a;
                                return (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-mono", children: d.id }), _jsx(TableCell, { className: "font-medium", children: d.topic }), _jsx(TableCell, { children: d.source }), _jsx(TableCell, { className: "text-muted-foreground", children: (_a = d.articleId) !== null && _a !== void 0 ? _a : "—" }), _jsx(TableCell, { className: "text-muted-foreground text-sm", children: d.createdAt ? format(new Date(d.createdAt), "MMM d, yyyy") : "—" }), _jsx(TableCell, { className: "text-right", children: _jsx(Button, { variant: "ghost", size: "icon", className: "text-destructive hover:bg-destructive/10", onClick: function () { return handleDelete(d.id); }, children: _jsx(Trash2, { className: "w-4 h-4" }) }) })] }, d.id));
                            })) })] }) })] }));
}
