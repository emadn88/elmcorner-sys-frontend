"use client";

import { Search, X, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActivityFilters } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { StudentService } from "@/lib/services/student.service";
import { Student } from "@/lib/api/types";

interface ActivityFiltersProps {
  filters: ActivityFilters;
  onFiltersChange: (filters: ActivityFilters) => void;
}

export function ActivityFiltersComponent({
  filters,
  onFiltersChange,
}: ActivityFiltersProps) {
  const { t, direction } = useLanguage();
  const [studentSearch, setStudentSearch] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const studentDropdownRef = useRef<HTMLDivElement>(null);

  // Load students for autocomplete
  useEffect(() => {
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
      setFilteredStudents([]);
      setShowStudentDropdown(false);
    }
  }, [studentSearch]);

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

  const handleFilterChange = (key: keyof ActivityFilters, value: string | number | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      action: "all",
      search: "",
      user_id: undefined,
      student_id: undefined,
      date_from: undefined,
      date_to: undefined,
    });
    setStudentSearch("");
  };

  const hasActiveFilters =
    filters.search ||
    (filters.action && filters.action !== "all") ||
    filters.user_id ||
    filters.student_id ||
    filters.date_from ||
    filters.date_to;

  const selectedStudent = students.find((s) => s.id === filters.student_id);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search
            className={cn(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400",
              direction === "rtl" ? "right-3" : "left-3"
            )}
          />
          <Input
            placeholder={t("activity.searchPlaceholder") || "Search in descriptions..."}
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className={cn(
              "pl-10 pr-10",
              direction === "rtl" && "pr-10 pl-10"
            )}
          />
          {filters.search && (
            <button
              onClick={() => handleFilterChange("search", "")}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",
                direction === "rtl" ? "left-3" : "right-3"
              )}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action Type Filter */}
          <Select
            value={filters.action || "all"}
            onValueChange={(value) => handleFilterChange("action", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("activity.filterAction") || "Action Type"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("activity.allActions") || "All Actions"}</SelectItem>
              <SelectItem value="created">{t("activity.created") || "Created"}</SelectItem>
              <SelectItem value="updated">{t("activity.updated") || "Updated"}</SelectItem>
              <SelectItem value="deleted">{t("activity.deleted") || "Deleted"}</SelectItem>
            </SelectContent>
          </Select>

          {/* Student Filter */}
          <div className="relative" ref={studentDropdownRef}>
            <Input
              placeholder={t("activity.filterStudent") || "Filter by Student"}
              value={selectedStudent ? selectedStudent.full_name : studentSearch}
              onChange={(e) => {
                setStudentSearch(e.target.value);
                if (!e.target.value) {
                  handleFilterChange("student_id", undefined);
                }
              }}
              onFocus={() => {
                if (studentSearch || students.length > 0) {
                  setShowStudentDropdown(true);
                }
              }}
            />
            {showStudentDropdown && filteredStudents.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                <div
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b"
                  onClick={() => {
                    handleFilterChange("student_id", undefined);
                    setStudentSearch("");
                    setShowStudentDropdown(false);
                  }}
                >
                  {t("activity.allStudents") || "All Students"}
                </div>
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      handleFilterChange("student_id", student.id);
                      setStudentSearch(student.full_name);
                      setShowStudentDropdown(false);
                    }}
                  >
                    {student.full_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date From */}
          <Input
            type="date"
            placeholder={t("activity.dateFrom") || "Date From"}
            value={filters.date_from || ""}
            onChange={(e) => handleFilterChange("date_from", e.target.value || undefined)}
          />

          {/* Date To */}
          <Input
            type="date"
            placeholder={t("activity.dateTo") || "Date To"}
            value={filters.date_to || ""}
            onChange={(e) => handleFilterChange("date_to", e.target.value || undefined)}
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className={cn("w-full sm:w-auto", direction === "rtl" && "sm:mr-auto sm:ml-0")}
          >
            <X className="h-4 w-4 mr-2" />
            {t("activity.clearFilters") || "Clear Filters"}
          </Button>
        )}
      </div>
    </div>
  );
}
