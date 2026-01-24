"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, Users, AlertCircle, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { StudentActivityFiltersComponent } from "@/components/student-activity/student-activity-filters";
import { StudentActivityTable } from "@/components/student-activity/student-activity-table";
import { ReactivationModal } from "@/components/student-activity/reactivation-modal";
import { ActivityService } from "@/lib/services/activity.service";
import { StudentActivity, StudentActivityFilters } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import { StudentService } from "@/lib/services/student.service";

export default function StudentActivityPage() {
  const { t, direction } = useLanguage();
  const router = useRouter();
  const [students, setStudents] = useState<StudentActivity[]>([]);
  const [filters, setFilters] = useState<StudentActivityFilters>({
    activity_level: "all",
    per_page: 15,
    page: 1,
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [reactivationStudent, setReactivationStudent] = useState<StudentActivity | null>(null);
  const [isReactivationOpen, setIsReactivationOpen] = useState(false);
  const [isSendingReactivation, setIsSendingReactivation] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    highly_active: 0,
    medium: 0,
    low: 0,
    stopped: 0,
    inactive: 0,
  });

  // Fetch students with activity levels
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ActivityService.getStudentActivities({
        ...filters,
        page: currentPage,
      });
      setStudents(response.data);
      setTotalPages(response.last_page);
      setTotal(response.total);

      // Calculate statistics
      const highlyActive = response.data.filter((s) => s.activity_level === "highly_active").length;
      const medium = response.data.filter((s) => s.activity_level === "medium").length;
      const low = response.data.filter((s) => s.activity_level === "low").length;
      const stopped = response.data.filter((s) => s.activity_level === "stopped").length;
      const inactive = low + stopped;

      setStats({
        highly_active: highlyActive,
        medium,
        low,
        stopped,
        inactive,
      });
    } catch (err: any) {
      setError(err.message || t("studentActivity.errorLoading") || "Failed to fetch student activities");
      console.error("Error fetching student activities:", err);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  // Load data when filters or page changes
  useEffect(() => {
    fetchStudents();
  }, [filters, currentPage]);

  const handleFiltersChange = (newFilters: StudentActivityFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? students.map((s) => s.id) : []);
  };

  const handleView = (student: StudentActivity) => {
    router.push(`/dashboard/students/${student.id}`);
  };

  const handleReactivate = (student: StudentActivity) => {
    setReactivationStudent(student);
    setIsReactivationOpen(true);
  };

  const handleSendReactivation = async (message?: string) => {
    if (!reactivationStudent) return;

    try {
      setIsSendingReactivation(true);
      await ActivityService.sendReactivationOffer(reactivationStudent.id, message);
      await fetchStudents(); // Refresh data
    } catch (err: any) {
      setError(err.message || t("studentActivity.errorSending") || "Failed to send reactivation offer");
    } finally {
      setIsSendingReactivation(false);
    }
  };

  const handleBulkReactivate = async () => {
    if (selectedIds.length === 0) return;

    try {
      setIsSendingReactivation(true);
      for (const id of selectedIds) {
        try {
          await ActivityService.sendReactivationOffer(id);
        } catch (err) {
          console.error(`Failed to send reactivation to student ${id}:`, err);
        }
      }
      setSelectedIds([]);
      await fetchStudents();
    } catch (err: any) {
      setError(err.message || t("studentActivity.errorBulkSending") || "Failed to send some reactivation offers");
    } finally {
      setIsSendingReactivation(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", direction === "rtl" ? "text-right" : "text-left")}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("studentActivity.pageTitle") || "Student Activity & Engagement"}
        </h1>
        <p className="text-gray-600 mt-2">
          {t("studentActivity.pageDescription") || 
            "Track student engagement levels and manage reactivation campaigns"}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title={t("studentActivity.highlyActive") || "Highly Active"}
          value={stats.highly_active}
          icon={Activity}
          className="border-green-200 bg-green-50"
        />
        <StatCard
          title={t("studentActivity.medium") || "Medium"}
          value={stats.medium}
          icon={Activity}
          className="border-yellow-200 bg-yellow-50"
        />
        <StatCard
          title={t("studentActivity.low") || "Low"}
          value={stats.low}
          icon={TrendingDown}
          className="border-orange-200 bg-orange-50"
        />
        <StatCard
          title={t("studentActivity.stopped") || "Stopped"}
          value={stats.stopped}
          icon={AlertCircle}
          className="border-red-200 bg-red-50"
        />
        <StatCard
          title={t("studentActivity.inactive") || "Inactive"}
          value={stats.inactive}
          icon={Users}
          className="border-gray-200 bg-gray-50"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("studentActivity.filters") || "Filters"}</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentActivityFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className={cn("flex items-center justify-between", direction === "rtl" && "flex-row-reverse")}>
              <p className="text-sm text-gray-600">
                {t("studentActivity.selectedCount", { count: selectedIds.length }) || 
                  `${selectedIds.length} students selected`}
              </p>
              <Button
                onClick={handleBulkReactivate}
                disabled={isSendingReactivation}
                variant="default"
              >
                {isSendingReactivation
                  ? t("studentActivity.sending") || "Sending..."
                  : t("studentActivity.bulkReactivate") || `Send Reactivation to ${selectedIds.length} Students`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t("studentActivity.students") || "Students"}
            {total > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({total} {t("studentActivity.total") || "total"})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <StudentActivityTable
                students={students}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
                onView={handleView}
                onReactivate={handleReactivate}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  className={cn(
                    "flex items-center justify-between mt-6 pt-6 border-t",
                    direction === "rtl" && "flex-row-reverse"
                  )}
                >
                  <div className="text-sm text-gray-600">
                    {t("studentActivity.showing") || "Showing"} {students.length}{" "}
                    {t("studentActivity.of") || "of"} {total} {t("studentActivity.students") || "students"}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      {t("studentActivity.previous") || "Previous"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      {t("studentActivity.next") || "Next"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Reactivation Modal */}
      <ReactivationModal
        open={isReactivationOpen}
        onOpenChange={setIsReactivationOpen}
        student={reactivationStudent}
        onConfirm={handleSendReactivation}
        isLoading={isSendingReactivation}
      />
    </div>
  );
}
