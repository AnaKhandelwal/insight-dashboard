import { Activity, Wifi } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between border-b bg-card/50 backdrop-blur-sm px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Activity className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Smart Classroom Dashboard</h1>
          <p className="text-xs text-muted-foreground">Real-time IoT Monitoring System</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-success text-sm font-mono">
        <Wifi className="h-4 w-4 animate-pulse-glow" />
        <span>LIVE</span>
      </div>
    </header>
  );
}
