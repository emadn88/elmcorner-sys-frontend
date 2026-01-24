"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinishedPackagesCards } from "@/components/packages/finished-packages-cards";
import { FinishedPackagesFilters } from "@/components/packages/finished-packages-filters";
import { PackageNotificationModal } from "@/components/packages/package-notification-modal";
import { BulkNotificationActions } from "@/components/packages/bulk-notification-actions";
import { PackageFormModal } from "@/components/packages/package-form-modal";
import { FinishedPackage, FinishedPackageFilters, NotificationItem } from "@/lib/api/types";
import { PackageService } from "@/lib/services/package.service";
import { NotificationService } from "@/lib/services/notification.service";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Bell, XCircle, CheckCircle2 } from "lucide-react";

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

export default function NotificationsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [packages, setPackages] = useState<FinishedPackage[]>([]);
  const [cancellations, setCancellations] = useState<NotificationItem[]>([]);
  const [notificationType, setNotificationType] = useState<"all" | "packages" | "class_cancellations">("all");
  const [filters, setFilters] = useState<FinishedPackageFilters>({
    search: "",
    status: "all",
    notification_status: "all",
    student_status: "all",
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isPackageFormOpen, setIsPackageFormOpen] = useState(false);
  const [notifyingPackage, setNotifyingPackage] = useState<FinishedPackage | null>(null);
  const [creatingPackageFor, setCreatingPackageFor] = useState<FinishedPackage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Fetch finished packages
  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await PackageService.getFinishedPackages({
        ...filters,
        page: currentPage,
        per_page: 15,
      });
      setPackages(response.data);
      setTotalPages(response.last_page);
    } catch (err: any) {
      setError(err.message || t("packages.noPackagesFound") || "Failed to fetch packages");
      console.error("Error fetching finished packages:", err);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  // Fetch class cancellations
  const fetchCancellations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await NotificationService.getNotifications("class_cancellations");
      setCancellations(data.filter((item) => item.type === "class_cancellation"));
    } catch (err: any) {
      setError(err.message || "Failed to fetch cancellations");
      console.error("Error fetching cancellations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    fetchPackages();
    if (notificationType === "all" || notificationType === "class_cancellations") {
      fetchCancellations();
    }
  }, [filters, currentPage, notificationType]);

  // Handle approve cancellation
  const handleApproveCancellation = async (id: number) => {
    try {
      setIsLoading(true);
      await NotificationService.approveCancellation(id);
      await fetchCancellations();
    } catch (err: any) {
      setError(err.message || "Failed to approve cancellation");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reject cancellation
  const handleRejectCancellation = async (id: number) => {
    try {
      setIsLoading(true);
      await NotificationService.rejectCancellation(id);
      await fetchCancellations();
    } catch (err: any) {
      setError(err.message || "Failed to reject cancellation");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selection
  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? packages.map((p) => p.id) : []);
  };

  // Handle send WhatsApp
  const handleSendWhatsApp = (pkg: FinishedPackage) => {
    setNotifyingPackage(pkg);
    setIsNotificationOpen(true);
  };

  // Handle confirm notification
  const handleConfirmNotification = async () => {
    if (!notifyingPackage) return;

    try {
      setIsLoading(true);
      setError(null);
      await PackageService.sendNotification(notifyingPackage.id);
      await fetchPackages();
      setIsNotificationOpen(false);
      setNotifyingPackage(null);
    } catch (err: any) {
      setError(err.message || "Failed to send notification");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bulk notifications
  const handleBulkNotifications = async () => {
    if (selectedIds.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);
      const result = await PackageService.bulkSendNotifications(selectedIds);
      await fetchPackages();
      setSelectedIds([]);
      alert(`Sent ${result.success_count} notifications, ${result.failed_count} failed`);
    } catch (err: any) {
      setError(err.message || "Failed to send bulk notifications");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view bills
  const handleViewBills = (pkg: FinishedPackage) => {
    router.push(`/dashboard/billing?student_id=${pkg.student_id}`);
  };

  // Handle create new package
  const handleCreatePackage = (pkg: FinishedPackage) => {
    setCreatingPackageFor(pkg);
    setIsPackageFormOpen(true);
  };

  // Handle save new package
  const handleSavePackage = async (packageData: any) => {
    if (!creatingPackageFor) return;

    try {
      setIsLoading(true);
      setError(null);
      await PackageService.createPackage({
        ...packageData,
        student_id: creatingPackageFor.student_id,
      });
      await fetchPackages();
      setIsPackageFormOpen(false);
      setCreatingPackageFor(null);
    } catch (err: any) {
      setError(err.message || "Failed to create package");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle download PDF
  const handleDownloadPdf = async (pkg: FinishedPackage) => {
    try {
      setIsLoading(true);
      const blob = await PackageService.downloadPackagePdf(pkg.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `package-${pkg.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Failed to download PDF");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle export
  const handleExport = () => {
    // TODO: Implement CSV/PDF export
    console.log("Export finished packages", packages.filter((p) => selectedIds.includes(p.id)));
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
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100">
            <Bell className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("notifications.pageTitle") || "Notifications"}
            </h1>
            <p className="text-gray-600 mt-1">
              {t("notifications.pageDescription") || "Manage finished packages and class cancellation requests"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Notification Type Filter */}
      <motion.div variants={itemVariants}>
        <div className="flex gap-2">
          <Button
            variant={notificationType === "all" ? "default" : "outline"}
            onClick={() => setNotificationType("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={notificationType === "packages" ? "default" : "outline"}
            onClick={() => setNotificationType("packages")}
            size="sm"
          >
            Packages
          </Button>
          <Button
            variant={notificationType === "class_cancellations" ? "default" : "outline"}
            onClick={() => setNotificationType("class_cancellations")}
            size="sm"
          >
            Class Cancellations
          </Button>
        </div>
      </motion.div>

      {/* Filters - Only show for packages */}
      {(notificationType === "all" || notificationType === "packages") && (
        <motion.div variants={itemVariants}>
          <FinishedPackagesFilters filters={filters} onFiltersChange={setFilters} />
        </motion.div>
      )}

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <motion.div variants={itemVariants}>
          <BulkNotificationActions
            selectedCount={selectedIds.length}
            onSendNotifications={handleBulkNotifications}
            onExport={handleExport}
            isLoading={isLoading}
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

      {/* Class Cancellations */}
      {(notificationType === "all" || notificationType === "class_cancellations") && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Class Cancellation Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {cancellations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No cancellation requests</p>
              ) : (
                <div className="space-y-4">
                  {cancellations.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{item.student_name}</div>
                          <div className="text-sm text-gray-600">
                            Teacher: {item.teacher_name} • Course: {item.course_name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.class_date} at {item.start_time}
                          </div>
                          <div className="text-sm mt-2">
                            <strong>Reason:</strong> {item.cancellation_reason}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectCancellation(item.class_id!)}
                            disabled={isLoading || item.status !== "pending"}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproveCancellation(item.class_id!)}
                            disabled={isLoading || item.status !== "pending"}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Packages Table or No Data */}
      {(notificationType === "all" || notificationType === "packages") && packages.length === 0 && !isLoading ? (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
        >
          <Bell className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {t("notifications.noData") || "No Finished Packages"}
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            {t("notifications.noDataDescription") || "There are no finished packages to display. Finished packages will appear here when students complete their package hours."}
          </p>
        </motion.div>
      ) : (
        (notificationType === "all" || notificationType === "packages") && (
          <motion.div variants={itemVariants}>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <FinishedPackagesCards
                packages={packages}
                selectedIds={selectedIds.map(String)}
                onSelect={(id) => handleSelect(Number(id))}
                onSelectAll={handleSelectAll}
                onSendWhatsApp={handleSendWhatsApp}
                onViewBills={handleViewBills}
                onCreatePackage={handleCreatePackage}
                onDownloadPdf={handleDownloadPdf}
              />
            )}
          </motion.div>
        )
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={itemVariants} className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            {t("common.previous") || "Previous"}
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
            {t("common.page") || "Page"} {currentPage} {t("common.of") || "of"} {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || isLoading}
          >
            {t("common.next") || "Next"}
          </Button>
        </motion.div>
      )}

      {/* Modals */}
      <PackageNotificationModal
        open={isNotificationOpen}
        onOpenChange={setIsNotificationOpen}
        package={notifyingPackage}
        onConfirm={handleConfirmNotification}
        isLoading={isLoading}
      />

      <PackageFormModal
        open={isPackageFormOpen}
        onOpenChange={setIsPackageFormOpen}
        studentId={creatingPackageFor?.student_id}
        onSave={handleSavePackage}
        isLoading={isLoading}
      />
    </motion.div>
  );
}
