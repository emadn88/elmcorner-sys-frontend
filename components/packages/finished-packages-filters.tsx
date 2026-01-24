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
import { FinishedPackageFilters } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface FinishedPackagesFiltersProps {
  filters: FinishedPackageFilters;
  onFiltersChange: (filters: FinishedPackageFilters) => void;
}

export function FinishedPackagesFilters({
  filters,
  onFiltersChange,
}: FinishedPackagesFiltersProps) {
  const { t, direction } = useLanguage();

  const handleFilterChange = (key: keyof FinishedPackageFilters, value: string | number) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      notification_status: "all",
      student_status: "all",
    });
  };

  const hasActiveFilters =
    filters.search ||
    (filters.notification_status && filters.notification_status !== "all") ||
    (filters.student_status && filters.student_status !== "all") ||
    filters.days_since_finished;

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

        {/* Notification Status Filter */}
        <Select
          value={filters.notification_status || "all"}
          onValueChange={(value) =>
            handleFilterChange("notification_status", value as FinishedPackageFilters["notification_status"])
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t("packages.filterByNotificationStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("packages.filterByNotificationStatus")}</SelectItem>
            <SelectItem value="sent">{t("packages.lastNotificationSent")}</SelectItem>
            <SelectItem value="not_sent">{t("packages.neverSent")}</SelectItem>
          </SelectContent>
        </Select>

        {/* Student Status Filter */}
        <Select
          value={filters.student_status || "all"}
          onValueChange={(value) =>
            handleFilterChange("student_status", value as FinishedPackageFilters["student_status"])
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t("packages.filterByStudentStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("packages.filterByStudentStatus")}</SelectItem>
            <SelectItem value="active">{t("packages.active")}</SelectItem>
            <SelectItem value="paused">{t("students.paused")}</SelectItem>
            <SelectItem value="stopped">{t("students.stopped")}</SelectItem>
          </SelectContent>
        </Select>

        {/* Days Since Finished */}
        <Select
          value={filters.days_since_finished ? String(filters.days_since_finished) : "all"}
          onValueChange={(value) =>
            handleFilterChange("days_since_finished", value === "all" ? undefined : Number(value))
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t("packages.daysSinceFinished")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("packages.daysSinceFinished")}</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
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
