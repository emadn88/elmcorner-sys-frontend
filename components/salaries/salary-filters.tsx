"use client";

import { Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SalaryFilters } from "@/types/salaries";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface SalaryFiltersProps {
  filters: SalaryFilters;
  onFiltersChange: (filters: SalaryFilters) => void;
  teachers?: Array<{ id: number; name: string }>;
}

export function SalaryFilters({
  filters,
  onFiltersChange,
  teachers = [],
}: SalaryFiltersProps) {
  const { t, direction } = useLanguage();

  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
  
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: "01", label: t("common.january") || "January" },
    { value: "02", label: t("common.february") || "February" },
    { value: "03", label: t("common.march") || "March" },
    { value: "04", label: t("common.april") || "April" },
    { value: "05", label: t("common.may") || "May" },
    { value: "06", label: t("common.june") || "June" },
    { value: "07", label: t("common.july") || "July" },
    { value: "08", label: t("common.august") || "August" },
    { value: "09", label: t("common.september") || "September" },
    { value: "10", label: t("common.october") || "October" },
    { value: "11", label: t("common.november") || "November" },
    { value: "12", label: t("common.december") || "December" },
  ];

  const handleFilterChange = (key: keyof SalaryFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" ? undefined : value,
    });
  };

  const handleConvertToggle = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      convertToEGP: checked,
      usdToEgpRate: checked && !filters.usdToEgpRate ? 30 : filters.usdToEgpRate,
    });
  };

  const handleRateChange = (value: string) => {
    const rate = parseFloat(value) || 0;
    onFiltersChange({
      ...filters,
      usdToEgpRate: rate > 0 ? rate : undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className={cn(
        "flex flex-col md:flex-row gap-4 items-end",
        direction === "rtl" ? "md:flex-row-reverse" : ""
      )}>
        {/* Month Selector */}
        <div className="w-full md:w-48">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            {t("salaries.month") || "Month"}
          </label>
          <Select
            value={filters.month || currentMonth}
            onValueChange={(value) => handleFilterChange("month", value)}
          >
            <SelectTrigger>
              <Calendar className={cn("h-4 w-4", direction === "rtl" ? "ml-2" : "mr-2")} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Selector */}
        <div className="w-full md:w-32">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            {t("salaries.year") || "Year"}
          </label>
          <Select
            value={filters.year || String(currentYear)}
            onValueChange={(value) => handleFilterChange("year", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Teacher Filter (optional) */}
        {teachers.length > 0 && (
          <div className="w-full md:w-64">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              {t("salaries.teacher") || "Teacher"}
            </label>
            <Select
              value={filters.teacher_id ? String(filters.teacher_id) : "all"}
              onValueChange={(value) => handleFilterChange("teacher_id", value === "all" ? undefined : Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("salaries.allTeachers") || "All Teachers"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("salaries.allTeachers") || "All Teachers"}
                </SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={String(teacher.id)}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Currency Conversion */}
      <div className={cn(
        "mt-4 pt-4 border-t border-gray-200",
        direction === "rtl" && "text-right"
      )}>
        <div className="flex items-center gap-3 mb-3">
          <Checkbox
            id="convert-egp"
            checked={filters.convertToEGP || false}
            onCheckedChange={handleConvertToggle}
          />
          <Label htmlFor="convert-egp" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            {t("salaries.convertToEGP") || "Convert USD to EGP"}
          </Label>
        </div>
        {filters.convertToEGP && (
          <div className="w-full md:w-48">
            <Label htmlFor="usd-egp-rate" className="text-sm font-medium text-gray-700 mb-2 block">
              {t("salaries.usdToEgpRate") || "USD to EGP Rate"}
            </Label>
            <Input
              id="usd-egp-rate"
              type="number"
              step="0.01"
              min="0"
              placeholder="30.00"
              value={filters.usdToEgpRate || ""}
              onChange={(e) => handleRateChange(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("salaries.rateHint") || "Enter the exchange rate (e.g., 30.00)"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
