"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Users, UserCheck, TrendingUp, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { StudentsFilters } from "@/components/students/students-filters";
import { StudentsTable } from "@/components/students/students-table";
import { BulkActions } from "@/components/students/bulk-actions";
import { StudentFormModal } from "@/components/students/student-form-modal";
import { DeleteConfirmationModal } from "@/components/students/delete-confirmation-modal";
import { Student, StudentFilters as ApiStudentFilters, StudentStats } from "@/lib/api/types";
import { StudentService } from "@/lib/services/student.service";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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

export default function StudentsPage() {
  const { t, direction } = useLanguage();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filters, setFilters] = useState<ApiStudentFilters>({
    search: "",
    status: "all",
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [stats, setStats] = useState<StudentStats>({
    total: 0,
    active: 0,
    paused: 0,
    stopped: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Fetch students
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await StudentService.getStudents({
        ...filters,
        page: currentPage,
        per_page: 15,
      });
      setStudents(response.data);
      setTotalPages(response.last_page);
    } catch (err: any) {
      // Check if it's a permission error
      if (err.message?.includes("permission") || err.message?.includes("You do not have permission")) {
        setError(t("students.noPermission") + ". " + t("students.contactAdmin"));
      } else {
        setError(err.message || t("students.errorLoading") || "Failed to fetch students");
      }
      console.error("Error fetching students:", err);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const statsData = await StudentService.getStudentStats();
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, [filters, currentPage]);

  // Handle selection
  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? students.map((s) => s.id) : []);
  };

  // Handle add student
  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  // Handle edit student
  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  // Handle save student
  const handleSaveStudent = async (studentData: Partial<Student>) => {
    try {
      setIsLoading(true);
      setError(null);

      if (editingStudent) {
        await StudentService.updateStudent(editingStudent.id, studentData);
      } else {
        await StudentService.createStudent(studentData);
      }

      // Refresh data
      await fetchStudents();
      await fetchStats();
      setIsFormOpen(false);
      setEditingStudent(null);
    } catch (err: any) {
      setError(err.message || "Failed to save student");
      throw err; // Re-throw to let form handle it
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete student
  const handleDeleteStudent = (student: Student) => {
    setDeletingStudent(student);
    setIsDeleteOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;

    try {
      setIsLoading(true);
      setError(null);
      await StudentService.deleteStudent(deletingStudent.id);
      await fetchStudents();
      await fetchStats();
      setSelectedIds((prev) => prev.filter((id) => id !== deletingStudent.id));
      setIsDeleteOpen(false);
      setDeletingStudent(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete student");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await Promise.all(selectedIds.map((id) => StudentService.deleteStudent(id)));
      await fetchStudents();
      await fetchStats();
      setSelectedIds([]);
    } catch (err: any) {
      setError(err.message || "Failed to delete students");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bulk export
  const handleBulkExport = () => {
    const selectedStudents = students.filter((s) =>
      selectedIds.includes(s.id)
    );
    console.log("Exporting students:", selectedStudents);
    // Implement export logic here
  };

  // Handle bulk status change
  const handleBulkStatusChange = async (status: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await Promise.all(
        selectedIds.map((id) =>
          StudentService.updateStudent(id, { status: status as Student["status"] })
        )
      );
      await fetchStudents();
      await fetchStats();
      setSelectedIds([]);
    } catch (err: any) {
      setError(err.message || "Failed to update student status");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view student
  const handleViewStudent = (student: Student) => {
    router.push(`/dashboard/students/${student.id}`);
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
            {t("students.pageTitle")}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("students.pageDescription")}
          </p>
        </div>
        <Button onClick={handleAddStudent} className="gradient-primary text-white hover:opacity-90 shadow-vuxy">
          <Plus className={cn("h-4 w-4", direction === "rtl" ? "ml-2" : "mr-2")} />
          {t("students.addStudent")}
        </Button>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title={t("students.totalStudents")}
          value={stats.total}
          icon={Users}
          color="primary"
          gradient
        />
        <StatCard
          title={t("students.activeStudents")}
          value={stats.active}
          icon={UserCheck}
          color="success"
        />
        <StatCard
          title={t("students.pausedStudents")}
          value={stats.paused}
          icon={TrendingUp}
          color="accent"
        />
        <StatCard
          title={t("students.stoppedStudents")}
          value={stats.stopped}
          icon={GraduationCap}
          color="secondary"
        />
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <StudentsFilters filters={filters} onFiltersChange={setFilters} />
      </motion.div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <motion.div variants={itemVariants}>
          <BulkActions
            selectedCount={selectedIds.length}
            onDelete={handleBulkDelete}
            onExport={handleBulkExport}
            onStatusChange={handleBulkStatusChange}
          />
        </motion.div>
      )}

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
        <StudentsTable
          students={students}
          selectedIds={selectedIds.map(String)}
          onSelect={(id) => handleSelect(Number(id))}
          onSelectAll={handleSelectAll}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
          onView={handleViewStudent}
        />
      </motion.div>

      {/* Modals */}
      <StudentFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        student={editingStudent}
        onSave={handleSaveStudent}
        isLoading={isLoading}
      />

      <DeleteConfirmationModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        studentName={deletingStudent?.full_name || ""}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </motion.div>
  );
}



