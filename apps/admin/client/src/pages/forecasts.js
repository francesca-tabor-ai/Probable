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
import { useForecasts, useCreateForecast, useUpdateForecast, useDeleteForecast } from "@/hooks/use-forecasts";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, Pencil } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
export default function Forecasts() {
    var _a = useForecasts(), forecasts = _a.data, isLoading = _a.isLoading;
    var createForecast = useCreateForecast();
    var updateForecast = useUpdateForecast();
    var deleteForecast = useDeleteForecast();
    var toast = useToast().toast;
    var _b = useState(false), open = _b[0], setOpen = _b[1];
    var _c = useState(null), editing = _c[0], setEditing = _c[1];
    var _d = useState({ topic: "politics", target: "", probability: 50, horizon: "" }), form = _d[0], setForm = _d[1];
    var handleUpdate = function (e) {
        e.preventDefault();
        if (!editing)
            return;
        updateForecast.mutate({ id: editing.id, data: { topic: form.topic, target: form.target, probability: form.probability, horizon: form.horizon || undefined } }, {
            onSuccess: function () {
                setEditing(null);
                toast({ title: "Forecast updated" });
            },
            onError: function (err) { return toast({ title: "Error", description: err.message, variant: "destructive" }); },
        });
    };
    var handleCreate = function (e) {
        e.preventDefault();
        createForecast.mutate({
            topic: form.topic,
            target: form.target,
            probability: form.probability,
            confidence: "medium",
            modelType: "baseline",
            horizon: form.horizon || undefined,
            status: "active",
        }, {
            onSuccess: function () {
                setOpen(false);
                setForm({ topic: "politics", target: "", probability: 50, horizon: "" });
                toast({ title: "Forecast created" });
            },
            onError: function (err) { return toast({ title: "Error", description: err.message, variant: "destructive" }); },
        });
    };
    return (_jsxs("div", { className: "p-6 md:p-8 max-w-7xl mx-auto", children: [_jsx(PageHeader, { title: "AI Forecasts", description: "Predictions and probabilities extracted and modeled from recent stories.", children: _jsxs(Dialog, { open: open, onOpenChange: setOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), " Add Forecast"] }) }), _jsx(DialogContent, { children: _jsxs("form", { onSubmit: handleCreate, children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add Forecast" }), _jsx(DialogDescription, { children: "Create a new forecast with target and probability." })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "topic", children: "Topic" }), _jsx(Input, { id: "topic", value: form.topic, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { topic: e.target.value })); }); } })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "target", children: "Target Event" }), _jsx(Input, { id: "target", value: form.target, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { target: e.target.value })); }); }, placeholder: "e.g. Labour majority", required: true })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "probability", children: "Probability (%)" }), _jsx(Input, { id: "probability", type: "number", min: 0, max: 100, value: form.probability, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { probability: Number(e.target.value) })); }); } })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "horizon", children: "Horizon" }), _jsx(Input, { id: "horizon", value: form.horizon, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { horizon: e.target.value })); }); }, placeholder: "e.g. 2025 election" })] })] }), _jsx(DialogFooter, { children: _jsx(Button, { type: "submit", disabled: createForecast.isPending, children: createForecast.isPending ? "Creating..." : "Create" }) })] }) })] }) }), _jsx("div", { className: "bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { className: "hover:bg-transparent bg-muted/20", children: [_jsx(TableHead, { className: "w-[200px]", children: "Topic" }), _jsx(TableHead, { className: "w-[300px]", children: "Target Event" }), _jsx(TableHead, { children: "Probability" }), _jsx(TableHead, { children: "Confidence" }), _jsx(TableHead, { children: "Model" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: isLoading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, className: "text-center py-10 text-muted-foreground", children: "Loading forecasts..." }) })) : (forecasts === null || forecasts === void 0 ? void 0 : forecasts.length) === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, className: "text-center py-10 text-muted-foreground", children: "No active forecasts found." }) })) : (forecasts === null || forecasts === void 0 ? void 0 : forecasts.map(function (forecast) { return (_jsxs(TableRow, { className: "group transition-colors", children: [_jsx(TableCell, { className: "font-medium", children: forecast.topic }), _jsx(TableCell, { className: "text-muted-foreground", children: forecast.target }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: "font-mono text-sm font-semibold w-8", children: [forecast.probability, "%"] }), _jsx(Progress, { value: forecast.probability, className: "w-24 h-2 bg-secondary", indicatorClassName: forecast.probability > 75 ? "bg-emerald-500" :
                                                        forecast.probability > 40 ? "bg-amber-500" : "bg-rose-500" })] }) }), _jsx(TableCell, { children: _jsx("span", { className: "px-2 py-1 rounded-md text-xs font-medium ".concat(forecast.confidence === 'High' ? 'bg-emerald-500/10 text-emerald-600' :
                                                forecast.confidence === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                                                    'bg-slate-500/10 text-slate-600'), children: forecast.confidence }) }), _jsx(TableCell, { className: "text-sm", children: forecast.modelType }), _jsx(TableCell, { children: _jsx(StatusBadge, { status: forecast.status }) }), _jsxs(TableCell, { className: "text-right", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: function () { setEditing(forecast); setForm({ topic: forecast.topic, target: forecast.target, probability: forecast.probability, horizon: forecast.horizon || "" }); }, children: _jsx(Pencil, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: "text-muted-foreground hover:text-destructive hover:bg-destructive/10", onClick: function () {
                                                    if (confirm('Delete this forecast?')) {
                                                        deleteForecast.mutate(forecast.id);
                                                    }
                                                }, children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, forecast.id)); })) })] }) }), editing && (_jsx(Dialog, { open: !!editing, onOpenChange: function () { return setEditing(null); }, children: _jsx(DialogContent, { children: _jsxs("form", { onSubmit: handleUpdate, children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Edit Forecast" }), _jsx(DialogDescription, { children: "Update the forecast target and probability." })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "Topic" }), _jsx(Input, { value: form.topic, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { topic: e.target.value })); }); } })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "Target Event" }), _jsx(Input, { value: form.target, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { target: e.target.value })); }); }, required: true })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "Probability (%)" }), _jsx(Input, { type: "number", min: 0, max: 100, value: form.probability, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { probability: Number(e.target.value) })); }); } })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "Horizon" }), _jsx(Input, { value: form.horizon, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { horizon: e.target.value })); }); }, placeholder: "e.g. 2025 election" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: function () { return setEditing(null); }, children: "Cancel" }), _jsx(Button, { type: "submit", disabled: updateForecast.isPending, children: updateForecast.isPending ? "Saving..." : "Save" })] })] }) }) }))] }));
}
