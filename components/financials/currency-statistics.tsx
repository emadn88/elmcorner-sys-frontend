"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CurrencyStatistics } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CurrencyStatisticsProps {
  statistics: CurrencyStatistics[];
}

export function CurrencyStatisticsComponent({
  statistics,
}: CurrencyStatisticsProps) {
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
        <CardHeader>
          <CardTitle>
            {t("financials.currencyStatistics.title") || "Income by Currency"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            {t("financials.currencyStatistics.noData") || "No currency data available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(direction === "rtl" ? "text-right" : "text-left")}>
      <CardHeader>
        <CardTitle>
          {t("financials.currencyStatistics.title") || "Income by Currency"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className={cn(direction === "rtl" ? "text-right" : "text-left")}>
                  {t("financials.currencyStatistics.currency") || "Currency"}
                </TableHead>
                <TableHead className={cn(direction === "rtl" ? "text-right" : "text-left")}>
                  {t("financials.currencyStatistics.totalCollected") || "Total Collected"}
                </TableHead>
                <TableHead className={cn(direction === "rtl" ? "text-right" : "text-left")}>
                  {t("financials.currencyStatistics.salaries") || "Salaries"}
                </TableHead>
                <TableHead className={cn(direction === "rtl" ? "text-right" : "text-left")}>
                  {t("financials.currencyStatistics.expenses") || "Expenses"}
                </TableHead>
                <TableHead className={cn(direction === "rtl" ? "text-right" : "text-left")}>
                  {t("financials.currencyStatistics.netProfit") || "Net Profit"}
                </TableHead>
                <TableHead className={cn(direction === "rtl" ? "text-right" : "text-left")}>
                  {t("financials.currencyStatistics.paidBills") || "Paid Bills"}
                </TableHead>
                <TableHead className={cn(direction === "rtl" ? "text-right" : "text-left")}>
                  {t("financials.currencyStatistics.unpaidBills") || "Unpaid Bills"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statistics.map((stat) => (
                <TableRow key={stat.currency}>
                  <TableCell>
                    <Badge variant="outline" className="font-semibold">
                      {stat.currency}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    {formatCurrency(stat.total_collected || (stat.income || 0), stat.currency)}
                  </TableCell>
                  <TableCell className="font-medium text-blue-600">
                    {formatCurrency(stat.salaries || 0, stat.currency)}
                  </TableCell>
                  <TableCell className="font-medium text-red-600">
                    {formatCurrency(stat.expenses || 0, stat.currency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {(stat.net_profit ?? (stat.profit ?? 0)) >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={cn(
                          "font-medium",
                          (stat.net_profit ?? (stat.profit ?? 0)) >= 0 ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {formatCurrency(stat.net_profit ?? (stat.profit ?? 0), stat.currency)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-emerald-600">
                    {formatCurrency(stat.paid_bills_amount || 0, stat.currency)}
                    <span className="text-xs text-gray-500 block">
                      ({stat.paid_bills_count || 0} {t("financials.currencyStatistics.bills") || "bills"})
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-orange-600">
                    {formatCurrency(stat.unpaid_bills_amount || 0, stat.currency)}
                    <span className="text-xs text-gray-500 block">
                      ({stat.unpaid_bills_count || 0} {t("financials.currencyStatistics.bills") || "bills"})
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
