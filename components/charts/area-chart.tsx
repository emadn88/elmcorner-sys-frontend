"use client";

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartDataPoint } from "@/types";

interface AreaChartProps {
  data: ChartDataPoint[];
  dataKey: string;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export function AreaChart({
  data,
  dataKey,
  color = "#7c3aed",
  gradientFrom = "#a855f7",
  gradientTo = "#7c3aed",
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsAreaChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
      >
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientFrom} stopOpacity={0.9} />
            <stop offset="50%" stopColor={gradientFrom} stopOpacity={0.4} />
            <stop offset="100%" stopColor={gradientTo} stopOpacity={0.05} />
          </linearGradient>
          <filter id={`glow-${dataKey}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
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
          tickMargin={10}
          tick={{ fill: "#6b7280" }}
        />
        <YAxis
          stroke="#9ca3af"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: "#6b7280" }}
          tickFormatter={(value) => `$${value / 1000}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow: "0 20px 60px -15px rgba(124, 58, 237, 0.3)",
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
          formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
          cursor={{ stroke: color, strokeWidth: 2, strokeDasharray: "5 5" }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={3}
          fill={`url(#gradient-${dataKey})`}
          dot={false}
          activeDot={{ 
            r: 6, 
            fill: color,
            stroke: "white",
            strokeWidth: 2,
            filter: `url(#glow-${dataKey})`
          }}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}

