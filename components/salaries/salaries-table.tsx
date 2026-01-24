"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TeacherSalary } from "@/types/salaries";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface SalariesTableProps {
  salaries: TeacherSalary[];
  onViewBreakdown: (teacherId: number, teacherName: string) => void;
  direction?: "ltr" | "rtl";
}

export function SalariesTable({
  salaries,
  onViewBreakdown,
  direction = "ltr",
}: SalariesTableProps) {
  const { t } = useLanguage();

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (salaries.length === 0) {
    return (
      <div className={cn(
        "text-center py-12 text-gray-500",
        direction === "rtl" && "text-right"
      )}>
        <p>{t("salaries.noSalaries") || "No salary data available for the selected period"}</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={cn(direction === "rtl" && "text-right")}>
              {t("salaries.teacher") || "Teacher"}
            </TableHead>
            <TableHead className={cn(direction === "rtl" && "text-right")}>
              {t("salaries.hourlyRate") || "Hourly Rate"}
            </TableHead>
            <TableHead className={cn(direction === "rtl" && "text-right")}>
              {t("salaries.hours") || "Hours"}
            </TableHead>
            <TableHead className={cn(direction === "rtl" && "text-right")}>
              {t("salaries.classes") || "Classes"}
            </TableHead>
            <TableHead className={cn(direction === "rtl" && "text-right")}>
              {t("salaries.salary") || "Salary"}
            </TableHead>
            <TableHead className={cn(direction === "rtl" && "text-right")}>
              {t("salaries.status") || "Status"}
            </TableHead>
            <TableHead className={cn(direction === "rtl" && "text-right")}>
              {t("salaries.actions") || "Actions"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {salaries.map((salary) => (
            <TableRow key={salary.teacher_id}>
              <TableCell className={cn(
                "font-medium",
                direction === "rtl" && "text-right"
              )}>
                <div>
                  <p className="font-semibold">{salary.teacher_name}</p>
                  <p className="text-sm text-gray-500">{salary.teacher_email}</p>
                </div>
              </TableCell>
              <TableCell className={cn(direction === "rtl" && "text-right")}>
                {formatCurrency(salary.hourly_rate, salary.currency)}/hr
              </TableCell>
              <TableCell className={cn(direction === "rtl" && "text-right")}>
                {salary.total_hours.toFixed(2)}
              </TableCell>
              <TableCell className={cn(direction === "rtl" && "text-right")}>
                {salary.total_classes}
              </TableCell>
              <TableCell className={cn(
                "font-semibold text-purple-600",
                direction === "rtl" && "text-right"
              )}>
                {formatCurrency(salary.salary, salary.currency)}
              </TableCell>
              <TableCell className={cn(direction === "rtl" && "text-right")}>
                <Badge
                  variant="outline"
                  className={cn(
                    salary.status === "active"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  )}
                >
                  {salary.status === "active"
                    ? t("salaries.active") || "Active"
                    : t("salaries.inactive") || "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className={cn(direction === "rtl" && "text-right")}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewBreakdown(salary.teacher_id, salary.teacher_name)}
                  className="h-8"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t("salaries.viewDetails") || "View Details"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
