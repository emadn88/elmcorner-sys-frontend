"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialSummary } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface ExpenseBreakdownChartProps {
  summary: FinancialSummary;
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#6b7280"];

export function ExpenseBreakdownChart({
  summary,
}: ExpenseBreakdownChartProps) {
  const { t, direction } = useLanguage();

  const chartData = summary.breakdown.expenses_by_category.map((item, index) => ({
    name: t(`financials.categories.${item.category}`) || item.category,
    value: item.amount,
    percentage: item.percentage,
    color: COLORS[index % COLORS.length],
  }));

  const formatCurrency = (value: number) => {
    const currency = summary.expenses.currency;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-white p-3 shadow-md">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(data.value)} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={cn(direction === "rtl" ? "text-right" : "text-left")}>
      <CardHeader>
        <CardTitle>
          {t("financials.charts.expenseBreakdown") || "Expense Breakdown"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percentage }) => `${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
