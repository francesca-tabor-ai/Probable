import { useDashboardStats } from "@/hooks/use-dashboard";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Rss, 
  FileText, 
  BookOpen, 
  TrendingUp, 
  Cpu, 
  AlertCircle
} from "lucide-react";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for the chart since it's not in the API
const mockTrendData = [
  { name: "Mon", stories: 4, forecasts: 2 },
  { name: "Tue", stories: 7, forecasts: 5 },
  { name: "Wed", stories: 5, forecasts: 4 },
  { name: "Thu", stories: 12, forecasts: 8 },
  { name: "Fri", stories: 18, forecasts: 12 },
  { name: "Sat", stories: 15, forecasts: 9 },
  { name: "Sun", stories: 22, forecasts: 15 },
];

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl">
          <span className="text-gradient">Probable</span> Dashboard
        </h1>
        <p className="text-xl font-medium text-muted-foreground leading-relaxed max-w-3xl">
          Autonomous Data Journalism & Forecasting Desk. Monitoring real-time insights with technical precision and human-friendly clarity.
        </p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="glass-card hover-elevate overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Stories
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalStories || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-emerald-500 font-medium">{stats?.publishedStories || 0} published</span>
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-elevate overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Forecasts
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.activeForecasts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {stats?.totalForecasts || 0} total predictions
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-elevate overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Articles Queue
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.pendingArticles || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting processing by agents
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-elevate overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              System Agents
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Cpu className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.agentsRunning || 0}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {stats?.agentsWithErrors ? (
                <>
                  <AlertCircle className="w-3 h-3 text-rose-500" />
                  <span className="text-rose-500 font-medium">{stats.agentsWithErrors} errors reported</span>
                </>
              ) : (
                <span className="text-emerald-500 font-medium">All systems healthy</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="grid gap-6 md:grid-cols-7 mb-8">
        <Card className="md:col-span-4 lg:col-span-5 glass-card shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Production Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStories" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorForecasts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                  />
                  <Area type="monotone" dataKey="stories" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorStories)" />
                  <Area type="monotone" dataKey="forecasts" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorForecasts)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Stats */}
        <Card className="md:col-span-3 lg:col-span-2 glass-card shadow-sm border-border/50 flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Rss className="w-4 h-4" /> Active Feeds
                </span>
                <span className="font-bold">{stats?.activeFeeds || 0}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${((stats?.activeFeeds || 0) / Math.max(stats?.totalFeeds || 1, 1)) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">of {stats?.totalFeeds || 0} total</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Total Articles
                </span>
                <span className="font-bold">{stats?.totalArticles || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">Indexed in database</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
