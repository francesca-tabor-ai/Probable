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
import { useUsers, useUpdateUser, useDeleteUser } from "@/hooks/use-users";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Trash2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
export default function Users() {
    var _a = useUsers(), users = _a.data, isLoading = _a.isLoading;
    var update = useUpdateUser();
    var remove = useDeleteUser();
    var toast = useToast().toast;
    var _b = useState(null), editing = _b[0], setEditing = _b[1];
    var _c = useState({ fullName: "", isActive: true }), form = _c[0], setForm = _c[1];
    var handleUpdate = function (e) {
        e.preventDefault();
        if (!editing)
            return;
        update.mutate({ id: editing.id, data: { fullName: form.fullName || undefined, isActive: form.isActive } }, {
            onSuccess: function () {
                setEditing(null);
                toast({ title: "User updated" });
            },
            onError: function (err) { return toast({ title: "Error", description: err.message, variant: "destructive" }); },
        });
    };
    var handleDelete = function (id) {
        if (!confirm("Delete this user? This cannot be undone."))
            return;
        remove.mutate(id, {
            onSuccess: function () { return toast({ title: "Deleted" }); },
            onError: function (err) { return toast({ title: "Error", description: err.message, variant: "destructive" }); },
        });
    };
    var openEdit = function (u) {
        var _a;
        setEditing(u);
        setForm({ fullName: (_a = u.fullName) !== null && _a !== void 0 ? _a : "", isActive: u.isActive });
    };
    return (_jsxs("div", { className: "p-6 md:p-8 max-w-7xl mx-auto", children: [_jsx(PageHeader, { title: "Users", description: "Manage user accounts." }), _jsx("div", { className: "bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { className: "hover:bg-transparent bg-muted/20", children: [_jsx(TableHead, { children: "ID" }), _jsx(TableHead, { children: "Email" }), _jsx(TableHead, { children: "Name" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Created" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: isLoading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "text-center py-10 text-muted-foreground", children: "Loading..." }) })) : (users === null || users === void 0 ? void 0 : users.length) === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "text-center py-10 text-muted-foreground", children: "No users." }) })) : (users === null || users === void 0 ? void 0 : users.map(function (u) {
                                var _a;
                                return (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-mono", children: u.id }), _jsx(TableCell, { className: "font-medium", children: u.email }), _jsx(TableCell, { className: "text-muted-foreground", children: (_a = u.fullName) !== null && _a !== void 0 ? _a : "—" }), _jsx(TableCell, { children: _jsx(Badge, { variant: u.isActive ? "default" : "secondary", children: u.isActive ? "Active" : "Inactive" }) }), _jsx(TableCell, { className: "text-muted-foreground text-sm", children: u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "—" }), _jsxs(TableCell, { className: "text-right", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: function () { return openEdit(u); }, children: _jsx(Pencil, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: "text-destructive hover:bg-destructive/10", onClick: function () { return handleDelete(u.id); }, children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, u.id));
                            })) })] }) }), editing && (_jsx(Dialog, { open: !!editing, onOpenChange: function () { return setEditing(null); }, children: _jsx(DialogContent, { children: _jsxs("form", { onSubmit: handleUpdate, children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Edit User" }) }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "Email" }), _jsx(Input, { value: editing.email, disabled: true, className: "bg-muted" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "Full Name" }), _jsx(Input, { value: form.fullName, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { fullName: e.target.value })); }); }, placeholder: "Optional" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Switch, { checked: form.isActive, onCheckedChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { isActive: v })); }); } }), _jsx(Label, { children: "Active" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: function () { return setEditing(null); }, children: "Cancel" }), _jsx(Button, { type: "submit", disabled: update.isPending, children: update.isPending ? "Saving..." : "Save" })] })] }) }) }))] }));
}
