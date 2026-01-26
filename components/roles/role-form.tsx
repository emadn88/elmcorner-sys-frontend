"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleWithPermissions, CreateRoleData, UpdateRoleData } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";

interface RoleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: RoleWithPermissions | null;
  onSave: (data: CreateRoleData | UpdateRoleData) => Promise<void>;
  isLoading?: boolean;
}

export function RoleForm({
  open,
  onOpenChange,
  role,
  onSave,
  isLoading = false,
}: RoleFormProps) {
  const { t } = useLanguage();
  const isEdit = !!role;
  const [formData, setFormData] = useState({
    name: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && role) {
      setFormData({
        name: role.name || "",
      });
    } else if (open && !role) {
      setFormData({
        name: "",
      });
    }
  }, [open, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError(t("roles.nameRequired"));
      return;
    }

    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || t("roles.failedToCreate"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? t("roles.editRole") : t("roles.createRole")}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("roles.editRole")
              : t("roles.createRole") + " - " + t("roles.pageDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{t("roles.roleName")} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t("roles.namePlaceholder")}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t("roles.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("roles.saving") : isEdit ? t("roles.update") : t("roles.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
