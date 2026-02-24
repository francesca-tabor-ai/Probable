import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function PageHeader(_a) {
    var title = _a.title, description = _a.description, children = _a.children;
    return (_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("h1", { className: "text-3xl font-black tracking-tight text-foreground", children: title }), description && (_jsx("p", { className: "text-lg text-muted-foreground font-medium leading-relaxed", children: description }))] }), _jsx("div", { className: "flex items-center gap-3", children: children })] }));
}
