"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  GraduationCap, 
  Clock, 
  Calendar, 
  Package, 
  AlertCircle, 
  DollarSign, 
  TrendingUp,
  BookOpen,
  FileText
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/language-context";
import { StudentService } from "@/lib/services/student.service";
import { TeacherService } from "@/lib/services/teacher.service";
import { ClassService } from "@/lib/services/class.service";
import { TrialService } from "@/lib/services/trial.service";
import { PackageService } from "@/lib/services/package.service";
import { SalaryService } from "@/lib/services/salary.service";
import { FinancialsService } from "@/lib/services/financials.service";
import { format } from "date-fns";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  todayClasses: number;
  todayHours: number;
  todayTrials: number;
  activePackages: number;
  reachedLimitPackages: number;
  currentMonthSalary: number;
  currentMonthIncome: number;
  loading: boolean;
}

export default function DashboardPage() {
  const { t, direction } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    todayClasses: 0,
    todayHours: 0,
    todayTrials: 0,
    activePackages: 0,
    reachedLimitPackages: 0,
    currentMonthSalary: 0,
    currentMonthIncome: 0,
    loading: true,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true }));

      const today = format(new Date(), "yyyy-MM-dd");
      const currentMonth = format(new Date(), "yyyy-MM");
      const monthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd");
      const monthEnd = format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), "yyyy-MM-dd");

      // Fetch all statistics in parallel
      const [
        studentStats,
        teacherStats,
        todayClassesData,
        todayTrialsData,
        activePackagesData,
        finishedPackagesData,
        salaryStats,
        financialSummary,
      ] = await Promise.all([
        StudentService.getStudentStats().catch(() => ({ total: 0 })),
        TeacherService.getTeacherStats().catch(() => ({ total: 0 })),
        ClassService.getClasses({ start_date: today, end_date: today, per_page: 1000 }).catch(() => ({ data: [], total: 0 })),
        TrialService.getTrials({ date_from: today, date_to: today, per_page: 1000 }).catch(() => ({ data: [], total: 0 })),
        PackageService.getPackages({ status: "active", per_page: 1 }).catch(() => ({ data: [], total: 0 })),
        PackageService.getFinishedPackages({ per_page: 1 }).catch(() => ({ data: [], total: 0 })),
        SalaryService.getMonthlyStatistics(
          String(new Date().getMonth() + 1).padStart(2, "0"),
          String(new Date().getFullYear())
        ).catch(() => ({ total_salaries: 0 })),
        FinancialsService.getFinancialSummary({ date_from: monthStart, date_to: monthEnd }).catch(() => ({ total_income: 0 })),
      ]);

      // Calculate today's total hours from duration (in minutes)
      const todayHours = todayClassesData.data.reduce((total: number, classItem: any) => {
        if (classItem.duration) {
          // duration is in minutes, convert to hours
          return total + (classItem.duration / 60);
        }
        // Calculate from start_time and end_time if duration is not available
        if (classItem.start_time && classItem.end_time) {
          try {
            const start = new Date(`${today}T${classItem.start_time}`);
            const end = new Date(`${today}T${classItem.end_time}`);
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            return total + hours;
          } catch (e) {
            return total;
          }
        }
        return total;
      }, 0);

      setStats({
        totalStudents: (studentStats as any).total || 0,
        totalTeachers: (teacherStats as any).total || 0,
        todayClasses: todayClassesData.total || 0,
        todayHours: parseFloat(todayHours.toFixed(2)),
        todayTrials: todayTrialsData.total || 0,
        activePackages: activePackagesData.total || 0,
        reachedLimitPackages: finishedPackagesData.total || 0,
        currentMonthSalary: (salaryStats as any).total_salaries || 0,
        currentMonthIncome: (financialSummary as any).total_income || 0,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`space-y-6 ${direction === "rtl" ? "text-right" : "text-left"}`}
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-gray-900">{t("dashboard.dashboardTitle")}</h1>
        <p className="text-gray-600 mt-1">
          {t("dashboard.dashboardSubtitle")}
        </p>
      </motion.div>

      {/* Main Statistics Cards Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title={t("dashboard.currentStudents")}
          value={stats.totalStudents}
          icon={Users}
          color="primary"
          gradient
        />
        <StatCard
          title={t("dashboard.currentTeachers")}
          value={stats.totalTeachers}
          icon={GraduationCap}
          color="secondary"
        />
        <StatCard
          title={t("dashboard.todayClasses")}
          value={`${stats.todayClasses} ${t("dashboard.classes")} (${stats.todayHours} ${t("common.hours")})`}
          icon={Calendar}
          color="accent"
        />
        <StatCard
          title={t("dashboard.todayTrials")}
          value={stats.todayTrials}
          icon={Clock}
          color="success"
        />
      </motion.div>

      {/* Secondary Statistics Cards Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title={t("dashboard.activePackages")}
          value={stats.activePackages}
          icon={Package}
          color="primary"
        />
        <StatCard
          title={t("dashboard.reachedLimitPackages")}
          value={stats.reachedLimitPackages}
          icon={AlertCircle}
          color="warning"
        />
        <StatCard
          title={t("dashboard.currentMonthSalary")}
          value={stats.currentMonthSalary.toLocaleString()}
          icon={DollarSign}
          color="accent"
        />
        <StatCard
          title={t("dashboard.currentMonthIncome")}
          value={stats.currentMonthIncome.toLocaleString()}
          icon={TrendingUp}
          color="success"
        />
      </motion.div>

      {/* Additional Information Cards */}
      <motion.div
        variants={itemVariants}
        className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${direction === "rtl" ? "rtl" : ""}`}
      >
        {/* Today's Overview */}
        <Card className={`shadow-sm border-0 bg-white hover:shadow-lg transition-all duration-300 ${direction === "rtl" ? "rtl" : ""}`}>
          <CardHeader className={`pb-3 ${direction === "rtl" ? "text-right" : "text-left"}`}>
            <div className={`flex items-center gap-2 ${direction === "rtl" ? "flex-row-reverse justify-end" : "justify-start"}`}>
              <Calendar className="h-5 w-5 text-purple-600 flex-shrink-0" />
              <CardTitle className="text-lg font-bold text-gray-900">
                {t("dashboard.todayOverview")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`flex items-center p-3 bg-purple-50 rounded-lg ${direction === "rtl" ? "flex-row-reverse justify-between" : "justify-between"}`}>
                {direction === "rtl" ? (
                  <>
                    <span className="text-lg font-bold text-purple-600 text-left">
                      {stats.todayClasses}
                    </span>
                    <span className="text-sm font-medium text-gray-700 text-right">
                      {t("dashboard.totalClasses")}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-700">
                      {t("dashboard.totalClasses")}
                    </span>
                    <span className="text-lg font-bold text-purple-600">
                      {stats.todayClasses}
                    </span>
                  </>
                )}
              </div>
              <div className={`flex items-center p-3 bg-blue-50 rounded-lg ${direction === "rtl" ? "flex-row-reverse justify-between" : "justify-between"}`}>
                {direction === "rtl" ? (
                  <>
                    <span className="text-lg font-bold text-blue-600 text-left">
                      {stats.todayHours} {t("common.hours")}
                    </span>
                    <span className="text-sm font-medium text-gray-700 text-right">
                      {t("dashboard.totalHours")}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-700">
                      {t("dashboard.totalHours")}
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {stats.todayHours} {t("common.hours")}
                    </span>
                  </>
                )}
              </div>
              <div className={`flex items-center p-3 bg-green-50 rounded-lg ${direction === "rtl" ? "flex-row-reverse justify-between" : "justify-between"}`}>
                {direction === "rtl" ? (
                  <>
                    <span className="text-lg font-bold text-green-600 text-left">
                      {stats.todayTrials}
                    </span>
                    <span className="text-sm font-medium text-gray-700 text-right">
                      {t("dashboard.trialClasses")}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-700">
                      {t("dashboard.trialClasses")}
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {stats.todayTrials}
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Packages Overview */}
        <Card className={`shadow-sm border-0 bg-white hover:shadow-lg transition-all duration-300 ${direction === "rtl" ? "rtl" : ""}`}>
          <CardHeader className={`pb-3 ${direction === "rtl" ? "text-right" : "text-left"}`}>
            <div className={`flex items-center gap-2 ${direction === "rtl" ? "flex-row-reverse justify-end" : "justify-start"}`}>
              <Package className="h-5 w-5 text-indigo-600 flex-shrink-0" />
              <CardTitle className="text-lg font-bold text-gray-900">
                {t("dashboard.packagesOverview")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`flex items-center p-3 bg-indigo-50 rounded-lg ${direction === "rtl" ? "flex-row-reverse justify-between" : "justify-between"}`}>
                {direction === "rtl" ? (
                  <>
                    <span className="text-lg font-bold text-indigo-600 text-left">
                      {stats.activePackages}
                    </span>
                    <span className="text-sm font-medium text-gray-700 text-right">
                      {t("dashboard.activePackages")}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-700">
                      {t("dashboard.activePackages")}
                    </span>
                    <span className="text-lg font-bold text-indigo-600">
                      {stats.activePackages}
                    </span>
                  </>
                )}
              </div>
              <div className={`flex items-center p-3 bg-orange-50 rounded-lg ${direction === "rtl" ? "flex-row-reverse justify-between" : "justify-between"}`}>
                {direction === "rtl" ? (
                  <>
                    <span className="text-lg font-bold text-orange-600 text-left">
                      {stats.reachedLimitPackages}
                    </span>
                    <span className="text-sm font-medium text-gray-700 text-right">
                      {t("dashboard.reachedLimitPackages")}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-700">
                      {t("dashboard.reachedLimitPackages")}
                    </span>
                    <span className="text-lg font-bold text-orange-600">
                      {stats.reachedLimitPackages}
                    </span>
                  </>
                )}
              </div>
              <div className={`flex items-center p-3 bg-gray-50 rounded-lg ${direction === "rtl" ? "flex-row-reverse justify-between" : "justify-between"}`}>
                {direction === "rtl" ? (
                  <>
                    <span className="text-lg font-bold text-gray-600 text-left">
                      {stats.activePackages + stats.reachedLimitPackages}
                    </span>
                    <span className="text-sm font-medium text-gray-700 text-right">
                      {t("dashboard.totalPackages")}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-700">
                      {t("dashboard.totalPackages")}
                    </span>
                    <span className="text-lg font-bold text-gray-600">
                      {stats.activePackages + stats.reachedLimitPackages}
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Financial Summary */}
      <motion.div variants={itemVariants}>
        <Card className={`shadow-sm border-0 bg-white hover:shadow-lg transition-all duration-300 ${direction === "rtl" ? "rtl" : ""}`}>
          <CardHeader className={`pb-3 ${direction === "rtl" ? "text-right" : "text-left"}`}>
            <div className={`flex items-center gap-2 ${direction === "rtl" ? "flex-row-reverse justify-end" : "justify-start"}`}>
              <DollarSign className="h-5 w-5 text-green-600 flex-shrink-0" />
              <CardTitle className="text-lg font-bold text-gray-900">
                {t("dashboard.currentMonthFinancials")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className={`flex items-center ${direction === "rtl" ? "justify-between" : "justify-between"} gap-3`}>
                  {direction === "rtl" ? (
                    <>
                      <TrendingUp className="h-8 w-8 text-green-600 flex-shrink-0" />
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600 mb-1">
                          {stats.currentMonthIncome.toLocaleString()}
                        </p>
                        <p className="text-sm font-medium text-gray-600">
                          {t("dashboard.totalIncome")}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-600">
                          {t("dashboard.totalIncome")}
                        </p>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                          {stats.currentMonthIncome.toLocaleString()}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600 flex-shrink-0" />
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className={`flex items-center ${direction === "rtl" ? "justify-between" : "justify-between"} gap-3`}>
                  {direction === "rtl" ? (
                    <>
                      <FileText className="h-8 w-8 text-purple-600 flex-shrink-0" />
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600 mb-1">
                          {stats.currentMonthSalary.toLocaleString()}
                        </p>
                        <p className="text-sm font-medium text-gray-600">
                          {t("dashboard.totalSalaries")}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-600">
                          {t("dashboard.totalSalaries")}
                        </p>
                        <p className="text-2xl font-bold text-purple-600 mt-1">
                          {stats.currentMonthSalary.toLocaleString()}
                        </p>
                      </div>
                      <FileText className="h-8 w-8 text-purple-600 flex-shrink-0" />
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 md:col-span-2">
                <div className={`flex items-center ${direction === "rtl" ? "justify-between" : "justify-between"} gap-3`}>
                  {direction === "rtl" ? (
                    <>
                      <DollarSign className="h-8 w-8 text-blue-600 flex-shrink-0" />
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600 mb-1">
                          {(stats.currentMonthIncome - stats.currentMonthSalary).toLocaleString()}
                        </p>
                        <p className="text-sm font-medium text-gray-600">
                          {t("dashboard.netProfit")}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-600">
                          {t("dashboard.netProfit")}
                        </p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">
                          {(stats.currentMonthIncome - stats.currentMonthSalary).toLocaleString()}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-blue-600 flex-shrink-0" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

