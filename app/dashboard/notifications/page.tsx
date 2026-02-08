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
import { MarkPaidConfirmationModal } from "@/components/packages/mark-paid-confirmation-modal";
import { FinishedPackage, FinishedPackageFilters, NotificationItem } from "@/lib/api/types";
import { PackageService } from "@/lib/services/package.service";
import { NotificationService } from "@/lib/services/notification.service";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Bell, XCircle, CheckCircle2, FileText } from "lucide-react";
import { CancellationRequestsTable } from "@/components/notifications/cancellation-requests-table";
import { CancellationLogModal } from "@/components/notifications/cancellation-log-modal";
import { NotificationHistoryModal } from "@/components/packages/notification-history-modal";

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
    notification_status: "all", // Show all packages (sent and not sent) until marked as paid
    student_status: "all",
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isNotificationHistoryOpen, setIsNotificationHistoryOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [notifyingPackage, setNotifyingPackage] = useState<FinishedPackage | null>(null);
  const [markingPaidPackage, setMarkingPaidPackage] = useState<FinishedPackage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingNotification, setIsSendingNotification] = useState(false);
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

  // Listen for notification history modal open event
  useEffect(() => {
    const handleOpenNotificationHistory = (event: CustomEvent) => {
      setSelectedPackageId(event.detail);
      setIsNotificationHistoryOpen(true);
    };

    window.addEventListener('openNotificationHistory', handleOpenNotificationHistory as EventListener);

    return () => {
      window.removeEventListener('openNotificationHistory', handleOpenNotificationHistory as EventListener);
    };
  }, []);

  // Handle approve cancellation
  const handleApproveCancellation = async (id: number) => {
    try {
      setIsLoading(true);
      await NotificationService.approveCancellation(id);
      await fetchCancellations();
      // Trigger sidebar notification count refresh
      window.dispatchEvent(new CustomEvent('refreshNotificationCount'));
    } catch (err: any) {
      setError(err.message || "Failed to approve cancellation");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reject cancellation
  const handleRejectCancellation = async (id: number, reason: string) => {
    try {
      setIsLoading(true);
      await NotificationService.rejectCancellation(id, reason);
      await fetchCancellations();
      // Trigger sidebar notification count refresh
      window.dispatchEvent(new CustomEvent('refreshNotificationCount'));
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
      setIsSendingNotification(true);
      setError(null);
      await PackageService.sendNotification(notifyingPackage.id);
      await fetchPackages();
      setIsNotificationOpen(false);
      setNotifyingPackage(null);
    } catch (err: any) {
      setError(err.message || "Failed to send notification");
    } finally {
      setIsSendingNotification(false);
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

  // Handle mark as paid
  const handleMarkAsPaid = (pkg: FinishedPackage) => {
    setMarkingPaidPackage(pkg);
    setIsMarkPaidOpen(true);
  };

  // Confirm mark as paid
  const handleConfirmMarkAsPaid = async (reason: string) => {
    if (!markingPaidPackage) return;

    try {
      setIsLoading(true);
      setError(null);
      await PackageService.markPackageAsPaid(markingPaidPackage.id, reason);
      await fetchPackages();
      setIsMarkPaidOpen(false);
      setMarkingPaidPackage(null);
      
      // Trigger a custom event to refresh notification count in sidebar
      window.dispatchEvent(new CustomEvent('refreshNotificationCount'));
    } catch (err: any) {
      setError(err.message || "Failed to mark package as paid");
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
              <div className="flex items-center justify-between">
                <CardTitle>
                  {t("notifications.classCancellationRequests") || "Class Cancellation Requests"}
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setIsLogModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {t("notifications.viewLog") || "View Log"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CancellationRequestsTable
                cancellations={cancellations}
                onApprove={handleApproveCancellation}
                onReject={handleRejectCancellation}
                isLoading={isLoading}
              />
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
            {isLoading && packages.length === 0 ? (
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
                onMarkAsPaid={handleMarkAsPaid}
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
        isLoading={isSendingNotification}
      />

      <MarkPaidConfirmationModal
        open={isMarkPaidOpen}
        onOpenChange={setIsMarkPaidOpen}
        package={markingPaidPackage}
        onConfirm={handleConfirmMarkAsPaid}
        isLoading={isLoading}
      />

      <CancellationLogModal
        open={isLogModalOpen}
        onOpenChange={setIsLogModalOpen}
      />

      <NotificationHistoryModal
        open={isNotificationHistoryOpen}
        onOpenChange={setIsNotificationHistoryOpen}
        packageId={selectedPackageId || 0}
      />
    </motion.div>
  );
}
