"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Users, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { Teacher, TeacherFilters, TeacherStats } from "@/types/teachers";
import { TeacherService } from "@/lib/services/teacher.service";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TeacherFormModal } from "@/components/teachers/teacher-form-modal";
import { TeachersTable } from "@/components/teachers/teachers-table";
import { TeachersFilters } from "@/components/teachers/teachers-filters";
import { TeacherDetailsModal } from "@/components/teachers/teacher-details-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

export default function TeachersPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filters, setFilters] = useState<TeacherFilters>({
    search: "",
    status: "all",
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [detailsTeacher, setDetailsTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [stats, setStats] = useState<TeacherStats>({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await TeacherService.getTeachers({
        ...filters,
        page: currentPage,
        per_page: 15,
      });
      setTeachers(response.data);
      setTotalPages(response.last_page);
    } catch (err: any) {
      setError(err.message || "Failed to fetch teachers");
      console.error("Error fetching teachers:", err);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const statsData = await TeacherService.getTeacherStats();
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    fetchTeachers();
    fetchStats();
  }, [filters, currentPage]);

  // Handle selection
  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? teachers.map((t) => t.id) : []);
  };

  // Handle add teacher
  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setIsFormOpen(true);
  };

  // Handle edit teacher
  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setIsFormOpen(true);
  };

  // Handle save teacher
  const handleSaveTeacher = async (teacherData: Partial<Teacher>) => {
    try {
      setIsLoading(true);
      setError(null);

      if (editingTeacher) {
        await TeacherService.updateTeacher(editingTeacher.id, teacherData);
      } else {
        await TeacherService.createTeacher(teacherData);
      }

      await fetchTeachers();
      await fetchStats();
      setIsFormOpen(false);
      setEditingTeacher(null);
    } catch (err: any) {
      setError(err.message || "Failed to save teacher");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete teacher
  const handleDeleteTeacher = (teacher: Teacher) => {
    setDeletingTeacher(teacher);
    setIsDeleteOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingTeacher) return;

    try {
      setIsLoading(true);
      setError(null);
      await TeacherService.deleteTeacher(deletingTeacher.id);
      await fetchTeachers();
      await fetchStats();
      setSelectedIds((prev) => prev.filter((id) => id !== deletingTeacher.id));
      setIsDeleteOpen(false);
      setDeletingTeacher(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete teacher");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view teacher
  const handleViewTeacher = (teacher: Teacher) => {
    router.push(`/dashboard/teachers/${teacher.id}`);
  };

  // Handle view performance
  const handleViewPerformance = (teacher: Teacher) => {
    router.push(`/dashboard/teachers/${teacher.id}?tab=performance`);
  };

  // Handle view details
  const handleViewDetails = (teacher: Teacher) => {
    setDetailsTeacher(teacher);
    setIsDetailsOpen(true);
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
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("teachers.pageTitle") || "Teachers"}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("teachers.pageDescription") || "Manage teachers and their courses"}
          </p>
        </div>
        <Button onClick={handleAddTeacher} className="gradient-primary text-white hover:opacity-90 shadow-vuxy">
          <Plus className="h-4 w-4 mr-2" />
          {t("teachers.addTeacher") || "Add Teacher"}
        </Button>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <StatCard
          title={t("teachers.totalTeachers") || "Total Teachers"}
          value={stats.total}
          icon={Users}
          color="primary"
          gradient
        />
        <StatCard
          title={t("teachers.activeTeachers") || "Active"}
          value={stats.active}
          icon={UserCheck}
          color="success"
        />
        <StatCard
          title={t("teachers.inactiveTeachers") || "Inactive"}
          value={stats.inactive}
          icon={UserX}
          color="secondary"
        />
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <TeachersFilters filters={filters} onFiltersChange={setFilters} />
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="font-medium">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="text-red-800 hover:text-red-900"
            >
              ×
            </Button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <motion.div variants={itemVariants}>
        <TeachersTable
          teachers={teachers}
          selectedIds={selectedIds.map(String)}
          onSelect={(id) => handleSelect(Number(id))}
          onSelectAll={handleSelectAll}
          onEdit={handleEditTeacher}
          onDelete={handleDeleteTeacher}
          onView={handleViewTeacher}
          onViewPerformance={handleViewPerformance}
          onViewDetails={handleViewDetails}
        />
      </motion.div>

      {/* Modals */}
      <TeacherFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        teacher={editingTeacher}
        onSave={handleSaveTeacher}
        isLoading={isLoading}
      />

      <TeacherDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        teacher={detailsTeacher}
      />

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Teacher</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deletingTeacher?.user?.name || "this teacher"}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
