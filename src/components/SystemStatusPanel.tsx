import type { SystemStatus } from "@/hooks/useSensorData";

interface SystemStatusPanelProps {
  status: SystemStatus;
  engagementScore: number;
}

export function SystemStatusPanel({ status, engagementScore }: SystemStatusPanelProps) {
  const engagementColor =
    status.engagement === "HIGH" ? "text-success" : status.engagement === "MEDIUM" ? "text-warning" : "text-destructive";

  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">System Status</h2>
      <div className="space-y-4">
        <StatusRow label="Lights" value={status.lights} active={status.lights === "ON"} />
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Engagement</span>
            <span className={`font-mono font-bold text-sm ${engagementColor}`}>{status.engagement}</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                status.engagement === "HIGH" ? "bg-success" : status.engagement === "MEDIUM" ? "bg-warning" : "bg-destructive"
              }`}
              style={{ width: `${engagementScore}%` }}
            />
          </div>
        </div>
        <StatusRow label="Presentation" value={status.presentation} active={status.presentation === "Running"} />
      </div>
    </div>
  );
}

function StatusRow({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${active ? "bg-success animate-pulse-glow" : "bg-muted-foreground"}`} />
        <span className="font-mono text-sm font-medium text-foreground">{value}</span>
      </div>
    </div>
  );
}
