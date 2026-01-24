"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Users, UserCheck, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { FamiliesFilters, FamilyFilters } from "@/components/families/families-filters";
import { FamiliesTable } from "@/components/families/families-table";
import { BulkActions } from "@/components/families/bulk-actions";
import { FamilyFormModal } from "@/components/families/family-form-modal";
import { DeleteConfirmationModal } from "@/components/families/delete-confirmation-modal";
import { Family, PaginatedResponse } from "@/lib/api/types";
import { FamilyService } from "@/lib/services/family.service";
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

export default function FamiliesPage() {
  const { t } = useLanguage();
  const [families, setFamilies] = useState<Family[]>([]);
  const [filters, setFilters] = useState<FamilyFilters>({
    search: "",
    status: "all",
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const [deletingFamily, setDeletingFamily] = useState<Family | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Fetch families
  const fetchFamilies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: PaginatedResponse<Family> = await FamilyService.getFamilies({
        ...filters,
        per_page: 15,
      });
      setFamilies(response.data);
      setTotalPages(response.last_page);
      
      // Calculate stats from all data (we need to fetch all for accurate stats)
      // For now, calculate from current page data
      const total = response.total;
      const active = response.data.filter((f) => f.status === "active").length;
      const inactive = response.data.filter((f) => f.status === "inactive").length;
      setStats({ total, active, inactive });
    } catch (err: any) {
      setError(err.message || "Failed to fetch families");
      console.error("Error fetching families:", err);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    fetchFamilies();
  }, [filters, currentPage]);

  // Handle selection
  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? families.map((f) => f.id) : []);
  };

  // Handle add family
  const handleAddFamily = () => {
    setEditingFamily(null);
    setIsFormOpen(true);
  };

  // Handle edit family
  const handleEditFamily = (family: Family) => {
    setEditingFamily(family);
    setIsFormOpen(true);
  };

  // Handle save family
  const handleSaveFamily = async (familyData: Partial<Family>) => {
    try {
      setIsLoading(true);
      setError(null);

      if (editingFamily) {
        await FamilyService.updateFamily(editingFamily.id, familyData);
      } else {
        await FamilyService.createFamily(familyData);
      }

      // Refresh data
      await fetchFamilies();
      setIsFormOpen(false);
      setEditingFamily(null);
    } catch (err: any) {
      setError(err.message || "Failed to save family");
      throw err; // Re-throw to let form handle it
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete family
  const handleDeleteFamily = (family: Family) => {
    setDeletingFamily(family);
    setIsDeleteOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingFamily) return;

    try {
      setIsLoading(true);
      setError(null);
      await FamilyService.deleteFamily(deletingFamily.id);
      await fetchFamilies();
      setSelectedIds((prev) => prev.filter((id) => id !== deletingFamily.id));
      setIsDeleteOpen(false);
      setDeletingFamily(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete family");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await Promise.all(selectedIds.map((id) => FamilyService.deleteFamily(id)));
      await fetchFamilies();
      setSelectedIds([]);
    } catch (err: any) {
      setError(err.message || "Failed to delete families");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bulk export
  const handleBulkExport = () => {
    const selectedFamilies = families.filter((f) =>
      selectedIds.includes(f.id)
    );
    console.log("Exporting families:", selectedFamilies);
    // Implement export logic here
  };

  // Handle bulk status change
  const handleBulkStatusChange = async (status: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await Promise.all(
        selectedIds.map((id) =>
          FamilyService.updateFamily(id, { status: status as Family["status"] })
        )
      );
      await fetchFamilies();
      setSelectedIds([]);
    } catch (err: any) {
      setError(err.message || "Failed to update family status");
    } finally {
      setIsLoading(false);
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
            {t("sidebar.families")}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("families.pageDescription") || "Manage and view all families in the system"}
          </p>
        </div>
        <Button onClick={handleAddFamily} className="gradient-primary text-white hover:opacity-90 shadow-vuxy">
          <Plus className="h-4 w-4 mr-2" />
          {t("families.addFamily") || "Add Family"}
        </Button>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <StatCard
          title={t("families.totalFamilies") || "Total Families"}
          value={stats.total}
          icon={Users}
          color="primary"
          gradient
        />
        <StatCard
          title={t("families.activeFamilies") || "Active Families"}
          value={stats.active}
          icon={UserCheck}
          color="success"
        />
        <StatCard
          title={t("families.inactiveFamilies") || "Inactive Families"}
          value={stats.inactive}
          icon={Building2}
          color="secondary"
        />
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <FamiliesFilters filters={filters} onFiltersChange={setFilters} />
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
        <FamiliesTable
          families={families}
          selectedIds={selectedIds.map(String)}
          onSelect={(id) => handleSelect(Number(id))}
          onSelectAll={handleSelectAll}
          onEdit={handleEditFamily}
          onDelete={handleDeleteFamily}
        />
      </motion.div>

      {/* Modals */}
      <FamilyFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        family={editingFamily}
        onSave={handleSaveFamily}
        isLoading={isLoading}
      />

      <DeleteConfirmationModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        familyName={deletingFamily?.name || ""}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </motion.div>
  );
}
