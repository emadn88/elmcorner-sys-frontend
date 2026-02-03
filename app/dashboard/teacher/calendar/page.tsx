"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  Filter,
  X,
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TeacherService } from "@/lib/services/teacher.service";
import { ClassInstance } from "@/lib/api/types";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { MonthCalendarView } from "@/components/calendar/month-calendar-view";
import { DailyCalendarView } from "@/components/calendar/daily-calendar-view";
import { cn } from "@/lib/utils";

type ViewMode = "month" | "week" | "day" | "list";

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

export default function TeacherCalendarPage() {
  const { t } = useLanguage();
  const [classes, setClasses] = useState<ClassInstance[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string>(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState<string>(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  useEffect(() => {
    fetchClasses();
  }, [dateFrom, dateTo, statusFilter]);

  // Update date range when switching to daily view to ensure we have data
  useEffect(() => {
    if (viewMode === "day") {
      // For daily view, fetch the entire month to ensure smooth navigation
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const newDateFrom = format(monthStart, "yyyy-MM-dd");
      const newDateTo = format(monthEnd, "yyyy-MM-dd");
      
      // Only update if different to avoid infinite loops
      if (dateFrom !== newDateFrom || dateTo !== newDateTo) {
        setDateFrom(newDateFrom);
        setDateTo(newDateTo);
      }
    }
  }, [viewMode]); // Only depend on viewMode to avoid loops

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await TeacherService.getCalendar({
        start_date: dateFrom,
        end_date: dateTo,
      });
      setClasses(data);
    } catch (err: any) {
      setError(err.message || "Failed to load classes");
      console.error("Error fetching classes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClasses = useMemo(() => {
    let filtered = classes;
    if (statusFilter !== "all") {
      filtered = filtered.filter((classItem) => classItem.status === statusFilter);
    }
    return filtered;
  }, [classes, statusFilter]);

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    setCurrentDate(newDate);
    setDateFrom(format(startOfMonth(newDate), "yyyy-MM-dd"));
    setDateTo(format(endOfMonth(newDate), "yyyy-MM-dd"));
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    setCurrentDate(newDate);
    setDateFrom(format(startOfMonth(newDate), "yyyy-MM-dd"));
    setDateTo(format(endOfMonth(newDate), "yyyy-MM-dd"));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setDateFrom(format(startOfMonth(today), "yyyy-MM-dd"));
    setDateTo(format(endOfMonth(today), "yyyy-MM-dd"));
  };

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
    // Update date range to include the new day
    const monthStart = startOfMonth(newDate);
    const monthEnd = endOfMonth(newDate);
    setDateFrom(format(monthStart, "yyyy-MM-dd"));
    setDateTo(format(monthEnd, "yyyy-MM-dd"));
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
    // Update date range to include the new day
    const monthStart = startOfMonth(newDate);
    const monthEnd = endOfMonth(newDate);
    setDateFrom(format(monthStart, "yyyy-MM-dd"));
    setDateTo(format(monthEnd, "yyyy-MM-dd"));
  };

  const handleClearFilters = () => {
    const today = new Date();
    setCurrentDate(today);
    setDateFrom(format(startOfMonth(today), "yyyy-MM-dd"));
    setDateTo(format(endOfMonth(today), "yyyy-MM-dd"));
    setStatusFilter("all");
  };

  const stats = useMemo(() => {
    return {
      total: filteredClasses.length,
      pending: filteredClasses.filter((c) => c.status === "pending").length,
      attended: filteredClasses.filter((c) => c.status === "attended").length,
      cancelled: filteredClasses.filter(
        (c) => c.status === "cancelled_by_teacher" || c.status === "cancelled_by_student"
      ).length,
      absent: filteredClasses.filter((c) => c.status === "absent_student").length,
    };
  }, [filteredClasses]);

  const hasFilters = statusFilter !== "all" || dateFrom !== format(startOfMonth(new Date()), "yyyy-MM-dd") || dateTo !== format(endOfMonth(new Date()), "yyyy-MM-dd");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t("teacher.calendar") || "Calendar"}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {t("teacher.viewAllClasses") || "View all your classes"}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <Button
                variant={viewMode === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("month")}
                className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">{t("teacher.viewMode.month") || "Month"}</span>
              </Button>
              <Button
                variant={viewMode === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("day")}
                className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">{t("teacher.viewMode.day") || "Day"}</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <List className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">{t("teacher.viewMode.list") || "List"}</span>
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {t("common.filters") || "Filters"}
              {hasFilters && (
                <span className="ml-1 h-2 w-2 rounded-full bg-primary"></span>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600 mt-1">
                {t("teacher.statistics.totalClasses") || "Total Classes"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
              <div className="text-sm text-gray-600 mt-1">
                {t("teacher.statistics.pending") || "Pending"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.attended}</div>
              <div className="text-sm text-gray-600 mt-1">
                {t("teacher.statistics.attended") || "Attended"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-sm text-gray-600 mt-1">
                {t("teacher.statistics.cancelled") || "Cancelled"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">{stats.absent}</div>
              <div className="text-sm text-gray-600 mt-1">
                {t("teacher.statistics.absent") || "Absent"}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Filters */}
      {showFilters && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  {t("teacher.filters") || "Filters"}
                </CardTitle>
                {hasFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
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
                    onChange={(e) => setDateFrom(e.target.value)}
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
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">
                    {t("classes.statusLabel") || "Status"}
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
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
        </motion.div>
      )}

      {/* Calendar Content */}
      <motion.div variants={itemVariants}>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[600px]">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                <p className="font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === "month" ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CalendarIcon className="h-5 w-5" />
                  {format(currentDate, "MMMM yyyy")}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousMonth}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t("common.previous") || "Previous"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToday}
                  >
                    {t("common.today") || "Today"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextMonth}
                    className="flex items-center gap-1"
                  >
                    {t("common.next") || "Next"}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <MonthCalendarView
                currentDate={currentDate}
                classes={filteredClasses}
                onPreviousMonth={handlePreviousMonth}
                onNextMonth={handleNextMonth}
                onToday={handleToday}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        ) : viewMode === "day" ? (
          <DailyCalendarView
            currentDate={currentDate}
            classes={filteredClasses}
            onPreviousDay={handlePreviousDay}
            onNextDay={handleNextDay}
            onToday={handleToday}
            onDateChange={(date) => {
              setCurrentDate(date);
              const monthStart = startOfMonth(date);
              const monthEnd = endOfMonth(date);
              setDateFrom(format(monthStart, "yyyy-MM-dd"));
              setDateTo(format(monthEnd, "yyyy-MM-dd"));
            }}
            isLoading={isLoading}
          />
        ) : (
          // List View (fallback to old card view)
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                {t("teacher.classesList") || "Classes List"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredClasses.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {t("teacher.noClassesFound") || "No classes found for the selected period"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredClasses.map((classItem) => (
                    <motion.div
                      key={classItem.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            {classItem.student?.full_name || "Unknown Student"}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {classItem.course?.name || "Unknown Course"}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              {format(new Date(classItem.class_date), "MMM dd, yyyy")}
                            </span>
                            <span>
                              {classItem.start_time?.substring(0, 5)} - {classItem.end_time?.substring(0, 5)}
                            </span>
                            {classItem.duration && (
                              <span>{classItem.duration} min</span>
                            )}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "px-3 py-1 text-xs font-semibold rounded-full",
                            classItem.status === "attended" && "bg-green-100 text-green-800",
                            classItem.status === "pending" && "bg-blue-100 text-blue-800",
                            (classItem.status === "cancelled_by_teacher" || classItem.status === "cancelled_by_student") && "bg-red-100 text-red-800",
                            classItem.status === "absent_student" && "bg-orange-100 text-orange-800"
                          )}
                        >
                          {classItem.status.replace("_", " ")}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>

    </motion.div>
  );
}
