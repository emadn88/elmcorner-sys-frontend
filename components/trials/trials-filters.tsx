"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrialFilters } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";

interface TrialsFiltersProps {
  filters: TrialFilters;
  onFiltersChange: (filters: TrialFilters) => void;
}

export function TrialsFilters({ filters, onFiltersChange }: TrialsFiltersProps) {
  const { t, direction } = useLanguage();

  return (
    <div className={`space-y-4 ${direction === "rtl" ? "text-right" : "text-left"}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status">{t("trials.filters.status") || "Status"}</Label>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, status: value === "all" ? undefined : (value as any) })
            }
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("trials.filters.all") || "All"}</SelectItem>
              <SelectItem value="pending">{t("trials.status.pending") || "Pending"}</SelectItem>
              <SelectItem value="pending_review">{t("trials.status.pendingReview") || "Pending Review"}</SelectItem>
              <SelectItem value="completed">{t("trials.status.completed") || "Completed"}</SelectItem>
              <SelectItem value="no_show">{t("trials.status.noShow") || "No Show"}</SelectItem>
              <SelectItem value="converted">{t("trials.status.converted") || "Converted"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date From */}
        <div className="space-y-2">
          <Label htmlFor="date_from">{t("trials.filters.dateFrom") || "Date From"}</Label>
          <Input
            id="date_from"
            type="date"
            value={filters.date_from || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, date_from: e.target.value || undefined })
            }
          />
        </div>

        {/* Date To */}
        <div className="space-y-2">
          <Label htmlFor="date_to">{t("trials.filters.dateTo") || "Date To"}</Label>
          <Input
            id="date_to"
            type="date"
            value={filters.date_to || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, date_to: e.target.value || undefined })
            }
          />
        </div>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">{t("trials.filters.search") || "Search Student"}</Label>
        <Input
          id="search"
          placeholder={t("trials.filters.searchPlaceholder") || "Search by student name..."}
          value={filters.search || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value || undefined })
          }
        />
      </div>
    </div>
  );
}
