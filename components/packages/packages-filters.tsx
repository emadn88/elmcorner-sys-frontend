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
import { PackageFilters } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface PackagesFiltersProps {
  filters: PackageFilters;
  onFiltersChange: (filters: PackageFilters) => void;
}

export function PackagesFilters({
  filters,
  onFiltersChange,
}: PackagesFiltersProps) {
  const { t, direction } = useLanguage();

  const handleFilterChange = (key: keyof PackageFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
    });
  };

  const hasActiveFilters =
    filters.search ||
    (filters.status && filters.status !== "all");

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
            placeholder={t("packages.searchPlaceholder")}
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
          onValueChange={(value) =>
            handleFilterChange("status", value as PackageFilters["status"])
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t("packages.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("packages.filterByStatus")}</SelectItem>
            <SelectItem value="active">{t("packages.active")}</SelectItem>
            <SelectItem value="finished">{t("packages.finished")}</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            {t("students.clearFilters")}
          </Button>
        )}
      </div>
    </div>
  );
}
