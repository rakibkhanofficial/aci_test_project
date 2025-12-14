"use client";

import React, { useState, useEffect } from "react";
import {
  Server,
  Cpu,
  Network,
  Shield,
  Wifi,
  Battery,
  HardDrive,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SystemMetric {
  id: string;
  label: string;
  value: number;
  max: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  icon: React.ReactNode;
  trend: "up" | "down" | "stable";
}

export function SystemStatus() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    {
      id: "cpu",
      label: "CPU Usage",
      value: 45,
      max: 100,
      unit: "%",
      status: "normal",
      icon: <Cpu className="h-5 w-5" />,
      trend: "stable",
    },
    {
      id: "memory",
      label: "Memory",
      value: 72,
      max: 100,
      unit: "%",
      status: "warning",
      icon: <Server className="h-5 w-5" />,
      trend: "up",
    },
    {
      id: "storage",
      label: "Storage",
      value: 38,
      max: 100,
      unit: "%",
      status: "normal",
      icon: <HardDrive className="h-5 w-5" />,
      trend: "stable",
    },
    {
      id: "network",
      label: "Network",
      value: 92,
      max: 100,
      unit: "Mbps",
      status: "normal",
      icon: <Network className="h-5 w-5" />,
      trend: "up",
    },
    {
      id: "power",
      label: "Power",
      value: 85,
      max: 100,
      unit: "%",
      status: "normal",
      icon: <Battery className="h-5 w-5" />,
      trend: "down",
    },
    {
      id: "security",
      label: "Security",
      value: 100,
      max: 100,
      unit: "%",
      status: "normal",
      icon: <Shield className="h-5 w-5" />,
      trend: "stable",
    },
  ]);

  const [uptime, setUptime] = useState("45d 12h 30m");

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          value: Math.min(
            metric.max,
            Math.max(0, metric.value + (Math.random() - 0.5) * 2)
          ),
        }))
      );

      // Update uptime
      // Update uptime
      setUptime((prev) => {
        // Extract numbers more robustly using regex
        const daysMatch = prev.match(/(\d+)d/);
        const hoursMatch = prev.match(/(\d+)h/);
        const minutesMatch = prev.match(/(\d+)m/);

        // Parse with fallbacks to 0, using optional chaining and nullish coalescing
        const days = daysMatch ? parseInt(daysMatch[1] || "0", 10) : 0;
        const hours = hoursMatch ? parseInt(hoursMatch[1] || "0", 10) : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1] || "0", 10) : 0;

        let newMinutes = minutes + 1;
        let newHours = hours;
        let newDays = days;

        if (newMinutes >= 60) {
          newMinutes = 0;
          newHours = hours + 1;

          if (newHours >= 24) {
            newHours = 0;
            newDays = days + 1;
          }
        }

        return `${newDays}d ${newHours}h ${newMinutes}m`;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getProgressColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <Card className="backdrop-blur-sm bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-500" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Overall Status */}
        <div className="mb-6 p-4 rounded-lg bg-gray-800/30 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-white">
                All Systems Operational
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-400">Uptime: {uptime}</span>
            </div>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all"
              style={{ width: `${92}%` }}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="p-4 rounded-lg border border-gray-800 bg-gray-800/20 hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    metric.status === "normal"
                      ? "bg-green-500/20"
                      : metric.status === "warning"
                      ? "bg-yellow-500/20"
                      : "bg-red-500/20"
                  )}
                >
                  {metric.icon}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {metric.value}
                    {metric.unit}
                  </div>
                  <div
                    className={cn(
                      "text-xs flex items-center justify-end",
                      metric.trend === "up"
                        ? "text-green-400"
                        : metric.trend === "down"
                        ? "text-red-400"
                        : "text-gray-400"
                    )}
                  >
                    {metric.trend === "up"
                      ? "↗"
                      : metric.trend === "down"
                      ? "↘"
                      : "→"}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{metric.label}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      metric.status === "normal"
                        ? "border-green-500 text-green-400"
                        : metric.status === "warning"
                        ? "border-yellow-500 text-yellow-400"
                        : "border-red-500 text-red-400"
                    )}
                  >
                    {metric.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(metric.value / metric.max) * 100}%`,
                      backgroundColor: getProgressColor(
                        metric.value,
                        metric.max
                      ),
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0{metric.unit}</span>
                  <span>
                    {metric.max}
                    {metric.unit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Communication Status */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <Network className="h-4 w-4 text-blue-400" />
            Communication Links
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Primary Link", status: "active", latency: "12ms" },
              { name: "Backup Link", status: "standby", latency: "45ms" },
              { name: "Ground Control", status: "active", latency: "280ms" },
              { name: "Satellite Relay", status: "active", latency: "120ms" },
            ].map((link, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      link.status === "active"
                        ? "bg-green-400 animate-pulse"
                        : link.status === "standby"
                        ? "bg-yellow-400"
                        : "bg-red-400"
                    }`}
                  />
                  <span className="text-sm text-gray-300">{link.name}</span>
                </div>
                <span className="text-sm text-gray-400">{link.latency}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
