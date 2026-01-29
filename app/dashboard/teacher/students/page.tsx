"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, UserX, TrendingDown, DollarSign, Clock, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TeacherService } from "@/lib/services/teacher.service";
import { Student } from "@/lib/api/types";

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

export default function TeacherStudentsPage() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total_students: 0,
    active_students: 0,
    less_active_students: 0,
    stopped_students: 0,
    total_salary: 0,
    this_month_salary: 0,
    this_month_hours: 0,
    currency: "USD",
  });
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await TeacherService.getStudents(search || undefined);
      setStudents(response.students);
      setStats(response.stats);
    } catch (err: any) {
      setError(err.message || "Failed to load students");
      console.error("Error fetching students:", err);
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {t("teacher.myStudents") || "My Students"}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          {t("teacher.viewStudents") || "View your assigned students"}
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
              {t("teacher.activeStudents") || "Active Students"}
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active_students}</div>
            <p className="text-xs text-muted-foreground">
              {t("teacher.highlyActive") || "Highly active students"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("teacher.lessActiveStudents") || "Less Active"}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.less_active_students}</div>
            <p className="text-xs text-muted-foreground">
              {t("teacher.mediumLowActivity") || "Medium/Low activity"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("teacher.stoppedStudents") || "Stopped Students"}
            </CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.stopped_students}</div>
            <p className="text-xs text-muted-foreground">
              {t("teacher.inactiveStudents") || "Inactive students"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("teacher.thisMonthSalary") || "This Month Salary"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.this_month_salary.toLocaleString()} {stats.currency}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.this_month_hours} {t("common.hours") || "hours"}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {t("common.search") || "Search Students"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder={t("teacher.searchStudentsPlaceholder") || "Search by name or email..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </CardContent>
        </Card>
      </motion.div>

      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg"
        >
          <p className="font-medium">{error}</p>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {students.map((student: any) => (
            <Card key={student.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {student.full_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">{t("teacher.totalHours") || "Total Hours"}: </span>
                  {student.total_hours || 0}
                </div>
                {student.activity_level && (
                  <div className="text-xs mt-2">
                    <span
                      className={`px-2 py-1 rounded-full ${
                        student.activity_level === "highly_active"
                          ? "bg-green-100 text-green-800"
                          : student.activity_level === "medium" || student.activity_level === "low"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {student.activity_level === "highly_active"
                        ? t("teacher.highlyActive") || "Highly Active"
                        : student.activity_level === "medium"
                        ? t("teacher.medium") || "Medium"
                        : student.activity_level === "low"
                        ? t("teacher.low") || "Low"
                        : t("teacher.stopped") || "Stopped"}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {students.length === 0 && !isLoading && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">{t("teacher.noStudentsFound") || "No students found"}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
