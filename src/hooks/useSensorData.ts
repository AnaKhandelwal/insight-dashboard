import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export function useSensorData() {
  const [sensorData, setSensorData] = useState<SensorData>({
    light: 0,
    distance: 0,
    motion: false,
    sound: 0,
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

  const processSensorRow = useCallback((row: any) => {
    const data: SensorData = {
      light: row.light,
      distance: row.distance,
      motion: row.motion,
      sound: row.sound,
      gesture: row.gesture,
      timestamp: new Date(row.created_at).getTime(),
    };
    setSensorData(data);
    setAlerts(generateAlerts(data));

    const date = new Date(row.created_at);
    const timeStr = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
    setHistory((prev) => {
      const next = [...prev, { time: timeStr, light: data.light, distance: data.distance, engagement: getEngagementScore(data) }];
      return next.slice(-20);
    });
  }, [generateAlerts, getEngagementScore]);

  useEffect(() => {
    // Fetch initial data
    const fetchInitial = async () => {
      const { data } = await (supabase as any)
        .from("sensor_data")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        const sorted = [...data].reverse();
        sorted.forEach((row: any) => processSensorRow(row));
      }
    };
    fetchInitial();

    // Subscribe to realtime inserts
    const channel = supabase
      .channel("sensor_data_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_data" },
        (payload) => {
          processSensorRow(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [processSensorRow]);

  return { sensorData, alerts, history, engagementScore: getEngagementScore(sensorData), systemStatus: getSystemStatus(sensorData) };
}
