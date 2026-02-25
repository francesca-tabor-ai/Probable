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
import { useArticles, useUpdateArticle, useDeleteArticle } from "@/hooks/use-articles";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Trash2, Search, Filter, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
export default function Articles() {
    var _a = useState("all"), statusFilter = _a[0], setStatusFilter = _a[1];
    var _b = useState(""), searchTerm = _b[0], setSearchTerm = _b[1];
    var _c = useState(null), editing = _c[0], setEditing = _c[1];
    var _d = useState({ title: "", url: "", content: "", topics: "", entities: "" }), formData = _d[0], setFormData = _d[1];
    var _e = useArticles(statusFilter !== "all" ? statusFilter : undefined), articles = _e.data, isLoading = _e.isLoading;
    var updateArticle = useUpdateArticle();
    var deleteArticle = useDeleteArticle();
    var toast = useToast().toast;
    var handleUpdate = function (e) {
        e.preventDefault();
        if (!editing)
            return;
        updateArticle.mutate({
            id: editing.id,
            data: {
                title: formData.title,
                url: formData.url,
                content: formData.content || undefined,
                topics: formData.topics ? formData.topics.split(",").map(function (s) { return s.trim(); }).filter(Boolean) : undefined,
                entities: formData.entities ? formData.entities.split(",").map(function (s) { return s.trim(); }).filter(Boolean) : undefined,
            },
        }, {
            onSuccess: function () {
                setEditing(null);
                toast({ title: "Article updated" });
            },
            onError: function (err) { return toast({ title: "Error", description: err.message, variant: "destructive" }); },
        });
    };
    var openEdit = function (article) {
        var _a, _b, _c, _d, _e;
        setEditing(article);
        setFormData({
            title: article.title,
            url: article.url,
            content: (_a = article.content) !== null && _a !== void 0 ? _a : "",
            topics: (_c = (_b = article.topics) === null || _b === void 0 ? void 0 : _b.join(", ")) !== null && _c !== void 0 ? _c : "",
            entities: (_e = (_d = article.entities) === null || _d === void 0 ? void 0 : _d.join(", ")) !== null && _e !== void 0 ? _e : "",
        });
    };
    var filteredArticles = (articles === null || articles === void 0 ? void 0 : articles.filter(function (article) {
        return article.title.toLowerCase().includes(searchTerm.toLowerCase());
    })) || [];
    return (_jsxs("div", { className: "p-6 md:p-8 max-w-7xl mx-auto", children: [_jsx(PageHeader, { title: "Articles Queue", description: "Raw indexed content awaiting processing by generative AI agents." }), _jsxs("div", { className: "bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden mb-6", children: [_jsxs("div", { className: "p-4 border-b border-border/50 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-muted/20", children: [_jsxs("div", { className: "flex items-center gap-2 flex-1 w-full border rounded-md px-3 bg-background", children: [_jsx(Search, { className: "w-4 h-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search article titles...", className: "border-0 bg-transparent focus-visible:ring-0 shadow-none px-0 h-9", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); } })] }), _jsxs("div", { className: "flex items-center gap-2 w-full sm:w-auto", children: [_jsx(Filter, { className: "w-4 h-4 text-muted-foreground" }), _jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [_jsx(SelectTrigger, { className: "w-[150px] bg-background", children: _jsx(SelectValue, { placeholder: "Filter by status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Statuses" }), _jsx(SelectItem, { value: "pending", children: "Pending" }), _jsx(SelectItem, { value: "processing", children: "Processing" }), _jsx(SelectItem, { value: "complete", children: "Complete" }), _jsx(SelectItem, { value: "error", children: "Error" })] })] })] })] }), _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { className: "hover:bg-transparent", children: [_jsx(TableHead, { className: "w-1/2", children: "Title" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Topics" }), _jsx(TableHead, { children: "Fetched" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: isLoading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, className: "text-center py-10 text-muted-foreground", children: "Loading articles..." }) })) : filteredArticles.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, className: "text-center py-10 text-muted-foreground", children: "No articles found in the queue." }) })) : (filteredArticles.map(function (article) {
                                    var _a, _b;
                                    return (_jsxs(TableRow, { className: "group transition-colors", children: [_jsx(TableCell, { className: "font-medium", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx("span", { className: "line-clamp-2", children: article.title }), _jsx("a", { href: article.url, target: "_blank", rel: "noreferrer", className: "text-muted-foreground hover:text-primary transition-colors flex-shrink-0 mt-1", children: _jsx(ExternalLink, { className: "w-3 h-3" }) })] }) }), _jsx(TableCell, { children: _jsx(StatusBadge, { status: article.status }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex flex-wrap gap-1", children: [(_a = article.topics) === null || _a === void 0 ? void 0 : _a.slice(0, 2).map(function (topic) { return (_jsx("span", { className: "px-2 py-0.5 rounded-full bg-secondary text-xs text-secondary-foreground font-medium", children: topic }, topic)); }), ((_b = article.topics) === null || _b === void 0 ? void 0 : _b.length) > 2 && (_jsxs("span", { className: "px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground font-medium", children: ["+", article.topics.length - 2] }))] }) }), _jsx(TableCell, { className: "text-muted-foreground text-sm", children: article.fetchedAt ? format(new Date(article.fetchedAt), 'MMM d, h:mm a') : 'Unknown' }), _jsxs(TableCell, { className: "text-right", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: function () { return openEdit(article); }, children: _jsx(Pencil, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: "text-muted-foreground hover:text-destructive hover:bg-destructive/10", onClick: function () {
                                                            if (confirm('Are you sure you want to delete this article?')) {
                                                                deleteArticle.mutate(article.id);
                                                            }
                                                        }, children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, article.id));
                                })) })] })] }), editing && (_jsx(Dialog, { open: !!editing, onOpenChange: function () { return setEditing(null); }, children: _jsx(DialogContent, { className: "sm:max-w-[600px]", children: _jsxs("form", { onSubmit: handleUpdate, children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Edit Article" }), _jsx(DialogDescription, { children: "Update the article details. Content is truncated in list; full body may need a refresh." })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "Title" }), _jsx(Input, { value: formData.title, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { title: e.target.value })); }, required: true })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "URL" }), _jsx(Input, { value: formData.url, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { url: e.target.value })); }, required: true })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "Content (excerpt)" }), _jsx(Textarea, { value: formData.content, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { content: e.target.value })); }, rows: 4 })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "Topics (comma-separated)" }), _jsx(Input, { value: formData.topics, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { topics: e.target.value })); }, placeholder: "politics, uk-election" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "Entities (comma-separated)" }), _jsx(Input, { value: formData.entities, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { entities: e.target.value })); }, placeholder: "Labour, Conservative" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: function () { return setEditing(null); }, children: "Cancel" }), _jsx(Button, { type: "submit", disabled: updateArticle.isPending, children: updateArticle.isPending ? "Saving..." : "Save" })] })] }) }) }))] }));
}
