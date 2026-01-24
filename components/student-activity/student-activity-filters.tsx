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
import { StudentActivityFilters } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface StudentActivityFiltersProps {
  filters: StudentActivityFilters;
  onFiltersChange: (filters: StudentActivityFilters) => void;
}

export function StudentActivityFiltersComponent({
  filters,
  onFiltersChange,
}: StudentActivityFiltersProps) {
  const { t, direction } = useLanguage();

  const handleFilterChange = (key: keyof StudentActivityFilters, value: string | number | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      activity_level: "all",
      search: "",
      threshold: undefined,
    });
  };

  const hasActiveFilters =
    filters.search ||
    (filters.activity_level && filters.activity_level !== "all") ||
    filters.threshold;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search
            className={cn(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400",
              direction === "rtl" ? "right-3" : "left-3"
            )}
          />
          <Input
            placeholder={t("studentActivity.searchPlaceholder") || "Search by student name..."}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Activity Level Filter */}
          <Select
            value={filters.activity_level || "all"}
            onValueChange={(value) => handleFilterChange("activity_level", value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("studentActivity.filterActivityLevel") || "Activity Level"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("studentActivity.allLevels") || "All Levels"}</SelectItem>
              <SelectItem value="highly_active">{t("studentActivity.highlyActive") || "Highly Active"}</SelectItem>
              <SelectItem value="medium">{t("studentActivity.medium") || "Medium"}</SelectItem>
              <SelectItem value="low">{t("studentActivity.low") || "Low"}</SelectItem>
              <SelectItem value="stopped">{t("studentActivity.stopped") || "Stopped"}</SelectItem>
            </SelectContent>
          </Select>

          {/* Threshold Filter */}
          <Input
            type="number"
            placeholder={t("studentActivity.daysSinceLastClass") || "Days since last class"}
            value={filters.threshold || ""}
            onChange={(e) => handleFilterChange("threshold", e.target.value ? parseInt(e.target.value) : undefined)}
            min="0"
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className={cn("w-full sm:w-auto", direction === "rtl" && "sm:mr-auto sm:ml-0")}
          >
            <X className={cn("h-4 w-4", direction === "rtl" ? "ml-2" : "mr-2")} />
            {t("studentActivity.clearFilters") || "Clear Filters"}
          </Button>
        )}
      </div>
    </div>
  );
}
