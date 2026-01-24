"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  X
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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
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

  useEffect(() => {
    fetchClasses();
  }, [dateFrom, dateTo, statusFilter]);

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
    if (statusFilter === "all") return classes;
    return classes.filter((classItem) => classItem.status === statusFilter);
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

  const handleClearFilters = () => {
    const today = new Date();
    setCurrentDate(today);
    setDateFrom(format(startOfMonth(today), "yyyy-MM-dd"));
    setDateTo(format(endOfMonth(today), "yyyy-MM-dd"));
    setStatusFilter("all");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "attended":
        return "bg-green-50 border-green-200 text-green-800";
      case "pending":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "cancelled_by_teacher":
      case "cancelled_by_student":
        return "bg-red-50 border-red-200 text-red-800";
      case "absent_student":
        return "bg-orange-50 border-orange-200 text-orange-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "attended":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled_by_teacher":
      case "cancelled_by_student":
        return "bg-red-100 text-red-800";
      case "absent_student":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const hasFilters = statusFilter !== "all" || dateFrom !== format(startOfMonth(new Date()), "yyyy-MM-dd") || dateTo !== format(endOfMonth(new Date()), "yyyy-MM-dd");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("teacher.calendar") || "Calendar"}
            </h1>
            <p className="text-gray-600 mt-1">
              {t("teacher.viewAllClasses") || "View all your classes"}
            </p>
          </div>
          <div className="flex items-center gap-3">
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

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
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
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClasses.map((classItem) => (
                <motion.div
                  key={classItem.id}
                  variants={cardVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className={`h-full border-2 transition-all hover:shadow-lg ${getStatusColor(classItem.status)}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {classItem.student?.full_name || "Unknown Student"}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <BookOpen className="h-3 w-3" />
                            {classItem.course?.name || "Unknown Course"}
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(classItem.status)}`}
                        >
                          {classItem.status.replace("_", " ")}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {format(new Date(classItem.class_date), "MMM dd, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>
                            {classItem.start_time?.substring(0, 5)} - {classItem.end_time?.substring(0, 5)}
                          </span>
                        </div>
                        {classItem.duration && (
                          <div className="text-xs text-gray-500 pt-1">
                            Duration: {classItem.duration} minutes
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredClasses.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {t("teacher.noClassesFound") || "No classes found for the selected period"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
