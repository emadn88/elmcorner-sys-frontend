"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CurrencyStatistics } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FileText,
  Users,
} from "lucide-react";

interface CurrencyStatisticsCardsProps {
  statistics: CurrencyStatistics[];
}

export function CurrencyStatisticsCards({
  statistics,
}: CurrencyStatisticsCardsProps) {
  const { t, direction } = useLanguage();

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (statistics.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-gray-500 text-center">
            {t("financials.currencyStatistics.noData") || "No currency data available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {statistics.map((stat) => (
        <div key={stat.currency} className="space-y-4">
          <h3 className={cn(
            "text-lg font-semibold text-gray-900",
            direction === "rtl" ? "text-right" : "text-left"
          )}>
            {stat.currency} {t("financials.currencyStatistics.currency") || "Currency"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Collected */}
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-600">
                    {t("financials.currencyStatistics.totalCollected") || "Total Collected"}
                  </p>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-xl font-bold text-green-700">
                  {formatCurrency(stat.total_collected, stat.currency)}
                </p>
              </CardContent>
            </Card>

            {/* Salaries */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-600">
                    {t("financials.currencyStatistics.salaries") || "Salaries"}
                  </p>
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-xl font-bold text-blue-700">
                  {formatCurrency(stat.salaries, stat.currency)}
                </p>
              </CardContent>
            </Card>

            {/* Net Profit */}
            <Card
              className={cn(
                stat.net_profit >= 0
                  ? "border-green-200 bg-green-50/50"
                  : "border-red-200 bg-red-50/50"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-600">
                    {t("financials.currencyStatistics.netProfit") || "Net Profit"}
                  </p>
                  {stat.net_profit >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <p
                  className={cn(
                    "text-xl font-bold",
                    stat.net_profit >= 0 ? "text-green-700" : "text-red-700"
                  )}
                >
                  {formatCurrency(stat.net_profit, stat.currency)}
                </p>
              </CardContent>
            </Card>

            {/* Paid Bills */}
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-600">
                    {t("financials.currencyStatistics.paidBills") || "Paid Bills"}
                  </p>
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-xl font-bold text-emerald-700">
                  {formatCurrency(stat.paid_bills_amount, stat.currency)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.paid_bills_count}{" "}
                  {t("financials.currencyStatistics.bills") || "bills"}
                </p>
              </CardContent>
            </Card>

            {/* Unpaid Bills */}
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-600">
                    {t("financials.currencyStatistics.unpaidBills") || "Unpaid Bills"}
                  </p>
                  <FileText className="h-4 w-4 text-orange-600" />
                </div>
                <p className="text-xl font-bold text-orange-700">
                  {formatCurrency(stat.unpaid_bills_amount, stat.currency)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.unpaid_bills_count}{" "}
                  {t("financials.currencyStatistics.bills") || "bills"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
}
