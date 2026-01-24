"use client";

import { DollarSign, TrendingUp, TrendingDown, Calculator } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { FinancialSummary } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";

interface FinancialSummaryCardsProps {
  summary: FinancialSummary;
}

export function FinancialSummaryCards({ summary }: FinancialSummaryCardsProps) {
  const { t } = useLanguage();

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title={t("financials.summary.income") || "Total Income"}
        value={formatCurrency(summary.income.total, summary.income.currency)}
        icon={DollarSign}
        color="success"
        gradient
      />
      <StatCard
        title={t("financials.summary.expenses") || "Total Expenses"}
        value={formatCurrency(summary.expenses.total, summary.expenses.currency)}
        icon={TrendingDown}
        color="error"
        gradient
      />
      <StatCard
        title={t("financials.summary.profit") || "Net Profit"}
        value={formatCurrency(summary.profit.net, summary.profit.currency)}
        icon={TrendingUp}
        color={summary.profit.net >= 0 ? "success" : "error"}
        gradient
      />
      <StatCard
        title={t("financials.summary.margin") || "Profit Margin"}
        value={`${summary.profit.margin.toFixed(1)}%`}
        icon={Calculator}
        color={summary.profit.margin >= 0 ? "success" : "error"}
        gradient
      />
    </div>
  );
}
