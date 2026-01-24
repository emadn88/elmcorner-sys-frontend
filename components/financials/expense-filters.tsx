"use client";

import { useState } from "react";
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
import { ExpenseFilters } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ExpenseFiltersProps {
  filters: ExpenseFilters;
  onFiltersChange: (filters: ExpenseFilters) => void;
}

export function ExpenseFiltersComponent({
  filters,
  onFiltersChange,
}: ExpenseFiltersProps) {
  const { t, direction } = useLanguage();

  const handleFilterChange = (key: keyof ExpenseFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      date_from: undefined,
      date_to: undefined,
      category: "all",
      currency: undefined,
    });
  };

  const hasActiveFilters =
    filters.date_from ||
    filters.date_to ||
    (filters.category && filters.category !== "all") ||
    filters.currency;

  return (
    <div
      className={cn(
        "space-y-4 rounded-lg border border-gray-200 bg-white p-4",
        direction === "rtl" ? "text-right" : "text-left"
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          {t("common.filters") || "Filters"}
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            {t("common.clearFilters") || "Clear"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="date_from">
            {t("common.dateFrom") || "Date From"}
          </Label>
          <Input
            id="date_from"
            type="date"
            value={filters.date_from || ""}
            onChange={(e) => handleFilterChange("date_from", e.target.value || undefined)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_to">
            {t("common.dateTo") || "Date To"}
          </Label>
          <Input
            id="date_to"
            type="date"
            value={filters.date_to || ""}
            onChange={(e) => handleFilterChange("date_to", e.target.value || undefined)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">
            {t("financials.table.category") || "Category"}
          </Label>
          <Select
            value={filters.category || "all"}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("common.all") || "All"}
              </SelectItem>
              <SelectItem value="salaries">
                {t("financials.categories.salaries") || "Salaries"}
              </SelectItem>
              <SelectItem value="tools">
                {t("financials.categories.tools") || "Tools"}
              </SelectItem>
              <SelectItem value="marketing">
                {t("financials.categories.marketing") || "Marketing"}
              </SelectItem>
              <SelectItem value="misc">
                {t("financials.categories.misc") || "Miscellaneous"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">
            {t("financials.table.currency") || "Currency"}
          </Label>
          <Select
            value={filters.currency || "all"}
            onValueChange={(value) =>
              handleFilterChange("currency", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("common.all") || "All"}
              </SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="SAR">SAR</SelectItem>
              <SelectItem value="AED">AED</SelectItem>
              <SelectItem value="EGP">EGP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
