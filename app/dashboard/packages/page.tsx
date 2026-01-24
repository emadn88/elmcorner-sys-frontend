"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Package as PackageIcon, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PackagesTable } from "@/components/packages/packages-table";
import { PackagesFilters } from "@/components/packages/packages-filters";
import { PackageFormModal } from "@/components/packages/package-form-modal";
import { PackageClassesModal } from "@/components/packages/package-classes-modal";
import { DeleteConfirmationModal } from "@/components/students/delete-confirmation-modal";
import { StatCard } from "@/components/dashboard/stat-card";
import { Package, PackageFilters as ApiPackageFilters } from "@/lib/api/types";
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

export default function PackagesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [filters, setFilters] = useState<ApiPackageFilters>({
    search: "",
    status: "all",
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isClassesModalOpen, setIsClassesModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);
  const [viewingClassesPackage, setViewingClassesPackage] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    finished: 0,
  });

  // Fetch packages
  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await PackageService.getPackages({
        ...filters,
        page: currentPage,
        per_page: 15,
      });
      setPackages(response.data);
      setTotalPages(response.last_page);

      // Calculate stats from all packages (fetch without pagination for stats)
      if (currentPage === 1) {
        const allPackagesResponse = await PackageService.getPackages({
          ...filters,
          status: "all",
          per_page: 1000, // Get all for stats
        });
        const allPackages = allPackagesResponse.data;
        setStats({
          total: allPackagesResponse.total || allPackages.length,
          active: allPackages.filter((p: Package) => p.status === "active").length,
          finished: allPackages.filter((p: Package) => p.status === "finished").length,
        });
      }
    } catch (err: any) {
      setError(err.message || t("packages.noPackagesFound") || "Failed to fetch packages");
      console.error("Error fetching packages:", err);
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

  // Handle add package
  const handleAddPackage = () => {
    setEditingPackage(null);
    setIsFormOpen(true);
  };

  // Handle edit package
  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
    setIsFormOpen(true);
  };

  // Handle save package
  const handleSavePackage = async (packageData: any) => {
    try {
      setIsLoading(true);
      setError(null);

      if (editingPackage) {
        await PackageService.updatePackage(editingPackage.id, packageData);
      } else {
        await PackageService.createPackage(packageData);
      }

      // Refresh data
      await fetchPackages();
      setIsFormOpen(false);
      setEditingPackage(null);
    } catch (err: any) {
      setError(err.message || "Failed to save package");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete package
  const handleDeletePackage = (pkg: Package) => {
    setDeletingPackage(pkg);
    setIsDeleteOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingPackage) return;

    try {
      setIsLoading(true);
      setError(null);
      await PackageService.deletePackage(deletingPackage.id);
      await fetchPackages();
      setSelectedIds((prev) => prev.filter((id) => id !== deletingPackage.id));
      setIsDeleteOpen(false);
      setDeletingPackage(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete package");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reactivate package (single)
  const handleReactivatePackage = async (pkg: Package) => {
    try {
      setIsLoading(true);
      setError(null);
      await PackageService.reactivatePackage(pkg.id);
      await fetchPackages();
      setSelectedIds((prev) => prev.filter((id) => id !== pkg.id));
    } catch (err: any) {
      setError(err.message || "Failed to reactivate package");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bulk reactivate
  const handleBulkReactivate = async () => {
    const finishedPackages = packages.filter(
      (p) => selectedIds.includes(p.id) && p.status === "finished"
    );

    if (finishedPackages.length === 0) {
      setError("No finished packages selected");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      let successCount = 0;
      let failCount = 0;

      for (const pkg of finishedPackages) {
        try {
          await PackageService.reactivatePackage(pkg.id);
          successCount++;
        } catch (err: any) {
          failCount++;
          console.error(`Failed to reactivate package ${pkg.id}:`, err);
        }
      }

      await fetchPackages();
      setSelectedIds([]);
      
      if (failCount > 0) {
        setError(`Reactivated ${successCount} packages, ${failCount} failed`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to reactivate packages");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view classes
  const handleViewClasses = (pkg: Package) => {
    setViewingClassesPackage(pkg);
    setIsClassesModalOpen(true);
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
            {t("packages.pageTitle")}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("packages.pageDescription")}
          </p>
        </div>
        <Button onClick={handleAddPackage} className="gradient-primary text-white hover:opacity-90 shadow-vuxy">
          <Plus className="h-4 w-4 mr-2" />
          {t("packages.addPackage")}
        </Button>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <StatCard
          title={t("packages.totalPackages") || "Total Packages"}
          value={stats.total}
          icon={PackageIcon}
          color="primary"
          gradient
        />
        <StatCard
          title={t("packages.activePackages") || "Active Packages"}
          value={stats.active}
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title={t("packages.finishedPackages") || "Finished Packages"}
          value={stats.finished}
          icon={XCircle}
          color="secondary"
        />
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <PackagesFilters filters={filters} onFiltersChange={setFilters} />
      </motion.div>

      {/* Bulk Actions for Finished Packages */}
      {selectedIds.length > 0 && (
        <motion.div variants={itemVariants} className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg border">
          <span className="text-sm font-medium text-gray-700">
            {t("packages.selectedCount", { count: selectedIds.length }) || `${selectedIds.length} selected`}
          </span>
          {packages
            .filter((p) => selectedIds.includes(p.id) && p.status === "finished")
            .length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkReactivate}
              disabled={isLoading}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t("packages.reactivateSelected") || "Reactivate Selected"}
            </Button>
          )}
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
        <PackagesTable
          packages={packages}
          selectedIds={selectedIds.map(String)}
          onSelect={(id) => handleSelect(Number(id))}
          onSelectAll={handleSelectAll}
          onEdit={handleEditPackage}
          onDelete={handleDeletePackage}
          onViewClasses={handleViewClasses}
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
      <PackageFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        package={editingPackage}
        onSave={handleSavePackage}
        isLoading={isLoading}
      />

      <DeleteConfirmationModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        studentName={deletingPackage?.student?.full_name || `Package #${deletingPackage?.id}`}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />

      <PackageClassesModal
        open={isClassesModalOpen}
        onOpenChange={setIsClassesModalOpen}
        package={viewingClassesPackage}
      />
    </motion.div>
  );
}
