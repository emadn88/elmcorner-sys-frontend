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
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

export interface FamilyFilters {
  search?: string;
  status?: "active" | "inactive" | "all";
}

interface FamiliesFiltersProps {
  filters: FamilyFilters;
  onFiltersChange: (filters: FamilyFilters) => void;
}

export function FamiliesFilters({
  filters,
  onFiltersChange,
}: FamiliesFiltersProps) {
  const { t, direction } = useLanguage();

  const handleFilterChange = (key: keyof FamilyFilters, value: string) => {
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
            placeholder={t("families.searchPlaceholder") || "Search by name, email, or WhatsApp..."}
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
            handleFilterChange("status", value as FamilyFilters["status"])
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t("families.status") || "Status"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("families.allStatuses") || "All Statuses"}</SelectItem>
            <SelectItem value="active">{t("families.active") || "Active"}</SelectItem>
            <SelectItem value="inactive">{t("families.inactive") || "Inactive"}</SelectItem>
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
            {t("families.clearFilters") || "Clear Filters"}
          </Button>
        )}
      </div>
    </div>
  );
}
