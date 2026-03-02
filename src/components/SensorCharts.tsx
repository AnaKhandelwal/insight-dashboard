import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { HistoryPoint } from "@/hooks/useSensorData";

interface SensorChartsProps {
  history: HistoryPoint[];
}

const chartConfig = [
  { key: "light" as const, label: "Light Level", color: "hsl(40, 90%, 55%)" },
  { key: "distance" as const, label: "Distance (cm)", color: "hsl(180, 80%, 50%)" },
  { key: "engagement" as const, label: "Engagement %", color: "hsl(150, 70%, 45%)" },
];

export function SensorCharts({ history }: SensorChartsProps) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Trends</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {chartConfig.map(({ key, label, color }) => (
          <div key={key}>
            <p className="text-xs text-muted-foreground mb-2 font-medium">{label}</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215, 15%, 50%)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215, 15%, 50%)" }} tickLine={false} axisLine={false} width={35} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(220, 18%, 10%)",
                      border: "1px solid hsl(220, 15%, 18%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "hsl(200, 20%, 90%)",
                    }}
                  />
                  <Line type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
