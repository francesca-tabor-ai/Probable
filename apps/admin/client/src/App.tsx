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

const AUTH_ROUTES = ["/login", "/signup"];

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-12 w-64" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-12 w-64" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function Router() {
  const [location] = useLocation();
  const isAuthRoute = AUTH_ROUTES.includes(location);

  if (isAuthRoute) {
    return (
      <Switch>
        <Route path="/login">
          <AuthLayout>
            <Login />
          </AuthLayout>
        </Route>
        <Route path="/signup">
          <AuthLayout>
            <SignUp />
          </AuthLayout>
        </Route>
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <ProtectedLayout>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "4rem",
          } as React.CSSProperties
        }
      >
        <div className="flex h-screen w-full bg-background overflow-hidden">
          <AppSidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <header className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
              <SidebarTrigger
                data-testid="button-sidebar-toggle"
                className="text-muted-foreground hover:text-foreground"
              />
              <UserMenu />
            </header>
            <main className="flex-1 overflow-y-auto">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/feeds" component={Feeds} />
                <Route path="/articles" component={Articles} />
                <Route path="/stories" component={Stories} />
                <Route path="/forecasts" component={Forecasts} />
                <Route path="/data-sources" component={DataSources} />
                <Route path="/datasets" component={Datasets} />
                <Route path="/integrations" component={Integrations} />
                <Route path="/users" component={Users} />
                <Route path="/agents" component={Agents} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
