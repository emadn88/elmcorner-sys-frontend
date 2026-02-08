"use client";

import { useEffect, useState, useRef } from "react";
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
import { Package, CreatePackageData, UpdatePackageData } from "@/lib/api/types";
import { StudentService } from "@/lib/services/student.service";
import { Student } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface PackageFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package?: Package | null;
  studentId?: number;
  onSave: (data: CreatePackageData | UpdatePackageData) => Promise<void>;
  isLoading?: boolean;
}

export function PackageFormModal({
  open,
  onOpenChange,
  package: pkg,
  studentId,
  onSave,
  isLoading = false,
}: PackageFormModalProps) {
  const { t, direction } = useLanguage();
  const isEdit = !!pkg;

  const [formData, setFormData] = useState({
    student_id: studentId || pkg?.student_id || 0,
    start_date: pkg?.start_date || new Date().toISOString().split("T")[0],
    total_hours: pkg?.total_hours || 8,
    hour_price: pkg?.hour_price || 0,
    currency: pkg?.currency || "USD",
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const studentDropdownRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (pkg) {
        setFormData({
          student_id: pkg.student_id,
          start_date: pkg.start_date,
          total_hours: pkg.total_hours || 8,
          hour_price: pkg.hour_price,
          currency: pkg.currency,
        });
        if (pkg.student) {
          setSelectedStudentName(pkg.student.full_name);
        }
      } else if (studentId) {
        setFormData((prev) => ({ ...prev, student_id: studentId }));
      }
      setError(null);
      setStudentSearch("");
      setShowStudentDropdown(false);
    }
  }, [open, pkg, studentId]);

  // Load students for search
  useEffect(() => {
    if (open && !studentId && !pkg) {
      if (studentSearch) {
        StudentService.getStudents({ search: studentSearch, per_page: 50 })
          .then((response) => {
            setStudents(response.data);
            setFilteredStudents(response.data);
            setShowStudentDropdown(true);
          })
          .catch(() => {
            setStudents([]);
            setFilteredStudents([]);
          });
      } else {
        // Load initial students
        StudentService.getStudents({ per_page: 50 })
          .then((response) => {
            setStudents(response.data);
            setFilteredStudents(response.data);
          })
          .catch(() => {
            setStudents([]);
            setFilteredStudents([]);
          });
      }
    }
  }, [open, studentId, pkg, studentSearch]);

  // Filter students based on search
  useEffect(() => {
    if (studentSearch) {
      const filtered = students.filter((student) =>
        student.full_name.toLowerCase().includes(studentSearch.toLowerCase())
      );
      setFilteredStudents(filtered);
      setShowStudentDropdown(true);
    } else {
      setFilteredStudents(students);
      setShowStudentDropdown(false);
    }
  }, [studentSearch, students]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        studentDropdownRef.current &&
        !studentDropdownRef.current.contains(event.target as Node)
      ) {
        setShowStudentDropdown(false);
      }
    };

    if (showStudentDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStudentDropdown]);

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate student selection
    if (!studentId && !pkg && formData.student_id === 0) {
      setError("Please select a student");
      return;
    }

    try {
      await onSave(formData);
      onOpenChange(false);
      setSelectedStudentName("");
      setStudentSearch("");
    } catch (err: any) {
      setError(err.message || "Failed to save package");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className={cn("text-left rtl:text-right")}>
            {isEdit ? t("packages.editPackage") : t("packages.addPackage")}
          </DialogTitle>
          <DialogDescription className={cn("text-left rtl:text-right")}>
            {isEdit
              ? "Update package information"
              : "Create a new package for a student"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!studentId && !pkg && (
            <div className="space-y-2 relative" ref={studentDropdownRef}>
              <Label htmlFor="student_id">{t("packages.student")}</Label>
              <div className="relative">
                <Input
                  id="student_id"
                  type="text"
                  placeholder={t("packages.selectStudent") || "Search and select student"}
                  value={selectedStudentName || studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setSelectedStudentName("");
                    setFormData((prev) => ({ ...prev, student_id: 0 }));
                  }}
                  onFocus={() => {
                    if (filteredStudents.length > 0) {
                      setShowStudentDropdown(true);
                    }
                  }}
                  className="pr-10"
                />
                {selectedStudentName && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={() => {
                      setSelectedStudentName("");
                      setStudentSearch("");
                      setFormData((prev) => ({ ...prev, student_id: 0 }));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {showStudentDropdown && (studentSearch || !selectedStudentName) && (
                <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        setSelectedStudentName(student.full_name);
                        setStudentSearch("");
                        setFormData((prev) => ({ ...prev, student_id: student.id }));
                        setShowStudentDropdown(false);
                      }}
                    >
                      {student.full_name}
                    </div>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      {t("packages.noStudentsFound") || "No students found"}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">{t("packages.startDate")}</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_hours">{t("packages.totalHours") || "Total Hours"} *</Label>
              <Input
                id="total_hours"
                type="number"
                step="0.5"
                min="0.5"
                value={formData.total_hours || ""}
                onChange={(e) => handleChange("total_hours", Number(e.target.value))}
                placeholder="e.g., 8"
                required
              />
              <p className="text-xs text-gray-500">
                {t("packages.totalHoursHint") || "Package limit is calculated by hours"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hour_price">{t("packages.hourPrice")}</Label>
              <Input
                id="hour_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.hour_price}
                onChange={(e) => handleChange("hour_price", Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">{t("packages.currency")}</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleChange("currency", value)}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="SAR">SAR</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t("packages.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? t("packages.saving")
                : isEdit
                ? t("packages.update")
                : t("packages.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
