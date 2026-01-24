"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SalaryService } from "@/lib/services/salary.service";
import { SalaryBreakdown } from "@/types/salaries";
import { useLanguage } from "@/contexts/language-context";
import { convertToEGP } from "@/lib/utils/salary-export";
import { cn } from "@/lib/utils";

interface SalaryBreakdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: number | null;
  teacherName?: string;
  month?: string;
  year?: string;
  convertToEGP?: boolean;
  usdToEgpRate?: number;
}

export function SalaryBreakdownModal({
  open,
  onOpenChange,
  teacherId,
  teacherName,
  month,
  year,
  convertToEGP: shouldConvert = false,
  usdToEgpRate = 30,
}: SalaryBreakdownModalProps) {
  const { t, direction } = useLanguage();
  const [breakdown, setBreakdown] = useState<SalaryBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && teacherId) {
      fetchBreakdown();
    } else {
      setBreakdown(null);
      setError(null);
    }
  }, [open, teacherId, month, year]);

  const fetchBreakdown = async () => {
    if (!teacherId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await SalaryService.getSalaryBreakdown(teacherId, month, year);
      setBreakdown(data);
    } catch (err: any) {
      setError(err.message || "Failed to load salary breakdown");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const displayCurrency = shouldConvert && currency === "USD" ? "EGP" : currency;
    const displayAmount = shouldConvert && currency === "USD" 
      ? convertToEGP(amount, usdToEgpRate)
      : amount;
    
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: displayCurrency,
      minimumFractionDigits: 2,
    }).format(displayAmount);
  };

  const getDisplayCurrency = (originalCurrency: string) => {
    return shouldConvert && originalCurrency === "USD" ? "EGP" : originalCurrency;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={cn(
            direction === "rtl" && "text-right"
          )}>
            {t("salaries.salaryBreakdown") || "Salary Breakdown"} - {teacherName || breakdown?.teacher_name}
          </DialogTitle>
          <DialogDescription className={cn(
            direction === "rtl" && "text-right"
          )}>
            {breakdown && (
              <>
                {t("salaries.month") || "Month"}: {breakdown.month} | {t("salaries.hourlyRate") || "Hourly Rate"}: {formatCurrency(breakdown.hourly_rate, breakdown.currency)}/hr
                {shouldConvert && breakdown.currency === "USD" && (
                  <span className="text-xs text-gray-500 ml-2">
                    ({t("salaries.converted") || "Converted"} @ {usdToEgpRate} {t("salaries.egpPerUsd") || "EGP/USD"})
                  </span>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="text-red-600 text-center py-4">
            {error}
          </div>
        )}

        {breakdown && !isLoading && (
          <div className="space-y-4">
            {/* Summary */}
            <div className={cn(
              "grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg",
              direction === "rtl" && "text-right"
            )}>
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {t("salaries.totalClasses") || "Total Classes"}
                </p>
                <p className="text-xl font-bold">{breakdown.total_classes}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {t("salaries.totalHours") || "Total Hours"}
                </p>
                <p className="text-xl font-bold">{breakdown.total_hours.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {t("salaries.totalSalary") || "Total Salary"}
                </p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(breakdown.total_salary, breakdown.currency)}
                  <span className="text-xs font-normal text-gray-500 ml-2">
                    ({getDisplayCurrency(breakdown.currency)})
                  </span>
                </p>
              </div>
            </div>

            {/* Classes Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={cn(direction === "rtl" && "text-right")}>
                      {t("salaries.date") || "Date"}
                    </TableHead>
                    <TableHead className={cn(direction === "rtl" && "text-right")}>
                      {t("salaries.student") || "Student"}
                    </TableHead>
                    <TableHead className={cn(direction === "rtl" && "text-right")}>
                      {t("salaries.course") || "Course"}
                    </TableHead>
                    <TableHead className={cn(direction === "rtl" && "text-right")}>
                      {t("salaries.duration") || "Duration"}
                    </TableHead>
                    <TableHead className={cn(direction === "rtl" && "text-right")}>
                      {t("salaries.salary") || "Salary"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {breakdown.classes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {t("salaries.noClasses") || "No classes found for this period"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    breakdown.classes.map((classItem) => (
                      <TableRow key={classItem.class_id}>
                        <TableCell className={cn(direction === "rtl" && "text-right")}>
                          {formatDate(classItem.class_date)}
                        </TableCell>
                        <TableCell className={cn(direction === "rtl" && "text-right")}>
                          {classItem.student_name}
                        </TableCell>
                        <TableCell className={cn(direction === "rtl" && "text-right")}>
                          {classItem.course_name}
                        </TableCell>
                        <TableCell className={cn(direction === "rtl" && "text-right")}>
                          {classItem.duration_hours.toFixed(2)} {t("salaries.hours") || "hrs"}
                        </TableCell>
                        <TableCell className={cn(
                          "font-semibold",
                          direction === "rtl" && "text-right"
                        )}>
                          {formatCurrency(classItem.salary, breakdown.currency)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
