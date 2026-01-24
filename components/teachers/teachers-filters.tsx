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
import { TeacherFilters } from "@/types/teachers";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface TeachersFiltersProps {
  filters: TeacherFilters;
  onFiltersChange: (filters: TeacherFilters) => void;
}

export function TeachersFilters({
  filters,
  onFiltersChange,
}: TeachersFiltersProps) {
  const { t, direction } = useLanguage();

  const handleFilterChange = (key: keyof TeacherFilters, value: any) => {
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

  const hasActiveFilters = filters.search || (filters.status && filters.status !== "all");

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className={cn(
        "flex flex-col md:flex-row gap-4",
        direction === "rtl" ? "md:flex-row-reverse" : ""
      )}>
        {/* Search */}
        <div className="flex-1 relative">
          <Search className={cn(
            "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400",
            direction === "rtl" ? "right-3" : "left-3"
          )} />
          <Input
            type="text"
            placeholder={t("teachers.searchPlaceholder") || "Search by name or email..."}
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className={cn(
              "pl-10 rtl:pr-10 rtl:pl-3",
              direction === "rtl" ? "pr-10 pl-3" : "pl-10 pr-3"
            )}
          />
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("teachers.status") || "Status"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("teachers.allStatuses") || "All Statuses"}
              </SelectItem>
              <SelectItem value="active">
                {t("teachers.active") || "Active"}
              </SelectItem>
              <SelectItem value="inactive">
                {t("teachers.inactive") || "Inactive"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full md:w-auto"
          >
            <X className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t("teachers.clearFilters") || "Clear Filters"}
          </Button>
        )}
      </div>
    </div>
  );
}
