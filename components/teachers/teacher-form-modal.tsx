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
import { Textarea } from "@/components/ui/textarea";
import { Teacher } from "@/types/teachers";
import { useLanguage } from "@/contexts/language-context";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

interface TeacherFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher?: Teacher | null;
  onSave: (teacher: Partial<Teacher>) => Promise<void>;
  isLoading?: boolean;
}

export function TeacherFormModal({
  open,
  onOpenChange,
  teacher,
  onSave,
  isLoading = false,
}: TeacherFormModalProps) {
  const { t } = useLanguage();
  const isEdit = !!teacher;

  // Form state
  const [formData, setFormData] = useState({
    // User fields
    name: "",
    email: "",
    password: "",
    whatsapp: "",
    // Teacher fields
    hourly_rate: "",
    currency: "USD",
    timezone: "UTC",
    status: "active" as "active" | "inactive",
    bio: "",
    meet_link: "",
  });

  const [error, setError] = useState<string | null>(null);

  // Initialize form data
  useEffect(() => {
    if (teacher && open) {
      setFormData({
        name: teacher.user?.name || "",
        email: teacher.user?.email || "",
        password: "", // Don't populate password
        whatsapp: teacher.user?.whatsapp || "",
        hourly_rate: teacher.hourly_rate.toString(),
        currency: teacher.currency,
        timezone: teacher.timezone,
        status: teacher.status,
        bio: teacher.bio || "",
        meet_link: teacher.meet_link || "",
      });
    } else if (open) {
      setFormData({
        name: "",
        email: "",
        password: "",
        whatsapp: "",
        hourly_rate: "",
        currency: "USD",
        timezone: "UTC",
        status: "active",
        bio: "",
        meet_link: "",
      });
    }
  }, [teacher, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const teacherData: any = {
        // User fields
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp || undefined,
        // Teacher fields
        hourly_rate: Number(formData.hourly_rate),
        currency: formData.currency,
        timezone: formData.timezone,
        status: formData.status,
        bio: formData.bio || undefined,
        meet_link: formData.meet_link || undefined,
      };

      // Only include password if provided (for create or if updating)
      if (formData.password) {
        teacherData.password = formData.password;
      }

      const savedTeacher = await onSave(teacherData);
      
      // Note: Course assignment can be done separately from the teacher profile page
    } catch (err: any) {
      setError(err.message || "Failed to save teacher");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("teachers.editTeacher") || "Edit Teacher" : t("teachers.addTeacher") || "Add Teacher"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("teachers.editTeacherDescription") || "Update teacher information"
              : t("teachers.addTeacherDescription") || "Create a new teacher profile"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* User Information Section */}
          <div className="space-y-4 border-b border-gray-200 pb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              {t("teachers.userInformation") || "User Information"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">
                  {t("teachers.name") || "Name"} *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder={t("teachers.namePlaceholder") || "Enter teacher name"}
                />
              </div>
              <div>
                <Label htmlFor="email">
                  {t("teachers.email") || "Email"} *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder={t("teachers.emailPlaceholder") || "Enter email address"}
                />
              </div>
              <div>
                <Label htmlFor="password">
                  {t("teachers.password") || "Password"} {!isEdit && "*"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!isEdit}
                  placeholder={isEdit ? t("teachers.passwordPlaceholderOptional") || "Leave blank to keep current" : t("teachers.passwordPlaceholder") || "Enter password"}
                />
                {isEdit && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t("teachers.passwordHint") || "Leave blank to keep current password"}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="whatsapp">
                  {t("teachers.whatsapp") || "WhatsApp"}
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder={t("teachers.whatsappPlaceholder") || "+966501234567"}
                />
              </div>
            </div>
          </div>

          {/* Teacher Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              {t("teachers.teacherInformation") || "Teacher Information"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hourly_rate">
                  {t("teachers.hourlyRate") || "Hourly Rate"} *
                </Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="currency">
                  {t("teachers.currency") || "Currency"}
                </Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                  maxLength={3}
                  placeholder="USD"
                />
              </div>
              <div>
                <Label htmlFor="timezone">
                  {t("teachers.timezone") || "Timezone"}
                </Label>
                <Input
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  placeholder="UTC"
                />
              </div>
              <div>
                <Label htmlFor="status">
                  {t("teachers.status") || "Status"} *
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as "active" | "inactive" })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("teachers.active") || "Active"}</SelectItem>
                    <SelectItem value="inactive">{t("teachers.inactive") || "Inactive"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="bio">
              {t("teachers.bio") || "Bio"}
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="meet_link">
              {t("teachers.meetLink") || "Meet Link"} *
            </Label>
            <Input
              id="meet_link"
              type="url"
              value={formData.meet_link}
              onChange={(e) => setFormData({ ...formData, meet_link: e.target.value })}
              required
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("teachers.meetLinkHint") || "Required: Video meeting link for this teacher"}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? t("common.saving") || "Saving..."
                : isEdit
                ? t("common.update") || "Update"
                : t("common.create") || "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
