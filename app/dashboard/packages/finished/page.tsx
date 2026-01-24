"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FinishedPackagesTable } from "@/components/packages/finished-packages-table";
import { FinishedPackagesFilters } from "@/components/packages/finished-packages-filters";
import { PackageNotificationModal } from "@/components/packages/package-notification-modal";
import { BulkNotificationActions } from "@/components/packages/bulk-notification-actions";
import { PackageFormModal } from "@/components/packages/package-form-modal";
import { FinishedPackage, FinishedPackageFilters } from "@/lib/api/types";
import { PackageService } from "@/lib/services/package.service";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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

export default function FinishedPackagesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [packages, setPackages] = useState<FinishedPackage[]>([]);
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

  // Load data on mount and when filters change
  useEffect(() => {
    fetchPackages();
  }, [filters, currentPage]);

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("packages.finishedPackages")}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("packages.finishedPackagesDescription")}
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <FinishedPackagesFilters filters={filters} onFiltersChange={setFilters} />
      </motion.div>

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

      {/* Table */}
      <motion.div variants={itemVariants}>
        <FinishedPackagesTable
          packages={packages}
          selectedIds={selectedIds.map(String)}
          onSelect={(id) => handleSelect(Number(id))}
          onSelectAll={handleSelectAll}
          onSendWhatsApp={handleSendWhatsApp}
          onViewBills={handleViewBills}
          onCreatePackage={handleCreatePackage}
          onDownloadPdf={handleDownloadPdf}
        />
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={itemVariants} className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || isLoading}
          >
            Next
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
