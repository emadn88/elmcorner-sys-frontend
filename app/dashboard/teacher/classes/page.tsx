"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TeacherService } from "@/lib/services/teacher.service";
import { TeacherClass } from "@/lib/api/types";
import { format } from "date-fns";
import { ClassDetailsModal } from "@/components/teacher/class-details-modal";
import { ClassesTable } from "@/components/teacher/classes-table";
import { ClassesFilters } from "@/components/teacher/classes-filters";

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

export default function TeacherClassesPage() {
  const { t } = useLanguage();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    attended: 0,
    pending: 0,
    cancelled: 0,
    attendance_rate: 0,
  });
  const [selectedClass, setSelectedClass] = useState<TeacherClass | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchClasses();
  }, [dateFrom, dateTo, statusFilter]);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const filters: any = {};
      
      if (dateFrom) filters.date_from = dateFrom;
      if (dateTo) filters.date_to = dateTo;
      if (statusFilter !== "all") filters.status = statusFilter;

      const response = await TeacherService.getClasses(filters);
      setClasses(response.classes);
      setStats(response.stats);
    } catch (err: any) {
      setError(err.message || "Failed to load classes");
      console.error("Error fetching classes:", err);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  const handleClearFilters = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    setDateFrom(today);
    setDateTo(today);
    setStatusFilter("all");
  };

  const handleEnterMeet = async (classItem: TeacherClass) => {
    try {
      // For testing: redirect to Google by default
      window.open("https://www.google.com", "_blank");
      
      // Call API to mark meet as entered (this will change status to pending)
      const result = await TeacherService.enterMeet(classItem.id);
      if (result.meet_link) {
        // Already opened Google above, but in production use: window.open(result.meet_link, "_blank");
      }
      // Refresh classes to update the UI (meet button will hide, edit button will show)
      await fetchClasses();
    } catch (err: any) {
      alert(err.message || "Failed to enter meet");
    }
  };

  const handleEndClass = async (classItem: TeacherClass) => {
    try {
      await TeacherService.endClass(classItem.id);
      await fetchClasses();
    } catch (err: any) {
      alert(err.message || "Failed to end class");
    }
  };

  const handleViewDetails = (classItem: TeacherClass) => {
    setSelectedClass(classItem);
    setIsModalOpen(true);
  };

  if (isInitialLoading) {
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
          {t("teacher.myClasses") || "My Classes"}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          {t("teacher.manageClasses") || "Manage and view your classes"}
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attended</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.attended}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendance_rate}%</div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <ClassesFilters
          dateFrom={dateFrom}
          dateTo={dateTo}
          status={statusFilter}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onStatusChange={setStatusFilter}
          onClear={handleClearFilters}
        />
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
        <ClassesTable
          classes={classes}
          onEnterMeet={handleEnterMeet}
          onEndClass={handleEndClass}
          onViewDetails={handleViewDetails}
          isLoading={isLoading}
        />
      </motion.div>

      {selectedClass && (
        <ClassDetailsModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          classItem={selectedClass}
          onUpdate={fetchClasses}
        />
      )}
    </motion.div>
  );
}
