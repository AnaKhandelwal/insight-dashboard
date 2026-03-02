import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { Alert } from "@/hooks/useSensorData";

interface AlertsPanelProps {
  alerts: Alert[];
}

const alertConfig = {
  warning: { icon: AlertTriangle, className: "border-warning/30 bg-warning/5 text-warning" },
  danger: { icon: AlertCircle, className: "border-destructive/30 bg-destructive/5 text-destructive" },
  info: { icon: Info, className: "border-primary/30 bg-primary/5 text-primary" },
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Alerts</h2>
      {alerts.length === 0 ? (
        <p className="text-sm text-success font-medium font-mono">✓ All systems normal</p>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const config = alertConfig[alert.type];
            const Icon = config.icon;
            return (
              <div key={alert.id} className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium animate-slide-up ${config.className}`}>
                <Icon className="h-4 w-4 shrink-0" />
                {alert.message}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
