"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, BookOpen, BookCheck, BookX, Search, X, Eye, Edit, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { Course, CourseFilters, CourseStats } from "@/types/courses";
import { CourseService } from "@/lib/services/course.service";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CourseFormModal } from "@/components/courses/course-form-modal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export default function CoursesPage() {
  const { t, direction } = useLanguage();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filters, setFilters] = useState<CourseFilters>({
    search: "",
    status: "all",
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [stats, setStats] = useState<CourseStats>({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await CourseService.getCourses({
        ...filters,
        page: currentPage,
        per_page: 15,
      });
      setCourses(response.data);
    } catch (err: any) {
      setError(err.message || t("courses.errorLoading") || "Failed to fetch courses");
      console.error("Error fetching courses:", err);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const statsData = await CourseService.getCourseStats();
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    fetchCourses();
    fetchStats();
  }, [filters, currentPage]);

  // Handle add course
  const handleAddCourse = () => {
    setEditingCourse(null);
    setIsFormOpen(true);
  };

  // Handle edit course
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsFormOpen(true);
  };

  // Handle save course
  const handleSaveCourse = async (courseData: Partial<Course>) => {
    try {
      setIsLoading(true);
      setError(null);

      if (editingCourse) {
        await CourseService.updateCourse(editingCourse.id, courseData);
      } else {
        await CourseService.createCourse(courseData);
      }

      await fetchCourses();
      await fetchStats();
      setIsFormOpen(false);
      setEditingCourse(null);
    } catch (err: any) {
      setError(err.message || t("courses.errorSaving") || "Failed to save course");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete course
  const handleDeleteCourse = (course: Course) => {
    setDeletingCourse(course);
    setIsDeleteOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingCourse) return;

    try {
      setIsLoading(true);
      setError(null);
      await CourseService.deleteCourse(deletingCourse.id);
      await fetchCourses();
      await fetchStats();
      setIsDeleteOpen(false);
      setDeletingCourse(null);
    } catch (err: any) {
      setError(err.message || t("courses.errorDeleting") || "Failed to delete course");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view course
  const handleViewCourse = (course: Course) => {
    router.push(`/dashboard/courses/${course.id}`);
  };

  // Handle filter change
  const handleFilterChange = (key: keyof CourseFilters, value: string) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
    });
  };

  const hasActiveFilters =
    filters.search || (filters.status && filters.status !== "all");

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
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t("courses.pageTitle") || "Courses"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t("courses.pageDescription") || "Manage courses and their teachers"}
          </p>
        </div>
        <Button 
          onClick={handleAddCourse} 
          className="gradient-primary text-white hover:opacity-90 shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("courses.addCourse") || "Add Course"}
        </Button>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <StatCard
          title={t("courses.totalCourses") || "Total Courses"}
          value={stats.total}
          icon={BookOpen}
          color="primary"
          gradient
        />
        <StatCard
          title={t("courses.activeCourses") || "Active Courses"}
          value={stats.active}
          icon={BookCheck}
          color="success"
        />
        <StatCard
          title={t("courses.inactiveCourses") || "Inactive Courses"}
          value={stats.inactive}
          icon={BookX}
          color="secondary"
        />
      </motion.div>

      {/* Filters Section */}
      <motion.div variants={itemVariants}>
        <Card className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t("common.search") || "Search & Filters"}
              </h3>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400",
                    direction === "rtl" ? "right-3" : "left-3"
                  )}
                />
                <Input
                  placeholder={t("courses.searchPlaceholder") || "Search by name or category..."}
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className={cn(
                    "pl-10 pr-10",
                    direction === "rtl" && "pr-10 pl-10"
                  )}
                />
                {filters.search && (
                  <button
                    onClick={() => handleFilterChange("search", "")}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors",
                      direction === "rtl" ? "left-3" : "right-3"
                    )}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t("courses.status") || "Status"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("courses.allStatuses") || "All Statuses"}
                  </SelectItem>
                  <SelectItem value="active">
                    {t("courses.active") || "Active"}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {t("courses.inactive") || "Inactive"}
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="whitespace-nowrap"
                >
                  <X className="h-4 w-4 mr-2" />
                  {t("courses.clearFilters") || "Clear Filters"}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="font-medium">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100 h-auto p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Courses Table */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            {courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                  {t("courses.noCoursesFound") || "No courses found"}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  {filters.search || filters.status !== "all"
                    ? "Try adjusting your filters"
                    : "Get started by adding your first course"}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {t("courses.name") || "Name"}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {t("courses.category") || "Category"}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {t("courses.teachers") || "Teachers"}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {t("courses.status") || "Status"}
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {t("courses.actions") || "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {courses.map((course) => (
                    <tr 
                      key={course.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {course.name}
                        </div>
                        {course.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                            {course.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {course.category ? (
                          <Badge variant="outline" className="text-xs">
                            {course.category}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            {t("courses.na") || "N/A"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {course.teachers?.length 
                            ? t("courses.teachersCount", { count: course.teachers.length }) || `${course.teachers.length} teachers`
                            : t("courses.noTeachers") || "No teachers"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          className={
                            course.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                          }
                        >
                          {course.status === "active"
                            ? t("courses.active") || "Active"
                            : t("courses.inactive") || "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewCourse(course)}
                            className="h-8 w-8 p-0"
                            title={t("courses.view") || "View"}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCourse(course)}
                            className="h-8 w-8 p-0"
                            title={t("courses.edit") || "Edit"}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCourse(course)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            title={t("courses.delete") || "Delete"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Modals */}
      <CourseFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        course={editingCourse}
        onSave={handleSaveCourse}
        isLoading={isLoading}
      />

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("courses.deleteCourse") || "Delete Course"}
            </DialogTitle>
            <DialogDescription>
              {deletingCourse
                ? t("courses.deleteConfirmation", { name: deletingCourse.name }) || 
                  `Are you sure you want to delete ${deletingCourse.name}?`
                : t("courses.deleteConfirmation", { name: "this course" }) || 
                  "Are you sure you want to delete this course?"}
              <br />
              <span className="text-red-600 dark:text-red-400 mt-2 block">
                {t("courses.deleteWarning") || "This action cannot be undone."}
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isLoading}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isLoading}
            >
              {isLoading
                ? t("courses.deleting") || "Deleting..."
                : t("courses.delete") || "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
