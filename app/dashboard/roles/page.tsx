"use client";

import { useState, useEffect } from "react";
import { Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoleTable } from "@/components/roles/role-table";
import { RoleForm } from "@/components/roles/role-form";
import { PermissionSelector } from "@/components/roles/permission-selector";
import {
  RoleWithPermissions,
  CreateRoleData,
  UpdateRoleData,
} from "@/lib/api/types";
import { RoleService } from "@/lib/services/role.service";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useLanguage } from "@/contexts/language-context";

export default function RolesPage() {
  const { t } = useLanguage();
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithPermissions | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleWithPermissions | null>(null);
  const [configuringRole, setConfiguringRole] = useState<RoleWithPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const rolesData = await RoleService.getRoles();
      setRoles(rolesData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch roles");
      console.error("Error fetching roles:", err);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    setIsFormOpen(true);
  };

  const handleEdit = (role: RoleWithPermissions) => {
    setEditingRole(role);
    setIsFormOpen(true);
  };

  const handleDelete = (role: RoleWithPermissions) => {
    setDeletingRole(role);
    setIsDeleteOpen(true);
  };

  const handleConfigurePermissions = (role: RoleWithPermissions) => {
    setConfiguringRole(role);
    setIsPermissionsOpen(true);
  };

  const handleSave = async (data: CreateRoleData | UpdateRoleData) => {
    try {
      if (editingRole) {
        await RoleService.updateRole(editingRole.id, data as UpdateRoleData);
      } else {
        await RoleService.createRole(data as CreateRoleData);
      }
      fetchRoles();
      setIsFormOpen(false);
      setEditingRole(null);
    } catch (err: any) {
      throw err;
    }
  };

  const handleSavePermissions = async (permissions: string[]) => {
    if (!configuringRole) return;

    try {
      await RoleService.syncPermissions(configuringRole.id, { permissions });
      fetchRoles();
      setIsPermissionsOpen(false);
      setConfiguringRole(null);
    } catch (err: any) {
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRole) return;

    try {
      await RoleService.deleteRole(deletingRole.id);
      fetchRoles();
      setIsDeleteOpen(false);
      setDeletingRole(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete role");
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
    <ProtectedRoute requiredPermission="manage_roles">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("roles.pageTitle")}</h1>
            <p className="text-gray-600 mt-1">
              {t("roles.pageDescription")}
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            {t("roles.createRole")}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Roles Table */}
        <RoleTable
          roles={roles}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onConfigurePermissions={handleConfigurePermissions}
          isLoading={isLoading}
        />

        {/* Role Form Modal */}
        <RoleForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          role={editingRole}
          onSave={handleSave}
        />

        {/* Permissions Configuration Modal */}
        <Dialog
          open={isPermissionsOpen}
          onOpenChange={setIsPermissionsOpen}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {t("roles.configurePermissionsFor", { name: configuringRole?.name })}
              </DialogTitle>
              <DialogDescription>
                {t("roles.configurePermissionsDescription")}
              </DialogDescription>
            </DialogHeader>
            {configuringRole && (
              <PermissionSelector
                roleId={configuringRole.id}
                currentPermissions={configuringRole.permissions}
                onSave={handleSavePermissions}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("roles.deleteRole")}</DialogTitle>
              <DialogDescription>
                {t("roles.deleteConfirmation", { name: deletingRole?.name })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                {t("roles.cancel")}
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                {t("roles.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
