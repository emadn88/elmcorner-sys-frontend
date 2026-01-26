"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { UserTable } from "@/components/users/user-table";
import { UserForm } from "@/components/users/user-form";
import {
  UserManagement,
  UserFilters,
  CreateUserData,
  UpdateUserData,
  Role,
} from "@/lib/api/types";
import { UserService } from "@/lib/services/user.service";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function UsersPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    role: "all",
    status: "all",
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserManagement | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserManagement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Load roles
  useEffect(() => {
    loadRoles();
  }, []);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, [filters, currentPage]);

  const loadRoles = async () => {
    try {
      const response = await apiClient.get<{ roles: Role[] }>(API_ENDPOINTS.AUTH.ROLES);
      if (response.status === "success" && response.data) {
        // Handle both response formats
        const rolesData = (response.data as any).roles || response.data;
        setRoles(Array.isArray(rolesData) ? rolesData : []);
      }
    } catch (err) {
      console.error("Error loading roles:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await UserService.getUsers({
        ...filters,
        page: currentPage,
        per_page: 15,
      });
      setUsers(response.data);
      setTotalPages(response.last_page);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: UserManagement) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = (user: UserManagement) => {
    setDeletingUser(user);
    setIsDeleteOpen(true);
  };

  const handleToggleStatus = async (user: UserManagement) => {
    try {
      const newStatus = user.status === "active" ? "inactive" : "active";
      await UserService.updateUserStatus(user.id, newStatus);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to update user status");
    }
  };

  const handleSave = async (data: CreateUserData | UpdateUserData) => {
    try {
      if (editingUser) {
        await UserService.updateUser(editingUser.id, data as UpdateUserData);
      } else {
        await UserService.createUser(data as CreateUserData);
      }
      fetchUsers();
      setIsFormOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    try {
      await UserService.deleteUser(deletingUser.id);
      fetchUsers();
      setIsDeleteOpen(false);
      setDeletingUser(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
      setIsDeleteOpen(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ProtectedRoute requiredPermission="manage_users">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("users.pageTitle")}</h1>
            <p className="text-gray-600 mt-1">{t("users.pageDescription")}</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            {t("users.createUser")}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder={t("users.searchPlaceholder")}
            value={filters.search || ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="max-w-sm"
          />
          <Select
            value={filters.role || "all"}
            onValueChange={(value) => setFilters({ ...filters, role: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("users.allRoles")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("users.allRoles")}</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.name}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => setFilters({ ...filters, status: value as any })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("users.allStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("users.allStatus")}</SelectItem>
              <SelectItem value="active">{t("users.active")}</SelectItem>
              <SelectItem value="inactive">{t("users.inactive")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <UserTable
          users={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* User Form Modal */}
        <UserForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          user={editingUser}
          onSave={handleSave}
        />

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("users.deleteUser")}</DialogTitle>
              <DialogDescription>
                {t("users.deleteConfirmation", { name: deletingUser?.name })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                {t("users.cancel")}
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                {t("users.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
