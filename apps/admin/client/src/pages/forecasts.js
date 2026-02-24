import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForecasts, useDeleteForecast } from "@/hooks/use-forecasts";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
export default function Forecasts() {
    var _a = useForecasts(), forecasts = _a.data, isLoading = _a.isLoading;
    var deleteForecast = useDeleteForecast();
    return (_jsxs("div", { className: "p-6 md:p-8 max-w-7xl mx-auto", children: [_jsx(PageHeader, { title: "AI Forecasts", description: "Predictions and probabilities extracted and modeled from recent stories." }), _jsx("div", { className: "bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { className: "hover:bg-transparent bg-muted/20", children: [_jsx(TableHead, { className: "w-[200px]", children: "Topic" }), _jsx(TableHead, { className: "w-[300px]", children: "Target Event" }), _jsx(TableHead, { children: "Probability" }), _jsx(TableHead, { children: "Confidence" }), _jsx(TableHead, { children: "Model" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: isLoading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, className: "text-center py-10 text-muted-foreground", children: "Loading forecasts..." }) })) : (forecasts === null || forecasts === void 0 ? void 0 : forecasts.length) === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, className: "text-center py-10 text-muted-foreground", children: "No active forecasts found." }) })) : (forecasts === null || forecasts === void 0 ? void 0 : forecasts.map(function (forecast) { return (_jsxs(TableRow, { className: "group transition-colors", children: [_jsx(TableCell, { className: "font-medium", children: forecast.topic }), _jsx(TableCell, { className: "text-muted-foreground", children: forecast.target }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: "font-mono text-sm font-semibold w-8", children: [forecast.probability, "%"] }), _jsx(Progress, { value: forecast.probability, className: "w-24 h-2 bg-secondary", indicatorClassName: forecast.probability > 75 ? "bg-emerald-500" :
                                                        forecast.probability > 40 ? "bg-amber-500" : "bg-rose-500" })] }) }), _jsx(TableCell, { children: _jsx("span", { className: "px-2 py-1 rounded-md text-xs font-medium ".concat(forecast.confidence === 'High' ? 'bg-emerald-500/10 text-emerald-600' :
                                                forecast.confidence === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                                                    'bg-slate-500/10 text-slate-600'), children: forecast.confidence }) }), _jsx(TableCell, { className: "text-sm", children: forecast.modelType }), _jsx(TableCell, { children: _jsx(StatusBadge, { status: forecast.status }) }), _jsx(TableCell, { className: "text-right", children: _jsx(Button, { variant: "ghost", size: "icon", className: "text-muted-foreground hover:text-destructive hover:bg-destructive/10", onClick: function () {
                                                if (confirm('Delete this forecast?')) {
                                                    deleteForecast.mutate(forecast.id);
                                                }
                                            }, children: _jsx(Trash2, { className: "w-4 h-4" }) }) })] }, forecast.id)); })) })] }) })] }));
}
