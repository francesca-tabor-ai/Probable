import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let colorClass = "";

  if (["active", "running", "published", "complete"].includes(normalizedStatus)) {
    colorClass = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25";
    variant = "outline";
  } else if (["pending", "processing", "idle", "draft"].includes(normalizedStatus)) {
    colorClass = "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/25";
    variant = "outline";
  } else if (["error", "failed"].includes(normalizedStatus)) {
    colorClass = "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/25";
    variant = "outline";
  } else {
    colorClass = "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30 hover:bg-slate-500/25";
    variant = "outline";
  }

  return (
    <Badge variant={variant} className={`font-medium capitalize ${colorClass}`}>
      {status}
    </Badge>
  );
}
