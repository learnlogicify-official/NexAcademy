"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ArrowUp, TrendingUp } from "lucide-react";

// Types
type TimeRange = "daily" | "weekly" | "monthly";
type MetricType = "xp" | "problems" | "time";

interface DataPoint {
  date: string;
  xp: number;
  problems: number;
  time: number;
}

// Generate mock data
const generateMockData = (timeRange: TimeRange): DataPoint[] => {
  const data: DataPoint[] = [];
  const now = new Date();
  const points = timeRange === "daily" ? 7 : timeRange === "weekly" ? 4 : 12;

  for (let i = points - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      date:
        timeRange === "daily"
          ? date.toLocaleDateString("en-US", { weekday: "short" })
          : timeRange === "weekly"
          ? `Week ${i + 1}`
          : date.toLocaleDateString("en-US", { month: "short" }),
      xp: Math.floor(Math.random() * 1000) + 500,
      problems: Math.floor(Math.random() * 20) + 10,
      time: Math.floor(Math.random() * 120) + 60,
    });
  }

  return data;
};

// Custom tooltip
interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function LearningAnalyticsGraph() {
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly");
  const [metric, setMetric] = useState<MetricType>("xp");
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    setData(generateMockData(timeRange));
  }, [timeRange]);

  const getMetricColor = (metricType: MetricType): string => {
    switch (metricType) {
      case "xp":
        return "#4CAF50";
      case "problems":
        return "#2196F3";
      case "time":
        return "#FF9800";
      default:
        return "#4CAF50";
    }
  };

  const getMetricLabel = (metricType: MetricType): string => {
    switch (metricType) {
      case "xp":
        return "XP Earned";
      case "problems":
        return "Problems Solved";
      case "time":
        return "Time Spent (min)";
      default:
        return "";
    }
  };

  const getTimeRangeLabel = (range: TimeRange): string => {
    switch (range) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      default:
        return "Weekly";
    }
  };

  // Calculate summary statistics
  const calculateStats = () => {
    if (!data.length) return { total: 0, average: 0, change: 0 };

    const total = data.reduce((sum, item) => sum + item[metric], 0);
    const average = Math.round(total / data.length);

    // Calculate change percentage (comparing last value to first value)
    const firstValue = data[0][metric];
    const lastValue = data[data.length - 1][metric];
    const change = firstValue
      ? Math.round(((lastValue - firstValue) / firstValue) * 100)
      : 0;

    return { total, average, change };
  };

  const stats = calculateStats();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Learning Progress</CardTitle>
          <div className="flex items-center gap-3">
            <Select
              value={timeRange}
              onValueChange={(value) => setTimeRange(value as TimeRange)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Select time range">
                  {getTimeRangeLabel(timeRange)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={metric}
              onValueChange={(value) => setMetric(value as MetricType)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xp">XP Earned</SelectItem>
                <SelectItem value="problems">Problems Solved</SelectItem>
                <SelectItem value="time">Time Spent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              Total {getMetricLabel(metric)}
            </p>
            <p className="text-2xl font-bold mt-1">
              {stats.total.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Over {timeRange} period
            </p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm text-muted-foreground">Average</p>
            <p className="text-2xl font-bold mt-1">
              {stats.average.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Per{" "}
              {timeRange === "daily"
                ? "day"
                : timeRange === "weekly"
                ? "week"
                : "month"}
            </p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm text-muted-foreground">Trend</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold">{stats.change}%</p>
              {stats.change > 0 ? (
                <ArrowUp className="text-green-500 h-5 w-5" />
              ) : (
                <TrendingUp className="text-blue-500 h-5 w-5" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From beginning to end
            </p>
          </div>
        </div>

        <div className="h-[350px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#444"
                opacity={0.1}
              />
              <XAxis
                dataKey="date"
                stroke="#888"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, "dataMax + 100"]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey={metric}
                name={getMetricLabel(metric)}
                stroke={getMetricColor(metric)}
                strokeWidth={2}
                dot={{ fill: getMetricColor(metric), r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
