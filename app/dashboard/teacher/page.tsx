"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, Clock, AlertCircle, TrendingUp, DollarSign, BookOpen, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TeacherService } from "@/lib/services/teacher.service";
import { TeacherDashboardStats, ClassInstance } from "@/lib/api/types";

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

export default function TeacherDashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [todayClasses, setTodayClasses] = useState<ClassInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await TeacherService.getDashboardStats();
      setStats(data.stats);
      setTodayClasses(data.today_classes || []);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 w-full"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {t("teacher.dashboard") || "Teacher Dashboard"}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          {t("teacher.dashboardSubtitle") || "Overview of your classes and statistics"}
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("teacher.todayClasses") || "Today's Classes"}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.today_classes_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("teacher.classesScheduled") || "Classes scheduled for today"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("teacher.pendingClasses") || "Pending Classes"}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_classes_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("teacher.awaitingStatus") || "Awaiting status update"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("teacher.attendanceRate") || "Attendance Rate"}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.attendance_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {t("teacher.overallAttendance") || "Overall attendance"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("teacher.totalHours") || "Total Hours"}
            </CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_hours || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("teacher.hoursWorked") || "Hours worked"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("teacher.totalSalary") || "Total Salary"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_salary?.toLocaleString() || 0} {stats?.currency || ""}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("teacher.earnings") || "Total earnings"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("teacher.totalCourses") || "Total Courses"}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_courses || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("teacher.assignedCourses") || "Assigned courses"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("teacher.students") || "My Students"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.assigned_students_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("teacher.totalAssignedStudents") || "Total assigned students"}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Classes */}
      {todayClasses.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>{t("teacher.todayClasses") || "Today's Classes"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-2 sm:gap-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base truncate">
                        {classItem.student?.full_name || "Unknown Student"}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 truncate">
                        {classItem.course?.name || "Unknown Course"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {classItem.start_time} - {classItem.end_time}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span
                        className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
                          classItem.status === "attended"
                            ? "bg-green-100 text-green-800"
                            : classItem.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {classItem.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* This Month Hours */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>{t("teacher.monthlyHours") || "This Month Hours"}</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.this_month_hours || 0}</div>
            <p className="text-sm text-muted-foreground mt-2">
              {t("teacher.hoursThisMonth") || "Hours scheduled this month"}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
