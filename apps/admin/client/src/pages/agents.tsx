import { useAgents } from "@/hooks/use-agents";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Cpu, Activity, AlertTriangle, Clock } from "lucide-react";

export default function Agents() {
  const { data: agents, isLoading } = useAgents();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader 
        title="System Agents" 
        description="Monitor the automated workers fetching, processing, and writing content."
      />

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-card rounded-xl border border-border animate-pulse" />
          ))}
        </div>
      ) : agents?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <Cpu className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">No Agents configured</h3>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents?.map((agent: any) => (
            <Card key={agent.id} className="relative overflow-hidden bg-card border-border/50 shadow-sm hover-elevate">
              {agent.status === 'running' && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 animate-pulse" />
              )}
              {agent.status === 'error' && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-rose-600" />
              )}
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      agent.status === 'running' ? 'bg-emerald-500/10 text-emerald-500' :
                      agent.status === 'error' ? 'bg-rose-500/10 text-rose-500' :
                      'bg-slate-500/10 text-slate-500'
                    }`}>
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{agent.type}</p>
                    </div>
                  </div>
                  <StatusBadge status={agent.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-4">
                  {/* Task & Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5" />
                        {agent.currentTask || 'Idle'}
                      </span>
                      <span className="font-mono text-xs">{agent.progress || 0}%</span>
                    </div>
                    <Progress 
                      value={agent.progress || 0} 
                      className="h-1.5" 
                      indicatorClassName={agent.status === 'error' ? 'bg-rose-500' : 'bg-primary'}
                    />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Processed
                      </span>
                      <p className="font-mono font-medium">{agent.totalProcessed || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Errors
                      </span>
                      <p className={`font-mono font-medium ${agent.errorCount > 0 ? 'text-rose-500' : ''}`}>
                        {agent.errorCount || 0}
                      </p>
                    </div>
                  </div>

                  {agent.lastRun && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1 pt-2 border-t border-border/50">
                      <Clock className="w-3 h-3" />
                      Last Run: {format(new Date(agent.lastRun), 'MMM d, h:mm a')}
                    </div>
                  )}
                  
                  {agent.lastError && agent.status === 'error' && (
                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 line-clamp-2 mt-2">
                      {agent.lastError}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Ensure missing import is available
import { FileText } from "lucide-react";
