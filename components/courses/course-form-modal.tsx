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
import { Course } from "@/types/courses";
import { useLanguage } from "@/contexts/language-context";

interface CourseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
  onSave: (course: Partial<Course>) => Promise<void>;
  isLoading?: boolean;
}

export function CourseFormModal({
  open,
  onOpenChange,
  course,
  onSave,
  isLoading = false,
}: CourseFormModalProps) {
  const { t } = useLanguage();
  const isEdit = !!course;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    status: "active" as "active" | "inactive",
  });

  const [error, setError] = useState<string | null>(null);

  // Initialize form data
  useEffect(() => {
    if (course && open) {
      setFormData({
        name: course.name,
        category: course.category || "",
        description: course.description || "",
        status: course.status,
      });
    } else if (open) {
      setFormData({
        name: "",
        category: "",
        description: "",
        status: "active",
      });
    }
  }, [course, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const courseData: Partial<Course> = {
        name: formData.name,
        category: formData.category || undefined,
        description: formData.description || undefined,
        status: formData.status,
      };

      await onSave(courseData);
    } catch (err: any) {
      setError(err.message || t("courses.errorSaving") || "Failed to save course");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("courses.editCourse") || "Edit Course" : t("courses.addCourse") || "Add Course"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("courses.editCourseDescription") || "Update course information"
              : t("courses.addCourseDescription") || "Create a new course"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="name">
              {t("courses.name") || "Name"} *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">
              {t("courses.category") || "Category"}
            </Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description">
              {t("courses.description") || "Description"}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="status">
              {t("courses.status") || "Status"} *
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
                <SelectItem value="active">
                  {t("courses.active") || "Active"}
                </SelectItem>
                <SelectItem value="inactive">
                  {t("courses.inactive") || "Inactive"}
                </SelectItem>
              </SelectContent>
            </Select>
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
