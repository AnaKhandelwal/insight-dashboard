import { Sun, Ruler, Users, Volume2, Hand } from "lucide-react";

interface SensorCardProps {
  icon: "light" | "distance" | "audience" | "sound" | "gesture";
  label: string;
  value: string | number;
  unit?: string;
  status?: "normal" | "warning" | "danger";
}

const iconMap = {
  light: Sun,
  distance: Ruler,
  audience: Users,
  sound: Volume2,
  gesture: Hand,
};

const statusStyles = {
  normal: "border-border glow-primary",
  warning: "border-warning/50 glow-warning",
  danger: "border-destructive/50 glow-destructive",
};

export function SensorCard({ icon, label, value, unit, status = "normal" }: SensorCardProps) {
  const Icon = iconMap[icon];

  return (
    <div className={`rounded-xl border bg-card p-5 transition-all duration-300 animate-data-flash ${statusStyles[status]}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="rounded-lg bg-secondary p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="font-mono text-3xl font-bold text-foreground tracking-tight">
        {value}
        {unit && <span className="text-lg text-muted-foreground ml-1">{unit}</span>}
      </div>
    </div>
  );
}
