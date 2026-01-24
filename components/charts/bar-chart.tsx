"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartDataPoint } from "@/types";

interface BarChartProps {
  data: ChartDataPoint[];
  dataKey: string;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export function BarChart({
  data,
  dataKey,
  color = "#3b82f6",
  gradientFrom = "#3b82f6",
  gradientTo = "#6366f1",
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
      >
        <defs>
          <linearGradient id={`bar-gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientFrom} stopOpacity={1} />
            <stop offset="50%" stopColor={gradientFrom} stopOpacity={0.9} />
            <stop offset="100%" stopColor={gradientTo} stopOpacity={0.7} />
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="#e5e7eb" 
          opacity={0.5}
          vertical={false}
        />
        <XAxis
          dataKey="name"
          stroke="#9ca3af"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={90}
          tick={{ fill: "#6b7280" }}
          tickMargin={8}
        />
        <YAxis
          stroke="#9ca3af"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#6b7280" }}
          tickMargin={8}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow: "0 20px 60px -15px rgba(59, 130, 246, 0.3)",
            padding: "12px 16px",
          }}
          labelStyle={{ 
            color: "#374151", 
            fontWeight: 600,
            fontSize: "13px",
            marginBottom: "4px"
          }}
          itemStyle={{ 
            color: "#6b7280",
            fontSize: "13px"
          }}
          formatter={(value: number) => [value, "Enrollments"]}
          cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
        />
        <Bar
          dataKey={dataKey}
          fill={`url(#bar-gradient-${dataKey})`}
          radius={[10, 10, 0, 0]}
          stroke={gradientFrom}
          strokeWidth={0}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

