"use client";

import { DollarSign, Users, Clock, BookOpen, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalaryStatistics as SalaryStatisticsType } from "@/types/salaries";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface SalaryStatisticsProps {
  statistics: SalaryStatisticsType;
  currency?: string;
  direction?: "ltr" | "rtl";
}

export function SalaryStatistics({
  statistics,
  currency = "USD",
  direction = "ltr",
}: SalaryStatisticsProps) {
  const { t } = useLanguage();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const changeType =
    statistics.salary_change_percentage > 0
      ? "positive"
      : statistics.salary_change_percentage < 0
      ? "negative"
      : "neutral";

  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
      direction === "rtl" && "rtl"
    )}>
      <StatCard
        title={t("salaries.totalSalaries") || "Total Salaries"}
        value={formatCurrency(statistics.total_salary)}
        icon={DollarSign}
        color="primary"
        gradient
      />
      <StatCard
        title={t("salaries.averageSalary") || "Average Salary"}
        value={formatCurrency(statistics.average_salary)}
        icon={Users}
        color="secondary"
      />
      <StatCard
        title={t("salaries.totalHours") || "Total Hours"}
        value={statistics.total_hours.toFixed(1)}
        icon={Clock}
        color="accent"
      />
      <StatCard
        title={t("salaries.totalClasses") || "Total Classes"}
        value={statistics.total_classes}
        icon={BookOpen}
        color="success"
      />
    </div>
  );
}
