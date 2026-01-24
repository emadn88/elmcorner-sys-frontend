"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadFilters } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/lib/countries-timezones";

interface LeadsFiltersProps {
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
}

export function LeadsFilters({
  filters,
  onFiltersChange,
}: LeadsFiltersProps) {
  const { t, direction } = useLanguage();

  const handleFilterChange = (key: keyof LeadFilters, value: string | boolean | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: "all",
      priority: "all",
    });
  };

  const hasActiveFilters =
    filters.search ||
    (filters.status && filters.status !== "all") ||
    (filters.priority && filters.priority !== "all") ||
    filters.country ||
    filters.source ||
    filters.overdue_follow_up;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            className={cn(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400",
              direction === "rtl" ? "right-3" : "left-3"
            )}
          />
          <Input
            placeholder={t("leads.searchPlaceholder") || "Search by name or WhatsApp..."}
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className={cn(
              "pl-10 pr-10",
              direction === "rtl" && "pr-10 pl-10"
            )}
          />
          {filters.search && (
            <button
              onClick={() => handleFilterChange("search", "")}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",
                direction === "rtl" ? "left-3" : "right-3"
              )}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status || "all"}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t("leads.filters.status") || "Status"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("leads.filters.all") || "All Statuses"}</SelectItem>
            <SelectItem value="new">{t("leads.status.new") || "New"}</SelectItem>
            <SelectItem value="contacted">{t("leads.status.contacted") || "Contacted"}</SelectItem>
            <SelectItem value="needs_follow_up">{t("leads.status.needs_follow_up") || "Needs Follow-up"}</SelectItem>
            <SelectItem value="trial_scheduled">{t("leads.status.trial_scheduled") || "Trial Scheduled"}</SelectItem>
            <SelectItem value="trial_confirmed">{t("leads.status.trial_confirmed") || "Trial Confirmed"}</SelectItem>
            <SelectItem value="converted">{t("leads.status.converted") || "Converted"}</SelectItem>
            <SelectItem value="not_interested">{t("leads.status.not_interested") || "Not Interested"}</SelectItem>
            <SelectItem value="cancelled">{t("leads.status.cancelled") || "Cancelled"}</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={filters.priority || "all"}
          onValueChange={(value) => handleFilterChange("priority", value)}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder={t("leads.filters.priority") || "Priority"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("leads.filters.all") || "All Priorities"}</SelectItem>
            <SelectItem value="high">{t("leads.priority.high") || "High"}</SelectItem>
            <SelectItem value="medium">{t("leads.priority.medium") || "Medium"}</SelectItem>
            <SelectItem value="low">{t("leads.priority.low") || "Low"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Country Filter */}
        <Select
          value={filters.country || "all"}
          onValueChange={(value) => handleFilterChange("country", value === "all" ? undefined : value)}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={t("leads.filters.country") || "Country"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("leads.filters.all") || "All Countries"}</SelectItem>
            {COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Source Filter */}
        <Input
          placeholder={t("leads.filters.source") || "Source/Campaign..."}
          value={filters.source || ""}
          onChange={(e) => handleFilterChange("source", e.target.value)}
          className="w-full sm:w-[200px]"
        />

        {/* Overdue Follow-up Filter */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="overdue_follow_up"
            checked={filters.overdue_follow_up || false}
            onChange={(e) => handleFilterChange("overdue_follow_up", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="overdue_follow_up" className="text-sm text-gray-700">
            {t("leads.filters.overdueFollowUp") || "Overdue Follow-up"}
          </label>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            {t("leads.filters.clear") || "Clear Filters"}
          </Button>
        </div>
      )}
    </div>
  );
}
