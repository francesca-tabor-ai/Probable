import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Rss, FileText, BookOpen, TrendingUp, Cpu } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, } from "@/components/ui/sidebar";
var mainNavItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "RSS Feeds", url: "/feeds", icon: Rss },
    { title: "Articles Queue", url: "/articles", icon: FileText },
    { title: "Stories", url: "/stories", icon: BookOpen },
    { title: "Forecasts", url: "/forecasts", icon: TrendingUp },
    { title: "Agents", url: "/agents", icon: Cpu },
];
export function AppSidebar() {
    var location = useLocation()[0];
    return (_jsxs(Sidebar, { className: "border-r border-border/50", children: [_jsx(SidebarHeader, { className: "p-4 border-b border-border/50", children: _jsxs("div", { className: "flex items-center gap-3 px-1", children: [_jsx("div", { className: "w-9 h-9 rounded-xl bg-gradient-signature flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-amber-500/20", children: "P" }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-xl font-bold tracking-tight text-foreground leading-none", children: "Probable" }), _jsx("span", { className: "text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] mt-1", children: "Data Desk" })] })] }) }), _jsx(SidebarContent, { children: _jsxs(SidebarGroup, { children: [_jsx(SidebarGroupLabel, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4 mb-2", children: "Platform" }), _jsx(SidebarGroupContent, { children: _jsx(SidebarMenu, { children: mainNavItems.map(function (item) { return (_jsx(SidebarMenuItem, { children: _jsx(SidebarMenuButton, { asChild: true, isActive: location === item.url, tooltip: item.title, children: _jsxs(Link, { href: item.url, className: "flex items-center gap-3 px-3 py-2 rounded-md transition-all", children: [_jsx(item.icon, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: item.title })] }) }) }, item.title)); }) }) })] }) })] }));
}
