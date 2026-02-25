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
import { useFeeds, useCreateFeed, useUpdateFeed, useDeleteFeed } from "@/hooks/use-feeds";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Plus, Trash2, Search, ExternalLink, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
export default function Feeds() {
    var _a = useFeeds(), feeds = _a.data, isLoading = _a.isLoading;
    var createFeed = useCreateFeed();
    var updateFeed = useUpdateFeed();
    var deleteFeed = useDeleteFeed();
    var toast = useToast().toast;
    var _b = useState(false), isOpen = _b[0], setIsOpen = _b[1];
    var _c = useState(null), editing = _c[0], setEditing = _c[1];
    var _d = useState(""), searchTerm = _d[0], setSearchTerm = _d[1];
    var _e = useState({
        name: "",
        url: "",
        category: "",
        status: "active",
    }), formData = _e[0], setFormData = _e[1];
    var filteredFeeds = (feeds === null || feeds === void 0 ? void 0 : feeds.filter(function (feed) {
        return feed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            feed.category.toLowerCase().includes(searchTerm.toLowerCase());
    })) || [];
    var handleSubmit = function (e) {
        e.preventDefault();
        createFeed.mutate(formData, {
            onSuccess: function () {
                setIsOpen(false);
                setFormData({ name: "", url: "", category: "", status: "active" });
                toast({ title: "Success", description: "RSS Feed added successfully." });
            },
            onError: function (err) {
                toast({ title: "Error", description: err.message, variant: "destructive" });
            }
        });
    };
    var handleUpdate = function (e) {
        e.preventDefault();
        if (!editing)
            return;
        updateFeed.mutate({ id: editing.id, data: { name: formData.name, url: formData.url, category: formData.category, status: formData.status } }, {
            onSuccess: function () {
                setEditing(null);
                setFormData({ name: "", url: "", category: "", status: "active" });
                toast({ title: "Success", description: "Feed updated." });
            },
            onError: function (err) { return toast({ title: "Error", description: err.message, variant: "destructive" }); },
        });
    };
    var openEdit = function (feed) {
        setEditing(feed);
        setFormData({ name: feed.name, url: feed.url, category: feed.category, status: feed.status });
    };
    return (_jsxs("div", { className: "p-6 md:p-8 max-w-7xl mx-auto", children: [_jsx(PageHeader, { title: "RSS Feeds", description: "Manage the data sources driving your journalism pipelines.", children: _jsxs(Dialog, { open: isOpen, onOpenChange: setIsOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90 transition-opacity", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), " Add Feed"] }) }), _jsx(DialogContent, { className: "sm:max-w-[425px]", children: _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add New Data Source" }), _jsx(DialogDescription, { children: "Enter the RSS feed details to begin indexing articles automatically." })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "name", children: "Feed Name" }), _jsx(Input, { id: "name", placeholder: "e.g. TechCrunch AI", value: formData.name, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }, required: true })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "url", children: "RSS URL" }), _jsx(Input, { id: "url", type: "url", placeholder: "https://...", value: formData.url, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { url: e.target.value })); }, required: true })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "category", children: "Category" }), _jsx(Input, { id: "category", placeholder: "e.g. Technology", value: formData.category, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { category: e.target.value })); }, required: true })] })] }), _jsx(DialogFooter, { children: _jsx(Button, { type: "submit", disabled: createFeed.isPending, children: createFeed.isPending ? "Adding..." : "Add Feed" }) })] }) })] }) }), editing && (_jsx(Dialog, { open: !!editing, onOpenChange: function () { return setEditing(null); }, children: _jsx(DialogContent, { className: "sm:max-w-[425px]", children: _jsxs("form", { onSubmit: handleUpdate, children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Edit Feed" }), _jsx(DialogDescription, { children: "Update the RSS feed details." })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "edit-name", children: "Feed Name" }), _jsx(Input, { id: "edit-name", value: formData.name, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }, required: true })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "edit-url", children: "RSS URL" }), _jsx(Input, { id: "edit-url", type: "url", value: formData.url, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { url: e.target.value })); }, required: true })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "edit-category", children: "Category" }), _jsx(Input, { id: "edit-category", value: formData.category, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { category: e.target.value })); }, required: true })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "edit-status", children: "Status" }), _jsx(Input, { id: "edit-status", value: formData.status, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { status: e.target.value })); }, placeholder: "active | paused | error" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: function () { return setEditing(null); }, children: "Cancel" }), _jsx(Button, { type: "submit", disabled: updateFeed.isPending, children: updateFeed.isPending ? "Saving..." : "Save" })] })] }) }) })), _jsxs("div", { className: "bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-border/50 flex items-center gap-2 bg-muted/20", children: [_jsx(Search, { className: "w-4 h-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search feeds...", className: "border-0 bg-transparent focus-visible:ring-0 shadow-none px-0 h-8", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); } })] }), _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { className: "hover:bg-transparent", children: [_jsx(TableHead, { children: "Name" }), _jsx(TableHead, { children: "Category" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Articles" }), _jsx(TableHead, { children: "Last Fetched" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: isLoading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "text-center py-10 text-muted-foreground", children: "Loading feeds..." }) })) : filteredFeeds.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "text-center py-10 text-muted-foreground", children: "No feeds found. Add one to get started." }) })) : (filteredFeeds.map(function (feed) { return (_jsxs(TableRow, { className: "group transition-colors", children: [_jsx(TableCell, { className: "font-medium", children: _jsxs("div", { className: "flex items-center gap-2", children: [feed.name, _jsx("a", { href: feed.url, target: "_blank", rel: "noreferrer", className: "text-muted-foreground hover:text-primary transition-colors", children: _jsx(ExternalLink, { className: "w-3 h-3" }) })] }) }), _jsx(TableCell, { children: feed.category }), _jsx(TableCell, { children: _jsx(StatusBadge, { status: feed.status }) }), _jsx(TableCell, { className: "font-mono text-muted-foreground", children: feed.articlesCount || 0 }), _jsx(TableCell, { className: "text-muted-foreground text-sm", children: feed.lastFetched ? format(new Date(feed.lastFetched), 'MMM d, h:mm a') : 'Never' }), _jsxs(TableCell, { className: "text-right", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: function () { return openEdit(feed); }, children: _jsx(Pencil, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: "text-muted-foreground hover:text-destructive hover:bg-destructive/10", onClick: function () {
                                                        if (confirm('Are you sure you want to delete this feed?')) {
                                                            deleteFeed.mutate(feed.id);
                                                        }
                                                    }, children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, feed.id)); })) })] })] })] }));
}
