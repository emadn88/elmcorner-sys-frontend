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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserManagement, CreateUserData, UpdateUserData, Role } from "@/lib/api/types";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { useLanguage } from "@/contexts/language-context";
import { COUNTRIES, getTimezoneForCountry } from "@/lib/countries-timezones";
import { validateWhatsAppNumber } from "@/lib/whatsapp-validator";

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserManagement | null;
  onSave: (data: CreateUserData | UpdateUserData) => Promise<void>;
  isLoading?: boolean;
}

export function UserForm({
  open,
  onOpenChange,
  user,
  onSave,
  isLoading = false,
}: UserFormProps) {
  const { t, direction } = useLanguage();
  const isEdit = !!user;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "",
    whatsapp: "",
    timezone: "UTC",
    status: "active" as "active" | "inactive",
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);

  // Load roles
  useEffect(() => {
    if (open) {
      loadRoles();
    }
  }, [open]);

  // Load user data when editing
  useEffect(() => {
    if (open && user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        password_confirmation: "",
        role: user.role || "",
        whatsapp: user.whatsapp || "",
        timezone: user.timezone || "UTC",
        status: user.status || "active",
      });
    } else if (open && !user) {
      setFormData({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "",
        whatsapp: "",
        timezone: "UTC",
        status: "active",
      });
    }
  }, [open, user]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setWhatsappError(null);

    // Validation
    if (!formData.name.trim()) {
      setError(t("users.nameRequired"));
      return;
    }
    if (!formData.email.trim()) {
      setError(t("users.emailRequired"));
      return;
    }
    if (!isEdit && !formData.password) {
      setError(t("users.passwordRequired"));
      return;
    }
    if (formData.password && formData.password.length < 8) {
      setError(t("users.passwordMinLength"));
      return;
    }
    if (formData.password !== formData.password_confirmation) {
      setError(t("users.passwordsDoNotMatch"));
      return;
    }
    if (!formData.role) {
      setError(t("users.roleRequired"));
      return;
    }

    // Validate WhatsApp if provided
    if (formData.whatsapp) {
      const validation = validateWhatsAppNumber(formData.whatsapp);
      if (!validation.isValid) {
        setWhatsappError(validation.error || t("users.invalidWhatsApp"));
        return;
      }
    }

    try {
      if (isEdit) {
        const updateData: UpdateUserData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          whatsapp: formData.whatsapp || undefined,
          timezone: formData.timezone,
          status: formData.status,
        };
        if (formData.password) {
          updateData.password = formData.password;
          updateData.password_confirmation = formData.password_confirmation;
        }
        await onSave(updateData);
      } else {
        await onSave(formData as CreateUserData);
      }
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to save user");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("users.editUser") : t("users.createUser")}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("users.editUser") + " - " + t("users.pageDescription")
              : t("users.createUser") + " - " + t("users.pageDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("users.name")} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("users.email")} *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">{isEdit ? t("users.newPassword") : t("users.password") + " *"}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!isEdit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">{t("users.passwordConfirmation")} {!isEdit && "*"}</Label>
              <Input
                id="password_confirmation"
                type="password"
                value={formData.password_confirmation}
                onChange={(e) =>
                  setFormData({ ...formData, password_confirmation: e.target.value })
                }
                required={!isEdit}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">{t("users.role")} *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("users.role")} />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t("users.status")} *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive") =>
                  setFormData({ ...formData, status: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t("users.active")}</SelectItem>
                  <SelectItem value="inactive">{t("users.inactive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">{t("users.whatsapp")}</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+966501234567"
              />
              {whatsappError && (
                <p className="text-sm text-red-600">{whatsappError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">{t("users.timezone")}</Label>
              <Input
                id="timezone"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                placeholder="UTC"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t("users.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("users.saving") : isEdit ? t("users.update") : t("users.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
