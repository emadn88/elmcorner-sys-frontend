"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRightLeft, Calculator } from "lucide-react";
import { FinancialsService } from "@/lib/services/financials.service";
import { CurrencyConversionResult } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

const CURRENCIES = ["USD", "EUR", "GBP", "SAR", "AED", "EGP"];

export function CurrencyConverter() {
  const { t, direction } = useLanguage();

  const [formData, setFormData] = useState({
    amount: "",
    from_currency: "USD",
    to_currency: "EUR",
    rate: "",
  });

  const [result, setResult] = useState<CurrencyConversionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError(t("financials.currencyConverter.errors.amountRequired") || "Amount must be greater than 0");
      return;
    }

    if (!formData.rate || parseFloat(formData.rate) <= 0) {
      setError(t("financials.currencyConverter.errors.rateRequired") || "Conversion rate is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const conversionResult = await FinancialsService.convertCurrency({
        amount: parseFloat(formData.amount),
        from_currency: formData.from_currency,
        to_currency: formData.to_currency,
        rate: parseFloat(formData.rate),
      });
      setResult(conversionResult);
    } catch (err: any) {
      setError(err.message || t("common.errorOccurred") || "An error occurred");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setFormData({
      ...formData,
      from_currency: formData.to_currency,
      to_currency: formData.from_currency,
    });
    setResult(null);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className={cn(direction === "rtl" ? "text-right" : "text-left")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          {t("financials.currencyConverter.title") || "Currency Converter"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">
              {t("financials.currencyConverter.amount") || "Amount"}
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate">
              {t("financials.currencyConverter.rate") || "Conversion Rate"}
            </Label>
            <Input
              id="rate"
              type="number"
              step="0.0001"
              min="0"
              value={formData.rate}
              onChange={(e) =>
                setFormData({ ...formData, rate: e.target.value })
              }
              placeholder="1.00"
            />
            <p className="text-xs text-gray-500">
              {(t("financials.currencyConverter.rateHint") ||
                "Rate: 1 {from} = {rate} {to}")
                .replace("{from}", formData.from_currency)
                .replace("{rate}", formData.rate || "1")
                .replace("{to}", formData.to_currency)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from_currency">
              {t("financials.currencyConverter.from") || "From"}
            </Label>
            <Select
              value={formData.from_currency}
              onValueChange={(value) =>
                setFormData({ ...formData, from_currency: value })
              }
            >
              <SelectTrigger id="from_currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to_currency">
              {t("financials.currencyConverter.to") || "To"}
            </Label>
            <Select
              value={formData.to_currency}
              onValueChange={(value) =>
                setFormData({ ...formData, to_currency: value })
              }
            >
              <SelectTrigger id="to_currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleConvert}
            disabled={loading}
            className="flex-1"
          >
            {loading
              ? t("common.loading") || "Loading..."
              : t("financials.currencyConverter.convert") || "Convert"}
          </Button>
          <Button
            variant="outline"
            onClick={handleSwap}
            disabled={loading}
            className="px-3"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>

        {result && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {t("financials.currencyConverter.original") || "Original"}
                </span>
                <span className="font-semibold">
                  {formatCurrency(result.original_amount, result.from_currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {t("financials.currencyConverter.converted") || "Converted"}
                </span>
                <span className="font-semibold text-green-700">
                  {formatCurrency(result.converted_amount, result.to_currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-green-200">
                <span>
                  {t("financials.currencyConverter.rate") || "Rate"}: 1{" "}
                  {result.from_currency} = {result.rate} {result.to_currency}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
