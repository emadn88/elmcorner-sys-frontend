"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  GroupedPermissions,
  PagePermissionMapping,
  PermissionsResponse,
} from "@/lib/api/types";
import { RoleService } from "@/lib/services/role.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/language-context";

interface PermissionSelectorProps {
  roleId: number;
  currentPermissions: string[];
  onSave: (permissions: string[]) => Promise<void>;
}

export function PermissionSelector({
  roleId,
  currentPermissions,
  onSave,
}: PermissionSelectorProps) {
  const { t } = useLanguage();
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions>({});
  const [pagePermissions, setPagePermissions] = useState<PagePermissionMapping>({});
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(currentPermissions);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPermissions();
  }, []);

  useEffect(() => {
    setSelectedPermissions(currentPermissions);
  }, [currentPermissions]);

  const loadPermissions = async () => {
    try {
      setIsLoading(true);
      const [permsResponse, pagesResponse] = await Promise.all([
        RoleService.getPermissions(),
        RoleService.getPagePermissions(),
      ]);
      setGroupedPermissions(permsResponse.grouped);
      setPagePermissions(pagesResponse);
    } catch (err: any) {
      setError(err.message || "Failed to load permissions");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const toggleModule = (module: string, permissions: string[]) => {
    const allSelected = permissions.every((p) => selectedPermissions.includes(p));
    if (allSelected) {
      // Deselect all
      setSelectedPermissions((prev) =>
        prev.filter((p) => !permissions.includes(p))
      );
    } else {
      // Select all
      setSelectedPermissions((prev) => [
        ...prev.filter((p) => !permissions.includes(p)),
        ...permissions,
      ]);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await onSave(selectedPermissions);
    } catch (err: any) {
      setError(err.message || "Failed to save permissions");
    } finally {
      setIsSaving(false);
    }
  };

  const getPagesForPermission = (permission: string): string[] => {
    const pages: string[] = [];
    for (const [page, perms] of Object.entries(pagePermissions)) {
      if (perms.includes(permission)) {
        pages.push(page);
      }
    }
    return pages;
  };

  if (isLoading) {
    return <div className="text-center py-8">{t("roles.loadingPermissions")}</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{t("roles.configurePermissions")}</h3>
          <p className="text-sm text-gray-600">
            {t("roles.configurePermissionsDescription")}
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? t("roles.saving") : t("roles.savePermissions")}
        </Button>
      </div>

      <div className="grid gap-4">
        {Object.entries(groupedPermissions).map(([module, permissions]) => {
          const modulePermissions = permissions as string[];
          const allSelected = modulePermissions.every((p) =>
            selectedPermissions.includes(p)
          );
          const someSelected = modulePermissions.some((p) =>
            selectedPermissions.includes(p)
          );

          return (
            <Card key={module}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="capitalize">{module}</CardTitle>
                    <CardDescription>
                      {modulePermissions.length} {t("roles.permissionsCount")}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleModule(module, modulePermissions)}
                  >
                    {allSelected ? t("roles.deselectAll") : t("roles.selectAll")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {modulePermissions.map((permission) => {
                    const isSelected = selectedPermissions.includes(permission);
                    const pages = getPagesForPermission(permission);

                    return (
                      <div
                        key={permission}
                        className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50"
                      >
                        <Checkbox
                          id={permission}
                          checked={isSelected}
                          onCheckedChange={() => togglePermission(permission)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={permission}
                            className="font-medium cursor-pointer"
                          >
                            {permission.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Label>
                          {pages.length > 0 && (
                            <div className="mt-1">
                              <p className="text-xs text-gray-500">
                                {t("roles.controls")}: {pages.join(", ")}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
