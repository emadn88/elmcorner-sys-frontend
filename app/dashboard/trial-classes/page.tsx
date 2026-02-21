"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrialsFilters } from "@/components/trials/trials-filters";
import { TrialsTable } from "@/components/trials/trials-table";
import { TrialFormModal } from "@/components/trials/trial-form-modal";
import { ConvertTrialModal } from "@/components/trials/convert-trial-modal";
import { TrialDetailsModal } from "@/components/trials/trial-details-modal";
import { DeleteConfirmationModal } from "@/components/students/delete-confirmation-modal";
import { TrialClass, TrialFilters, TrialStats } from "@/lib/api/types";
import { TrialService } from "@/lib/services/trial.service";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export default function TrialClassesPage() {
  const { t, direction } = useLanguage();
  const [trials, setTrials] = useState<TrialClass[]>([]);
  const todayDate = getTodayDate();
  const [filters, setFilters] = useState<TrialFilters>({
    status: "all",
    date_from: todayDate,
    date_to: todayDate,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingTrial, setEditingTrial] = useState<TrialClass | null>(null);
  const [convertingTrial, setConvertingTrial] = useState<TrialClass | null>(null);
  const [deletingTrial, setDeletingTrial] = useState<TrialClass | null>(null);
  const [viewingTrial, setViewingTrial] = useState<TrialClass | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [stats, setStats] = useState<TrialStats>({
    total: 0,
    pending: 0,
    completed: 0,
    no_show: 0,
    converted: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Fetch trials
  const fetchTrials = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await TrialService.getTrials({
        ...filters,
        page: currentPage,
        per_page: 15,
      });
      setTrials(response.data);
      setTotalPages(response.last_page);
    } catch (err: any) {
      setError(err.message || t("trials.errorLoading") || "Failed to fetch trials");
      console.error("Error fetching trials:", err);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const statsData = await TrialService.getTrialStats();
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    fetchTrials();
    fetchStats();
  }, [filters, currentPage]);

  const handleCreate = () => {
    setEditingTrial(null);
    setIsFormOpen(true);
  };

  const handleEdit = (trial: TrialClass) => {
    setEditingTrial(trial);
    setIsFormOpen(true);
  };

  const handleConvert = (trial: TrialClass) => {
    setConvertingTrial(trial);
    setIsConvertOpen(true);
  };

  const handleDelete = (trial: TrialClass) => {
    setDeletingTrial(trial);
    setIsDeleteOpen(true);
  };

  const handleView = (trial: TrialClass) => {
    setViewingTrial(trial);
    setIsViewOpen(true);
  };

  const handleApprove = async (trial: TrialClass) => {
    try {
      await TrialService.reviewTrial(trial.id, 'approve');
      await fetchTrials();
      await fetchStats();
    } catch (err: any) {
      setError(err.message || t("trials.error.review") || "Failed to approve trial");
      console.error("Error approving trial:", err);
    }
  };

  const handleReject = async (trial: TrialClass) => {
    try {
      await TrialService.reviewTrial(trial.id, 'reject');
      await fetchTrials();
      await fetchStats();
    } catch (err: any) {
      setError(err.message || t("trials.error.review") || "Failed to reject trial");
      console.error("Error rejecting trial:", err);
    }
  };

  const handleSave = async (trialData: Partial<TrialClass> & { new_student?: Partial<any> }) => {
    try {
      if (editingTrial) {
        await TrialService.updateTrial(editingTrial.id, trialData);
      } else {
        await TrialService.createTrial(trialData);
      }
      await fetchTrials();
      await fetchStats();
      setIsFormOpen(false);
      setEditingTrial(null);
    } catch (err: any) {
      throw err;
    }
  };

  const handleConvertSubmit = async (
    packageData: any,
    timetableData: any
  ) => {
    if (!convertingTrial) return;
    try {
      await TrialService.convertTrial(convertingTrial.id, packageData, timetableData);
      await fetchTrials();
      await fetchStats();
      setIsConvertOpen(false);
      setConvertingTrial(null);
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTrial) return;
    try {
      await TrialService.deleteTrial(deletingTrial.id);
      await fetchTrials();
      await fetchStats();
      setIsDeleteOpen(false);
      setDeletingTrial(null);
    } catch (err: any) {
      console.error("Error deleting trial:", err);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-6 ${direction === "rtl" ? "text-right" : "text-left"}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("sidebar.trialClasses") || "Trial Classes"}
            </h1>
            <p className="text-gray-600 mt-2">
              {t("trials.description") || "Manage trial classes and convert them to regular packages"}
            </p>
          </div>
          {filters.date_from === todayDate && filters.date_to === todayDate && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-medium text-blue-900">
                {t("trials.todayTrials") || "Today's Trials"}:
              </span>
              <span className="text-2xl font-bold text-blue-600">{trials.length}</span>
            </div>
          )}
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t("trials.create") || "Create Trial"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("trials.stats.total") || "Total"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("trials.status.pending") || "Pending"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("trials.status.completed") || "Completed"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("trials.status.noShow") || "No Show"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.no_show}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("trials.status.converted") || "Converted"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.converted}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("trials.filters.title") || "Filters"}</CardTitle>
        </CardHeader>
        <CardContent>
          <TrialsFilters filters={filters} onFiltersChange={setFilters} />
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Trials Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("trials.list") || "Trial Classes"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <TrialsTable
                trials={trials}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onConvert={handleConvert}
                onApprove={handleApprove}
                onReject={handleReject}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={`flex items-center justify-between mt-4 ${direction === "rtl" ? "flex-row-reverse" : ""}`}>
                  <div className="text-sm text-gray-600">
                    {t("common.page") || "Page"} {currentPage} {t("common.of") || "of"} {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      {t("common.previous") || "Previous"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      {t("common.next") || "Next"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <TrialFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        trial={editingTrial}
        onSave={handleSave}
      />

      <TrialDetailsModal
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        trial={viewingTrial}
      />

      {convertingTrial && (
        <ConvertTrialModal
          open={isConvertOpen}
          onOpenChange={setIsConvertOpen}
          trial={convertingTrial}
          onConvert={handleConvertSubmit}
        />
      )}

      {deletingTrial && (
        <DeleteConfirmationModal
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={handleDeleteConfirm}
          studentName={deletingTrial.student?.full_name || `Trial #${deletingTrial.id}`}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
