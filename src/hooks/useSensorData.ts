import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

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

type SensorRow = Tables<"sensor_data">;

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
  const seenIdsRef = useRef<Set<string>>(new Set());

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

  const processSensorRow = useCallback((row: SensorRow) => {
    if (!row?.id || seenIdsRef.current.has(row.id)) return;
    seenIdsRef.current.add(row.id);

    const data: SensorData = {
      light: row.light,
      distance: row.distance,
      motion: row.motion,
      sound: row.sound,
      gesture: row.gesture,
      timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    };

    setSensorData(data);
    setAlerts(generateAlerts(data));

    const date = row.created_at ? new Date(row.created_at) : new Date();
    const timeStr = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;

    setHistory((prev) => {
      const next = [...prev, { time: timeStr, light: data.light, distance: data.distance, engagement: getEngagementScore(data) }];
      return next.slice(-20);
    });
  }, [generateAlerts, getEngagementScore]);

  const loadRecentFromTable = useCallback(async () => {
    const { data, error } = await supabase
      .from("sensor_data")
      .select("id, light, distance, motion, sound, gesture, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    if (data?.length) {
      [...data].reverse().forEach((row) => processSensorRow(row));
    }
  }, [processSensorRow]);

  const loadRecentFromFunction = useCallback(async () => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sensor-data?limit=20`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Function fetch failed with status ${response.status}`);
    }

    const rows = (await response.json()) as SensorRow[];
    if (Array.isArray(rows) && rows.length > 0) {
      [...rows].reverse().forEach((row) => processSensorRow(row));
    }
  }, [processSensorRow]);

  const syncLatestData = useCallback(async () => {
    try {
      await loadRecentFromTable();
    } catch (tableError) {
      console.warn("Direct table read failed, falling back to backend function:", tableError);
      try {
        await loadRecentFromFunction();
      } catch (functionError) {
        console.error("Function fallback also failed:", functionError);
      }
    }
  }, [loadRecentFromTable, loadRecentFromFunction]);

  useEffect(() => {
    void syncLatestData();

    const channel = supabase
      .channel("sensor_data_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_data" },
        (payload) => {
          processSensorRow(payload.new as SensorRow);
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("Realtime channel error. Polling will keep data updated.");
        }
      });

    const intervalId = window.setInterval(() => {
      void syncLatestData();
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [processSensorRow, syncLatestData]);

  return { sensorData, alerts, history, engagementScore: getEngagementScore(sensorData), systemStatus: getSystemStatus(sensorData) };
}

