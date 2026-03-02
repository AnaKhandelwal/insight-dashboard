import { useState, useEffect, useCallback } from "react";

export interface SensorData {
  light: number;
  distance: number;
  motion: boolean;
  sound: number;
  gesture: string;
  timestamp: number;
}

export interface Alert {
  id: string;
  message: string;
  type: "warning" | "danger" | "info";
  timestamp: number;
}

export interface SystemStatus {
  lights: "ON" | "OFF";
  engagement: "HIGH" | "MEDIUM" | "LOW";
  presentation: "Running" | "Stopped";
}

export interface HistoryPoint {
  time: string;
  light: number;
  distance: number;
  engagement: number;
}

const GESTURES = ["NONE", "LEFT", "RIGHT", "UP", "DOWN", "WAVE"];

function randomInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function useSensorData() {
  const [sensorData, setSensorData] = useState<SensorData>({
    light: 1200,
    distance: 80,
    motion: true,
    sound: 400,
    gesture: "NONE",
    timestamp: Date.now(),
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  const generateAlerts = useCallback((data: SensorData) => {
    const newAlerts: Alert[] = [];
    if (data.light < 800) {
      newAlerts.push({ id: crypto.randomUUID(), message: "Room is too dark", type: "warning", timestamp: Date.now() });
    }
    if (data.distance < 50) {
      newAlerts.push({ id: crypto.randomUUID(), message: "Move away from screen", type: "danger", timestamp: Date.now() });
    }
    if (!data.motion) {
      newAlerts.push({ id: crypto.randomUUID(), message: "Audience inactive", type: "info", timestamp: Date.now() });
    }
    if (data.sound > 800) {
      newAlerts.push({ id: crypto.randomUUID(), message: "Too much noise", type: "danger", timestamp: Date.now() });
    }
    return newAlerts;
  }, []);

  const getEngagementScore = useCallback((data: SensorData) => {
    let score = 0;
    if (data.motion) score += 40;
    if (data.sound > 200 && data.sound < 700) score += 30;
    if (data.light > 800) score += 15;
    if (data.gesture !== "NONE") score += 15;
    return Math.min(score, 100);
  }, []);

  const getSystemStatus = useCallback((data: SensorData): SystemStatus => {
    const engagement = getEngagementScore(data);
    return {
      lights: data.light > 600 ? "ON" : "OFF",
      engagement: engagement > 65 ? "HIGH" : engagement > 35 ? "MEDIUM" : "LOW",
      presentation: data.gesture !== "NONE" || data.motion ? "Running" : "Stopped",
    };
  }, [getEngagementScore]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newData: SensorData = {
        light: randomInRange(400, 1800),
        distance: randomInRange(20, 150),
        motion: Math.random() > 0.25,
        sound: randomInRange(100, 1000),
        gesture: GESTURES[Math.floor(Math.random() * GESTURES.length)],
        timestamp: Date.now(),
      };

      setSensorData(newData);
      setAlerts(generateAlerts(newData));

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
      setHistory((prev) => {
        const next = [...prev, { time: timeStr, light: newData.light, distance: newData.distance, engagement: getEngagementScore(newData) }];
        return next.slice(-20);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [generateAlerts, getEngagementScore]);

  return { sensorData, alerts, history, engagementScore: getEngagementScore(sensorData), systemStatus: getSystemStatus(sensorData) };
}
