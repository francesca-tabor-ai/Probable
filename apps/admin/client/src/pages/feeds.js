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
import { useFeeds, useCreateFeed, useDeleteFeed } from "@/hooks/use-feeds";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Plus, Trash2, Search, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
export default function Feeds() {
    var _a = useFeeds(), feeds = _a.data, isLoading = _a.isLoading;
    var createFeed = useCreateFeed();
    var deleteFeed = useDeleteFeed();
    var toast = useToast().toast;
    var _b = useState(false), isOpen = _b[0], setIsOpen = _b[1];
    var _c = useState(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = useState({
        name: "",
        url: "",
        category: "",
    }), formData = _d[0], setFormData = _d[1];
    var filteredFeeds = (feeds === null || feeds === void 0 ? void 0 : feeds.filter(function (feed) {
        return feed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            feed.category.toLowerCase().includes(searchTerm.toLowerCase());
    })) || [];
    var handleSubmit = function (e) {
        e.preventDefault();
        createFeed.mutate(formData, {
            onSuccess: function () {
                setIsOpen(false);
                setFormData({ name: "", url: "", category: "" });
                toast({ title: "Success", description: "RSS Feed added successfully." });
            },
            onError: function (err) {
                toast({ title: "Error", description: err.message, variant: "destructive" });
            }
        });
    };
    return (_jsxs("div", { className: "p-6 md:p-8 max-w-7xl mx-auto", children: [_jsx(PageHeader, { title: "RSS Feeds", description: "Manage the data sources driving your journalism pipelines.", children: _jsxs(Dialog, { open: isOpen, onOpenChange: setIsOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90 transition-opacity", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), " Add Feed"] }) }), _jsx(DialogContent, { className: "sm:max-w-[425px]", children: _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add New Data Source" }), _jsx(DialogDescription, { children: "Enter the RSS feed details to begin indexing articles automatically." })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "name", children: "Feed Name" }), _jsx(Input, { id: "name", placeholder: "e.g. TechCrunch AI", value: formData.name, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }, required: true })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "url", children: "RSS URL" }), _jsx(Input, { id: "url", type: "url", placeholder: "https://...", value: formData.url, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { url: e.target.value })); }, required: true })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "category", children: "Category" }), _jsx(Input, { id: "category", placeholder: "e.g. Technology", value: formData.category, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { category: e.target.value })); }, required: true })] })] }), _jsx(DialogFooter, { children: _jsx(Button, { type: "submit", disabled: createFeed.isPending, children: createFeed.isPending ? "Adding..." : "Add Feed" }) })] }) })] }) }), _jsxs("div", { className: "bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-border/50 flex items-center gap-2 bg-muted/20", children: [_jsx(Search, { className: "w-4 h-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search feeds...", className: "border-0 bg-transparent focus-visible:ring-0 shadow-none px-0 h-8", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); } })] }), _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { className: "hover:bg-transparent", children: [_jsx(TableHead, { children: "Name" }), _jsx(TableHead, { children: "Category" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Articles" }), _jsx(TableHead, { children: "Last Fetched" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: isLoading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "text-center py-10 text-muted-foreground", children: "Loading feeds..." }) })) : filteredFeeds.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "text-center py-10 text-muted-foreground", children: "No feeds found. Add one to get started." }) })) : (filteredFeeds.map(function (feed) { return (_jsxs(TableRow, { className: "group transition-colors", children: [_jsx(TableCell, { className: "font-medium", children: _jsxs("div", { className: "flex items-center gap-2", children: [feed.name, _jsx("a", { href: feed.url, target: "_blank", rel: "noreferrer", className: "text-muted-foreground hover:text-primary transition-colors", children: _jsx(ExternalLink, { className: "w-3 h-3" }) })] }) }), _jsx(TableCell, { children: feed.category }), _jsx(TableCell, { children: _jsx(StatusBadge, { status: feed.status }) }), _jsx(TableCell, { className: "font-mono text-muted-foreground", children: feed.articlesCount || 0 }), _jsx(TableCell, { className: "text-muted-foreground text-sm", children: feed.lastFetched ? format(new Date(feed.lastFetched), 'MMM d, h:mm a') : 'Never' }), _jsx(TableCell, { className: "text-right", children: _jsx(Button, { variant: "ghost", size: "icon", className: "text-muted-foreground hover:text-destructive hover:bg-destructive/10", onClick: function () {
                                                    if (confirm('Are you sure you want to delete this feed?')) {
                                                        deleteFeed.mutate(feed.id);
                                                    }
                                                }, children: _jsx(Trash2, { className: "w-4 h-4" }) }) })] }, feed.id)); })) })] })] })] }));
}
