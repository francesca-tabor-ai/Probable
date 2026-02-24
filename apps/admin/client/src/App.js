import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import NotFound from "@/pages/not-found";
import { AppSidebar } from "@/components/app-sidebar";
import Dashboard from "@/pages/dashboard";
import Feeds from "@/pages/feeds";
import Articles from "@/pages/articles";
import Stories from "@/pages/stories";
import Forecasts from "@/pages/forecasts";
import Agents from "@/pages/agents";
function Router() {
    return (_jsxs(Switch, { children: [_jsx(Route, { path: "/", component: Dashboard }), _jsx(Route, { path: "/feeds", component: Feeds }), _jsx(Route, { path: "/articles", component: Articles }), _jsx(Route, { path: "/stories", component: Stories }), _jsx(Route, { path: "/forecasts", component: Forecasts }), _jsx(Route, { path: "/agents", component: Agents }), _jsx(Route, { component: NotFound })] }));
}
function App() {
    var style = {
        "--sidebar-width": "16rem",
        "--sidebar-width-icon": "4rem",
    };
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsxs(TooltipProvider, { children: [_jsx(SidebarProvider, { style: style, children: _jsxs("div", { className: "flex h-screen w-full bg-background overflow-hidden", children: [_jsx(AppSidebar, {}), _jsxs("div", { className: "flex flex-col flex-1 min-w-0", children: [_jsx("header", { className: "flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10", children: _jsx(SidebarTrigger, { "data-testid": "button-sidebar-toggle", className: "text-muted-foreground hover:text-foreground" }) }), _jsx("main", { className: "flex-1 overflow-y-auto", children: _jsx(Router, {}) })] })] }) }), _jsx(Toaster, {})] }) }));
}
export default App;
