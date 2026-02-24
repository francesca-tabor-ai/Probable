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
import DataSources from "@/pages/data-sources";
import Datasets from "@/pages/datasets";
import Integrations from "@/pages/integrations";
import Users from "@/pages/users";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard}/>
      <Route path="/feeds" component={Feeds}/>
      <Route path="/articles" component={Articles}/>
      <Route path="/stories" component={Stories}/>
      <Route path="/forecasts" component={Forecasts}/>
      <Route path="/data-sources" component={DataSources}/>
      <Route path="/datasets" component={Datasets}/>
      <Route path="/integrations" component={Integrations}/>
      <Route path="/users" component={Users}/>
      <Route path="/agents" component={Agents}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full bg-background overflow-hidden">
            <AppSidebar />
            <div className="flex flex-col flex-1 min-w-0">
              <header className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <SidebarTrigger data-testid="button-sidebar-toggle" className="text-muted-foreground hover:text-foreground" />
                {/* Could add user profile / theme toggle here */}
              </header>
              <main className="flex-1 overflow-y-auto">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
