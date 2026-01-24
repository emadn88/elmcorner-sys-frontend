"use client";

import { useState } from "react";
import { Eye, MessageSquare, Pause, Play } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentActivity } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface StudentActivityTableProps {
  students: StudentActivity[];
  selectedIds: number[];
  onSelect: (id: number) => void;
  onSelectAll: (selected: boolean) => void;
  onView: (student: StudentActivity) => void;
  onReactivate: (student: StudentActivity) => void;
  onPause?: (student: StudentActivity) => void;
  onResume?: (student: StudentActivity) => void;
}

export function StudentActivityTable({
  students,
  selectedIds,
  onSelect,
  onSelectAll,
  onView,
  onReactivate,
  onPause,
  onResume,
}: StudentActivityTableProps) {
  const { t, direction } = useLanguage();
  const router = useRouter();
  const allSelected = students.length > 0 && selectedIds.length === students.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < students.length;

  const getActivityLevelColor = (level: StudentActivity["activity_level"]) => {
    const colors = {
      highly_active: "bg-green-50 border-green-200 hover:bg-green-100",
      medium: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
      low: "bg-orange-50 border-orange-200 hover:bg-orange-100",
      stopped: "bg-red-50 border-red-200 hover:bg-red-100",
    };
    return colors[level] || colors.stopped;
  };

  const getActivityLevelBadge = (level: StudentActivity["activity_level"]) => {
    const variants = {
      highly_active: "bg-green-100 text-green-700 border-green-200",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      low: "bg-orange-100 text-orange-700 border-orange-200",
      stopped: "bg-red-100 text-red-700 border-red-200",
    };
    return (
      <Badge
        variant="outline"
        className={cn("border", variants[level] || variants.stopped)}
      >
        {t(`studentActivity.${level}`) || level}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString(t("common.locale") || "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleStudentClick = (student: StudentActivity) => {
    router.push(`/dashboard/students/${student.id}`);
  };

  return (
    <div className="rounded-md border border-gray-200 bg-white overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onSelectAll(checked === true)}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead className={cn(direction === "rtl" && "text-right")}>
              {t("studentActivity.studentName") || "Student Name"}
            </TableHead>
            <TableHead className={cn(direction === "rtl" && "text-right")}>
              {t("studentActivity.activityLevel") || "Activity Level"}
            </TableHead>
            <TableHead className={cn(direction === "rtl" && "text-right")}>
              {t("studentActivity.recentClasses") || "Recent Classes"}
            </TableHead>
            <TableHead className={cn(direction === "rtl" && "text-right")}>
              {t("studentActivity.lastClass") || "Last Class"}
            </TableHead>
            <TableHead className={cn(direction === "rtl" && "text-right")}>
              {t("studentActivity.daysSince") || "Days Since"}
            </TableHead>
            <TableHead className={cn(direction === "rtl" && "text-right")}>
              {t("studentActivity.attendanceRate") || "Attendance Rate"}
            </TableHead>
            <TableHead className={cn("text-center", direction === "rtl" && "text-right")}>
              {t("studentActivity.actions") || "Actions"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12">
                <p className={cn("text-gray-500", direction === "rtl" && "text-right")}>
                  {t("studentActivity.noStudents") || "No students found"}
                </p>
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow
                key={student.id}
                className={cn(
                  getActivityLevelColor(student.activity_level),
                  "cursor-pointer"
                )}
                onClick={() => handleStudentClick(student)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.includes(student.id)}
                    onCheckedChange={() => onSelect(student.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStudentClick(student);
                    }}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {student.full_name}
                  </button>
                </TableCell>
                <TableCell>{getActivityLevelBadge(student.activity_level)}</TableCell>
                <TableCell>{student.recent_classes_count}</TableCell>
                <TableCell>{formatDate(student.last_class_date)}</TableCell>
                <TableCell>
                  {student.days_since_last_class !== null && student.days_since_last_class !== undefined
                    ? `${student.days_since_last_class} ${t("studentActivity.days") || "days"}`
                    : "-"}
                </TableCell>
                <TableCell>
                  {student.attendance_rate !== null && student.attendance_rate !== undefined
                    ? `${student.attendance_rate}%`
                    : "-"}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2 justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(student)}
                      title={t("studentActivity.viewProfile") || "View Profile"}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReactivate(student)}
                      title={t("studentActivity.sendReactivation") || "Send Reactivation Offer"}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    {student.status === "paused" && onResume && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onResume(student)}
                        title={t("studentActivity.resume") || "Resume"}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {student.status === "active" && onPause && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPause(student)}
                        title={t("studentActivity.pause") || "Pause"}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
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
