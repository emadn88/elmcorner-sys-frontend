"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SalaryService } from "@/lib/services/salary.service";
import { TeacherService } from "@/lib/services/teacher.service";
import {
  TeacherSalary,
  SalaryStatistics,
  SalaryFilters,
  AllTeachersSalaryHistoryItem,
  SalaryBreakdown,
} from "@/types/salaries";
import { Teacher } from "@/types/teachers";
import { useLanguage } from "@/contexts/language-context";
import { SalaryFilters as SalaryFiltersComponent } from "@/components/salaries/salary-filters";
import { SalaryStatistics as SalaryStatisticsComponent } from "@/components/salaries/salary-statistics";
import { SalaryChart } from "@/components/salaries/salary-chart";
import { SalariesTable } from "@/components/salaries/salaries-table";
import { SalaryBreakdownModal } from "@/components/salaries/salary-breakdown-modal";
import { exportSalariesToExcel, convertToEGP } from "@/lib/utils/salary-export";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export default function SalariesPage() {
  const { t, direction } = useLanguage();
  const currentDate = new Date();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
  const currentYear = String(currentDate.getFullYear());

  const [salaries, setSalaries] = useState<TeacherSalary[]>([]);
  const [statistics, setStatistics] = useState<SalaryStatistics | null>(null);
  const [history, setHistory] = useState<AllTeachersSalaryHistoryItem[]>([]);
  const [teachers, setTeachers] = useState<Array<{ id: number; name: string }>>([]);
  const [filters, setFilters] = useState<SalaryFilters>({
    month: currentMonth,
    year: currentYear,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [selectedTeacherName, setSelectedTeacherName] = useState<string>("");
  const [breakdowns, setBreakdowns] = useState<Map<number, SalaryBreakdown>>(new Map());
  const [isExporting, setIsExporting] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [salariesData, statisticsData, historyData, teachersData] = await Promise.all([
        SalaryService.getTeachersSalaries(filters),
        SalaryService.getMonthlyStatistics(filters.month, filters.year),
        SalaryService.getAllTeachersSalaryHistory(filters.month, filters.year, 12),
        TeacherService.getTeachers({}),
      ]);

      setSalaries(salariesData);
      setStatistics(statisticsData);
      setHistory(historyData);
      setTeachers(
        teachersData.data.map((t: Teacher) => ({
          id: t.id,
          name: t.user?.name || "Unknown",
        }))
      );
    } catch (err: any) {
      setError(err.message || "Failed to load salary data");
      console.error("Error fetching salary data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleViewBreakdown = async (teacherId: number, teacherName: string) => {
    setSelectedTeacherId(teacherId);
    setSelectedTeacherName(teacherName);
    
    // Fetch breakdown if not already cached
    if (!breakdowns.has(teacherId)) {
      try {
        const breakdown = await SalaryService.getSalaryBreakdown(
          teacherId,
          filters.month,
          filters.year
        );
        setBreakdowns(new Map(breakdowns.set(teacherId, breakdown)));
      } catch (err) {
        console.error("Failed to fetch breakdown:", err);
      }
    }
    
    setBreakdownModalOpen(true);
  };

  const handleExportToExcel = async () => {
    try {
      setIsExporting(true);
      
      // Fetch all breakdowns if not already cached
      const breakdownsMap = new Map(breakdowns);
      for (const salary of salaries) {
        if (!breakdownsMap.has(salary.teacher_id)) {
          try {
            const breakdown = await SalaryService.getSalaryBreakdown(
              salary.teacher_id,
              filters.month,
              filters.year
            );
            breakdownsMap.set(salary.teacher_id, breakdown);
          } catch (err) {
            console.error(`Failed to fetch breakdown for teacher ${salary.teacher_id}:`, err);
          }
        }
      }
      
      exportSalariesToExcel(
        salaries,
        breakdownsMap,
        filters.convertToEGP || false,
        filters.usdToEgpRate || 30
      );
    } catch (err: any) {
      setError(err.message || "Failed to export salaries");
    } finally {
      setIsExporting(false);
    }
  };

  // Apply currency conversion to salaries for display
  const getDisplaySalaries = (): TeacherSalary[] => {
    if (!filters.convertToEGP || !filters.usdToEgpRate) {
      return salaries;
    }

    return salaries.map((salary) => {
      if (salary.currency === "USD") {
        return {
          ...salary,
          hourly_rate: convertToEGP(salary.hourly_rate, filters.usdToEgpRate!),
          salary: convertToEGP(salary.salary, filters.usdToEgpRate!),
          currency: "EGP",
        };
      }
      return salary;
    });
  };

  // Apply currency conversion to statistics
  const getDisplayStatistics = (): SalaryStatistics | null => {
    if (!statistics) return null;
    if (!filters.convertToEGP || !filters.usdToEgpRate) {
      return statistics;
    }

    return {
      ...statistics,
      total_salary: convertToEGP(statistics.total_salary, filters.usdToEgpRate),
      average_salary: convertToEGP(statistics.average_salary, filters.usdToEgpRate),
      previous_month_salary: convertToEGP(statistics.previous_month_salary, filters.usdToEgpRate),
    };
  };

  const displaySalaries = getDisplaySalaries();
  const displayStatistics = getDisplayStatistics();
  const displayCurrency = filters.convertToEGP && filters.usdToEgpRate ? "EGP" : (salaries[0]?.currency || "USD");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("space-y-6", direction === "rtl" && "rtl")}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className={cn(direction === "rtl" && "text-right")}>
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            {t("salaries.title") || "Teachers Salaries"}
          </h1>
        </div>
        <p className="text-gray-600 mt-1">
          {t("salaries.description") || "View and manage teacher salaries based on hours worked"}
        </p>
      </motion.div>

      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <SalaryFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          teachers={teachers}
        />
      </motion.div>

      {/* Statistics */}
      {displayStatistics && (
        <motion.div variants={itemVariants}>
          <SalaryStatisticsComponent
            statistics={displayStatistics}
            currency={displayCurrency}
            direction={direction}
          />
        </motion.div>
      )}

      {/* Chart */}
      {history.length > 0 && (
        <motion.div variants={itemVariants}>
          <SalaryChart
            data={history}
            currency={displayCurrency}
            direction={direction}
          />
        </motion.div>
      )}

      {/* Salaries Table */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <div className={cn(
            "flex items-center justify-between mb-4",
            direction === "rtl" && "flex-row-reverse"
          )}>
            <h2 className={cn(
              "text-xl font-semibold",
              direction === "rtl" && "text-right"
            )}>
              {t("salaries.teachersSalaries") || "Teachers Salaries"}
            </h2>
            <Button
              onClick={handleExportToExcel}
              disabled={isExporting || salaries.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting
                ? t("salaries.exporting") || "Exporting..."
                : t("salaries.exportExcel") || "Export to Excel"}
            </Button>
          </div>
          <SalariesTable
            salaries={displaySalaries}
            onViewBreakdown={handleViewBreakdown}
            direction={direction}
          />
        </Card>
      </motion.div>

      {/* Breakdown Modal */}
      <SalaryBreakdownModal
        open={breakdownModalOpen}
        onOpenChange={setBreakdownModalOpen}
        teacherId={selectedTeacherId}
        teacherName={selectedTeacherName}
        month={filters.month}
        year={filters.year}
        convertToEGP={filters.convertToEGP || false}
        usdToEgpRate={filters.usdToEgpRate || 30}
      />
    </motion.div>
  );
}
