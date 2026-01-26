"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleWithPermissions } from "@/lib/api/types";
import { Edit, Trash2, Settings } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface RoleTableProps {
  roles: RoleWithPermissions[];
  onEdit: (role: RoleWithPermissions) => void;
  onDelete: (role: RoleWithPermissions) => void;
  onConfigurePermissions: (role: RoleWithPermissions) => void;
  isLoading?: boolean;
}

export function RoleTable({
  roles,
  onEdit,
  onDelete,
  onConfigurePermissions,
  isLoading = false,
}: RoleTableProps) {
  const { t } = useLanguage();
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("roles.roleName")}</TableHead>
            <TableHead>{t("roles.users")}</TableHead>
            <TableHead>{t("roles.permissions")}</TableHead>
            <TableHead className="text-right">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                {t("common.loading")}
              </TableCell>
            </TableRow>
          ) : roles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                {t("roles.noRolesFound")}
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{role.users_count} {t("roles.usersCount")}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{role.permissions_count} {t("roles.permissionsCount")}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onConfigurePermissions(role)}
                      title={t("roles.configurePermissions")}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(role)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(role)}
                      className="text-red-600 hover:text-red-700"
                      disabled={role.users_count > 0}
                      title={role.users_count > 0 ? t("roles.cannotDeleteWithUsers", { count: role.users_count }) : t("roles.deleteRole")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
