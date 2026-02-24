import { useForecasts, useDeleteForecast } from "@/hooks/use-forecasts";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Forecasts() {
  const { data: forecasts, isLoading } = useForecasts();
  const deleteForecast = useDeleteForecast();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader 
        title="AI Forecasts" 
        description="Predictions and probabilities extracted and modeled from recent stories."
      />

      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/20">
              <TableHead className="w-[200px]">Topic</TableHead>
              <TableHead className="w-[300px]">Target Event</TableHead>
              <TableHead>Probability</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Loading forecasts...
                </TableCell>
              </TableRow>
            ) : forecasts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No active forecasts found.
                </TableCell>
              </TableRow>
            ) : (
              forecasts?.map((forecast: any) => (
                <TableRow key={forecast.id} className="group transition-colors">
                  <TableCell className="font-medium">{forecast.topic}</TableCell>
                  <TableCell className="text-muted-foreground">{forecast.target}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold w-8">{forecast.probability}%</span>
                      <Progress 
                        value={forecast.probability} 
                        className="w-24 h-2 bg-secondary" 
                        indicatorClassName={
                          forecast.probability > 75 ? "bg-emerald-500" : 
                          forecast.probability > 40 ? "bg-amber-500" : "bg-rose-500"
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      forecast.confidence === 'High' ? 'bg-emerald-500/10 text-emerald-600' :
                      forecast.confidence === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-slate-500/10 text-slate-600'
                    }`}>
                      {forecast.confidence}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{forecast.modelType}</TableCell>
                  <TableCell><StatusBadge status={forecast.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm('Delete this forecast?')) {
                          deleteForecast.mutate(forecast.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
