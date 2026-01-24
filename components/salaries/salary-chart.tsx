"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AllTeachersSalaryHistoryItem } from "@/types/salaries";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface SalaryChartProps {
  data: AllTeachersSalaryHistoryItem[];
  currency?: string;
  direction?: "ltr" | "rtl";
}

export function SalaryChart({ data, currency = "USD", direction = "ltr" }: SalaryChartProps) {
  const { t } = useLanguage();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const chartData = data.map((item) => ({
    name: item.month_name,
    salary: item.total_salary,
  }));

  return (
    <Card className="shadow-sm border-0 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className={cn(
          "text-lg font-bold text-gray-900",
          direction === "rtl" && "text-right"
        )}>
          {t("salaries.monthlyTrend") || "Monthly Salary Trend"}
        </CardTitle>
        <p className={cn(
          "text-sm text-gray-500 mt-1",
          direction === "rtl" && "text-right"
        )}>
          {t("salaries.monthlyTrendDescription") || "Total salaries over the last 12 months"}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="salary-line-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={1} />
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
                tickFormatter={(value) => formatCurrency(value)}
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
                  marginBottom: "4px",
                }}
                itemStyle={{
                  color: "#6b7280",
                  fontSize: "13px",
                }}
                formatter={(value: number) => [formatCurrency(value), t("salaries.salary") || "Salary"]}
                cursor={{ stroke: "#7c3aed", strokeWidth: 2, strokeDasharray: "5 5" }}
              />
              <Line
                type="monotone"
                dataKey="salary"
                stroke="url(#salary-line-gradient)"
                strokeWidth={4}
                dot={{
                  fill: "#7c3aed",
                  r: 5,
                  stroke: "white",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 8,
                  fill: "#7c3aed",
                  stroke: "white",
                  strokeWidth: 3,
                }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
