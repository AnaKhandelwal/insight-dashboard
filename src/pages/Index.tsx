import { DashboardHeader } from "@/components/DashboardHeader";
import { SensorCard } from "@/components/SensorCard";
import { AlertsPanel } from "@/components/AlertsPanel";
import { SystemStatusPanel } from "@/components/SystemStatusPanel";
import { SensorCharts } from "@/components/SensorCharts";
import { useSensorData } from "@/hooks/useSensorData";

const Index = () => {
  const { sensorData, alerts, history, engagementScore, systemStatus } = useSensorData();

  const lightStatus = sensorData.light < 800 ? "warning" : "normal";
  const distanceStatus = sensorData.distance < 50 ? "danger" : "normal";
  const soundStatus = sensorData.sound > 800 ? "danger" : "normal";

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Sensor Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <SensorCard icon="light" label="Light Level" value={sensorData.light} unit="lux" status={lightStatus} />
          <SensorCard icon="distance" label="Distance" value={sensorData.distance} unit="cm" status={distanceStatus} />
          <SensorCard icon="audience" label="Audience" value={sensorData.motion ? "Active" : "Inactive"} status={sensorData.motion ? "normal" : "warning"} />
          <SensorCard icon="sound" label="Sound Level" value={sensorData.sound} unit="dB" status={soundStatus} />
          <SensorCard icon="gesture" label="Gesture" value={sensorData.gesture} />
        </div>

        {/* Alerts + Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AlertsPanel alerts={alerts} />
          <SystemStatusPanel status={systemStatus} engagementScore={engagementScore} />
        </div>

        {/* Charts */}
        <SensorCharts history={history} />
      </main>
    </div>
  );
};

export default Index;
