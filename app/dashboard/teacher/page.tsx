"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, DollarSign, Timer, Bell, Clock, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TeacherService } from "@/lib/services/teacher.service";
import { TeacherDashboardStats, ClassInstance, TrialClass } from "@/lib/api/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

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
  const [attendedClasses, setAttendedClasses] = useState<ClassInstance[]>([]);
  const [thisWeekTrials, setThisWeekTrials] = useState<TrialClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [rateModalType, setRateModalType] = useState<'punctuality' | 'report_submission' | null>(null);
  const [rateModalData, setRateModalData] = useState<any>(null);
  const [rateModalLoading, setRateModalLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get today's date and end of week (7 days from today) in YYYY-MM-DD format
      const today = new Date();
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() + 7);
      const todayStr = today.toISOString().split('T')[0];
      const weekEndStr = weekEnd.toISOString().split('T')[0];
      
      // Fetch dashboard stats and this week's trials
      const [dashboardData, trialsData] = await Promise.all([
        TeacherService.getDashboardStats(),
        TeacherService.getTrials({ date_from: todayStr, date_to: weekEndStr })
      ]);
      
      setStats(dashboardData.stats);
      setTodayClasses(dashboardData.today_classes || []);
      setAttendedClasses(dashboardData.attended_classes || []);
      setThisWeekTrials(trialsData.trials || []);
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

  // Format time to 12-hour format
  const formatTime12Hour = (timeString: string) => {
    if (!timeString) return "—";
    try {
      const [hours, minutes] = timeString.split(":");
      const hour24 = parseInt(hours, 10);
      const hour12 = hour24 % 12 || 12;
      const ampm = hour24 >= 12 ? "PM" : "AM";
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  // Handle rate card click
  const handleRateCardClick = async (type: 'punctuality' | 'report_submission') => {
    setRateModalType(type);
    setRateModalOpen(true);
    setRateModalLoading(true);
    setRateModalData(null);
    setError(null);
    
    try {
      const currentDate = new Date();
      const response = await TeacherService.getMonthlyRateDetails({
        type,
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      });
      
      // The service returns response.data from Laravel's { status: 'success', data: {...} }
      // So response is the actual data object (rate, classes, etc.)
      console.log('Rate details response:', response);
      
      if (response && (response.rate !== undefined || response.total_joined !== undefined || response.total_reports !== undefined || response.classes !== undefined)) {
        setRateModalData(response);
      } else {
        console.error("Invalid response format:", response);
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("Error loading rate details:", err);
      setError(err.message || "Failed to load rate details");
      setRateModalData(null);
    } finally {
      setRateModalLoading(false);
    }
  };

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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6"
      >
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

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleRateCardClick('punctuality')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("teacher.punctualityRate") || "Punctuality Rate"}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.punctuality_rate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {t("teacher.punctualityScore") || "Score"}: {stats?.punctuality_score || 0}/100
            </p>
            <div className="mt-2 text-xs text-gray-600">
              <span className="text-green-600">
                {t("teacher.onTime") || "On-time"}: {stats?.on_time_classes || 0}
              </span>
              {" • "}
              <span className="text-yellow-600">
                {t("teacher.late") || "Late"}: {stats?.late_classes || 0}
              </span>
              {" • "}
              <span className="text-red-600">
                {t("teacher.veryLate") || "Very Late"}: {stats?.very_late_classes || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleRateCardClick('report_submission')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("teacher.reportSubmissionRate") || "Report Submission Rate"}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.report_submission_rate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {t("teacher.reportSubmissionScore") || "Score"}: {stats?.report_submission_score || 0}/100
            </p>
            <div className="mt-2 text-xs text-gray-600">
              <span className="text-green-600">
                {t("teacher.immediate") || "Immediate"}: {stats?.immediate_reports || 0}
              </span>
              {" • "}
              <span className="text-yellow-600">
                {t("teacher.late") || "Late"}: {stats?.late_reports || 0}
              </span>
              {" • "}
              <span className="text-red-600">
                {t("teacher.veryLate") || "Very Late"}: {stats?.very_late_reports || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Attended Classes (Used for Hours & Salary Calculation) */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {t("teacher.attendedClassesForCalculation") || "Attended Classes (Used for Hours & Salary)"}
              {attendedClasses.length > 0 && (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  {attendedClasses.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendedClasses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        {t("teacher.student") || "Student"}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        {t("teacher.course") || "Course"}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        {t("teacher.date") || "Date"}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        {t("teacher.time") || "Time"}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        {t("teacher.duration") || "Duration"}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        {t("teacher.hours") || "Hours"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendedClasses.map((classItem) => {
                      const hours = (classItem.duration || 0) / 60;
                      return (
                        <tr
                          key={classItem.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {classItem.student?.full_name || "Unknown Student"}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {classItem.course?.name || "Unknown Course"}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {classItem.class_date
                              ? new Date(classItem.class_date).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {classItem.start_time && classItem.end_time
                              ? `${formatTime12Hour(classItem.start_time)} - ${formatTime12Hour(classItem.end_time)}`
                              : "—"}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {classItem.duration ? `${classItem.duration} min` : "—"}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {hours.toFixed(2)}h
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 bg-gray-100 font-semibold">
                      <td colSpan={4} className="py-3 px-4 text-sm text-gray-900 text-right">
                        {t("teacher.total") || "Total"}:
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {attendedClasses.reduce((sum, c) => sum + (c.duration || 0), 0)} min
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {stats?.total_hours?.toFixed(2) || "0.00"}h
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">
                  {t("teacher.noAttendedClasses") || "No attended classes found"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {t("teacher.todayClasses") || "Today's Classes"}
                {todayClasses.length > 0 && (
                  <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                    <Bell className="h-3 w-3 mr-1" />
                    {todayClasses.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayClasses.length > 0 ? (
                <div className="space-y-3">
                  {todayClasses.map((classItem) => (
                    <div
                      key={classItem.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold text-base truncate">
                            {classItem.student?.full_name || "Unknown Student"}
                          </div>
                          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                            <Bell className="h-3 w-3 mr-1" />
                            Today
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 truncate mb-1">
                          {classItem.course?.name || "Unknown Course"}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatTime12Hour(classItem.start_time)} - {formatTime12Hour(classItem.end_time)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            classItem.status === "attended"
                              ? "default"
                              : classItem.status === "pending"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            classItem.status === "attended"
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : classItem.status === "pending"
                              ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                              : ""
                          }
                        >
                          {classItem.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">
                    {t("teacher.noClassesScheduled") || "No classes scheduled for today"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* This Week's Trials */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {t("teacher.thisWeekTrials") || "This Week's Trials"}
                {thisWeekTrials.length > 0 && (
                  <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
                    <Bell className="h-3 w-3 mr-1" />
                    {thisWeekTrials.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {thisWeekTrials.length > 0 ? (
                <div className="space-y-3">
                  {thisWeekTrials.map((trial) => (
                    <div
                      key={trial.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold text-base truncate">
                            {trial.student?.full_name || "Unknown Student"}
                          </div>
                          <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
                            <Bell className="h-3 w-3 mr-1" />
                            {trial.trial_date}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 truncate mb-1">
                          {trial.course?.name || "Unknown Course"}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatTime12Hour(trial.start_time)} - {formatTime12Hour(trial.end_time)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            trial.status === "completed"
                              ? "default"
                              : trial.status === "pending"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            trial.status === "completed"
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : trial.status === "pending"
                              ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                              : trial.status === "converted"
                              ? "bg-blue-500 hover:bg-blue-600 text-white"
                              : ""
                          }
                        >
                          {trial.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mb-2 text-gray-400" />
                  <p className="text-sm text-center w-full">
                    {t("teacher.noTrialsScheduled") || "No trials scheduled"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Rate Details Modal */}
      <Dialog open={rateModalOpen} onOpenChange={setRateModalOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {rateModalType === 'punctuality' 
                ? (t("teacher.punctualityRate") || "Punctuality Rate")
                : (t("teacher.reportSubmissionRate") || "Report Submission Rate")
              } - {format(new Date(), "MMMM yyyy")}
            </DialogTitle>
            <DialogDescription>
              {rateModalType === 'punctuality'
                ? (t("teacher.punctualityRateDetails") || "Detailed breakdown of your punctuality for this month")
                : (t("teacher.reportSubmissionRateDetails") || "Detailed breakdown of your report submission for this month")
              }
            </DialogDescription>
          </DialogHeader>
          
          {rateModalLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p className="font-medium">{error}</p>
            </div>
          ) : rateModalData ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">
                    {rateModalType === 'punctuality' 
                      ? (t("teacher.totalJoined") || "Total Joined")
                      : (t("teacher.totalSubmitted") || "Total Submitted")
                    }
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {rateModalData.total_joined || rateModalData.total_reports || 0}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600">
                    {rateModalType === 'punctuality'
                      ? (t("teacher.onTime") || "On-time")
                      : (t("teacher.immediate") || "Immediate")
                    }
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {rateModalData.on_time || rateModalData.immediate || 0}
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-yellow-600">
                    {t("teacher.late") || "Late"}
                  </div>
                  <div className="text-2xl font-bold text-yellow-700">
                    {rateModalData.late || 0}
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-600">
                    {t("teacher.veryLate") || "Very Late"}
                  </div>
                  <div className="text-2xl font-bold text-red-700">
                    {rateModalData.very_late || 0}
                  </div>
                </div>
              </div>

              {/* Classes Table */}
              {rateModalData.classes && rateModalData.classes.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("teacher.student") || "Student"}</TableHead>
                        <TableHead>{t("teacher.course") || "Course"}</TableHead>
                        <TableHead>{t("teacher.date") || "Date"}</TableHead>
                        {rateModalType === 'punctuality' ? (
                          <>
                            <TableHead>{t("teacher.classStartTime") || "Class Start"}</TableHead>
                            <TableHead>{t("teacher.joinedTime") || "Joined Time"}</TableHead>
                            <TableHead>{t("teacher.status") || "Status"}</TableHead>
                            <TableHead>{t("teacher.minutesLate") || "Minutes Late"}</TableHead>
                          </>
                        ) : (
                          <>
                            <TableHead>{t("teacher.classEndTime") || "Class End"}</TableHead>
                            <TableHead>{t("teacher.submittedTime") || "Submitted Time"}</TableHead>
                            <TableHead>{t("teacher.status") || "Status"}</TableHead>
                            <TableHead>{t("teacher.minutesAfterEnd") || "Minutes After End"}</TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rateModalData.classes.map((classItem: any) => (
                        <TableRow key={classItem.id}>
                          <TableCell>{classItem.student_name}</TableCell>
                          <TableCell>{classItem.course_name}</TableCell>
                          <TableCell>
                            {format(new Date(classItem.class_date), "MMM dd, yyyy")}
                          </TableCell>
                          {rateModalType === 'punctuality' ? (
                            <>
                              <TableCell>{formatTime12Hour(classItem.start_time)}</TableCell>
                              <TableCell>
                                {format(new Date(classItem.joined_time), "MMM dd, yyyy h:mm a")}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    classItem.status === 'on_time'
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : classItem.status === 'late'
                                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                      : "bg-red-100 text-red-700 border-red-200"
                                  }
                                >
                                  {classItem.status === 'on_time'
                                    ? (t("teacher.onTime") || "On-time")
                                    : classItem.status === 'late'
                                    ? (t("teacher.late") || "Late")
                                    : (t("teacher.veryLate") || "Very Late")
                                  }
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {classItem.minutes_late > 0 ? `${classItem.minutes_late} min` : "—"}
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{formatTime12Hour(classItem.end_time)}</TableCell>
                              <TableCell>
                                {format(new Date(classItem.submitted_time), "MMM dd, yyyy h:mm a")}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    classItem.status === 'immediate'
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : classItem.status === 'late'
                                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                      : "bg-red-100 text-red-700 border-red-200"
                                  }
                                >
                                  {classItem.status === 'immediate'
                                    ? (t("teacher.immediate") || "Immediate")
                                    : classItem.status === 'late'
                                    ? (t("teacher.late") || "Late")
                                    : (t("teacher.veryLate") || "Very Late")
                                  }
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {classItem.minutes_after_end > 0 ? `${classItem.minutes_after_end} min` : "—"}
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>{t("teacher.noDataAvailable") || "No data available for this month"}</p>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
