"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface ClassesFiltersProps {
  dateFrom: string;
  dateTo: string;
  status: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  onStatusChange: (status: string) => void;
  onClear: () => void;
}

export function ClassesFilters({
  dateFrom,
  dateTo,
  status,
  onDateFromChange,
  onDateToChange,
  onStatusChange,
  onClear,
}: ClassesFiltersProps) {
  const { t } = useLanguage();
  const hasFilters = dateFrom || dateTo || status !== "all";
  
  // Get today's date in YYYY-MM-DD format using local timezone (max date for filters - no future dates)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {t("teacher.filters") || "Filters"}
          </CardTitle>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-8 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              {t("common.clear") || "Clear"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date-from">
              {t("teacher.dateFrom") || "Date From"}
            </Label>
            <Input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              max={today}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-to">
              {t("teacher.dateTo") || "Date To"}
            </Label>
            <Input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              max={today}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">
              {t("classes.statusLabel") || "Status"}
            </Label>
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger id="status">
                <SelectValue placeholder={t("classes.allStatuses") || "All Statuses"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("classes.allStatuses") || "All Statuses"}
                </SelectItem>
                <SelectItem value="pending">
                  {t("classes.status.pending") || "Pending"}
                </SelectItem>
                <SelectItem value="attended">
                  {t("classes.status.attended") || "Attended"}
                </SelectItem>
                <SelectItem value="cancelled_by_teacher">
                  {t("classes.status.cancelledByTeacher") || "Cancelled by Teacher"}
                </SelectItem>
                <SelectItem value="cancelled_by_student">
                  {t("classes.status.cancelledByStudent") || "Cancelled by Student"}
                </SelectItem>
                <SelectItem value="absent_student">
                  {t("classes.status.absentStudent") || "Absent Student"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
