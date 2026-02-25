import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/contexts/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { UserMenu } from "@/components/user-menu";
import Dashboard from "@/pages/dashboard";
import Feeds from "@/pages/feeds";
import Articles from "@/pages/articles";
import Stories from "@/pages/stories";
import Forecasts from "@/pages/forecasts";
import Agents from "@/pages/agents";
import DataSources from "@/pages/data-sources";
import Datasets from "@/pages/datasets";
import Integrations from "@/pages/integrations";
import Users from "@/pages/users";
import Login from "@/pages/login";
import SignUp from "@/pages/signup";
var AUTH_ROUTES = ["/login", "/signup"];
function ProtectedLayout(_a) {
    var children = _a.children;
    var _b = useAuth(), isAuthenticated = _b.isAuthenticated, isLoading = _b.isLoading;
    var location = useLocation()[0];
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx(Skeleton, { className: "h-12 w-64" }) }));
    }
    if (!isAuthenticated) {
        return _jsx(Redirect, { to: "/login" });
    }
    return _jsx(_Fragment, { children: children });
}
function AuthLayout(_a) {
    var children = _a.children;
    var _b = useAuth(), isAuthenticated = _b.isAuthenticated, isLoading = _b.isLoading;
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx(Skeleton, { className: "h-12 w-64" }) }));
    }
    if (isAuthenticated) {
        return _jsx(Redirect, { to: "/" });
    }
    return _jsx(_Fragment, { children: children });
}
function Router() {
    var location = useLocation()[0];
    var isAuthRoute = AUTH_ROUTES.includes(location);
    if (isAuthRoute) {
        return (_jsxs(Switch, { children: [_jsx(Route, { path: "/login", children: _jsx(AuthLayout, { children: _jsx(Login, {}) }) }), _jsx(Route, { path: "/signup", children: _jsx(AuthLayout, { children: _jsx(SignUp, {}) }) }), _jsx(Route, { component: NotFound })] }));
    }
    return (_jsx(ProtectedLayout, { children: _jsx(SidebarProvider, { style: {
                "--sidebar-width": "16rem",
                "--sidebar-width-icon": "4rem",
            }, children: _jsxs("div", { className: "flex h-screen w-full bg-background overflow-hidden", children: [_jsx(AppSidebar, {}), _jsxs("div", { className: "flex flex-col flex-1 min-w-0", children: [_jsxs("header", { className: "flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10", children: [_jsx(SidebarTrigger, { "data-testid": "button-sidebar-toggle", className: "text-muted-foreground hover:text-foreground" }), _jsx(UserMenu, {})] }), _jsx("main", { className: "flex-1 overflow-y-auto", children: _jsxs(Switch, { children: [_jsx(Route, { path: "/", component: Dashboard }), _jsx(Route, { path: "/feeds", component: Feeds }), _jsx(Route, { path: "/articles", component: Articles }), _jsx(Route, { path: "/stories", component: Stories }), _jsx(Route, { path: "/forecasts", component: Forecasts }), _jsx(Route, { path: "/data-sources", component: DataSources }), _jsx(Route, { path: "/datasets", component: Datasets }), _jsx(Route, { path: "/integrations", component: Integrations }), _jsx(Route, { path: "/users", component: Users }), _jsx(Route, { path: "/agents", component: Agents }), _jsx(Route, { component: NotFound })] }) })] })] }) }) }));
}
function App() {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(AuthProvider, { children: _jsxs(TooltipProvider, { children: [_jsx(Router, {}), _jsx(Toaster, {})] }) }) }));
}
export default App;
