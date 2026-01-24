"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartDataPoint } from "@/types";

interface LineChartProps {
  data: ChartDataPoint[];
  dataKey: string;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export function LineChart({
  data,
  dataKey,
  color = "#ec4899",
  gradientFrom = "#ec4899",
  gradientTo = "#d946ef",
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
      >
        <defs>
          <linearGradient id={`line-gradient-${dataKey}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={gradientFrom} stopOpacity={1} />
            <stop offset="100%" stopColor={gradientTo} stopOpacity={1} />
          </linearGradient>
          <filter id={`line-glow-${dataKey}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
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
          tick={{ fill: "#6b7280" }}
          tickMargin={10}
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
            boxShadow: "0 20px 60px -15px rgba(236, 72, 153, 0.3)",
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
          formatter={(value: number) => [value.toLocaleString(), "Users"]}
          cursor={{ stroke: color, strokeWidth: 2, strokeDasharray: "5 5" }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={`url(#line-gradient-${dataKey})`}
          strokeWidth={4}
          dot={{ 
            fill: color, 
            r: 5,
            stroke: "white",
            strokeWidth: 2
          }}
          activeDot={{ 
            r: 8,
            fill: color,
            stroke: "white",
            strokeWidth: 3,
            filter: `url(#line-glow-${dataKey})`
          }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

