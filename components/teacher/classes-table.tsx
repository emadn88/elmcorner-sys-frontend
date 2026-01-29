"use client";

import { Video, Eye, Edit, Clock, CheckCircle2, XCircle, AlertCircle, CheckCircle, Pencil } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TeacherClass } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ClassesTableProps {
  classes: TeacherClass[];
  onEnterMeet: (classItem: TeacherClass) => void;
  onEndClass: (classItem: TeacherClass) => void;
  onViewDetails: (classItem: TeacherClass) => void;
  isLoading?: boolean;
}

export function ClassesTable({
  classes,
  onEnterMeet,
  onEndClass,
  onViewDetails,
  isLoading = false,
}: ClassesTableProps) {
  const { t, direction } = useLanguage();

  const getStatusBadge = (status: TeacherClass["status"]) => {
    const variants = {
      attended: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      cancelled_by_teacher: "bg-red-100 text-red-700 border-red-200",
      cancelled_by_student: "bg-orange-100 text-orange-700 border-orange-200",
      absent_student: "bg-gray-100 text-gray-700 border-gray-200",
    };
    
    const labels: Record<string, string> = {
      attended: t("classes.status.attended") || "Attended",
      pending: t("classes.status.pending") || "Pending",
      cancelled_by_teacher: t("classes.status.cancelledByTeacher") || "Cancelled by Teacher",
      cancelled_by_student: t("classes.status.cancelledByStudent") || "Cancelled by Student",
      absent_student: t("classes.status.absentStudent") || "Absent Student",
    };

    return (
      <Badge
        variant="outline"
        className={cn("border text-xs font-medium", variants[status] || variants.pending)}
      >
        {labels[status] || status}
      </Badge>
    );
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "—";
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-8">
        <div className="text-center text-gray-500">
          {t("common.loading") || "Loading..."}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="min-w-[120px] text-xs sm:text-sm">
              {t("classes.student") || "Student"}
            </TableHead>
            <TableHead className="min-w-[120px] text-xs sm:text-sm hidden sm:table-cell">
              {t("classes.course") || "Course"}
            </TableHead>
            <TableHead className="min-w-[100px] text-xs sm:text-sm">
              {t("classes.date") || "Date"}
            </TableHead>
            <TableHead className="min-w-[100px] text-xs sm:text-sm">
              {t("classes.time") || "Time"}
            </TableHead>
            <TableHead className="min-w-[80px] text-xs sm:text-sm hidden md:table-cell">
              {t("classes.duration") || "Duration"}
            </TableHead>
            <TableHead className="min-w-[100px] text-xs sm:text-sm">
              {t("classes.statusLabel") || "Status"}
            </TableHead>
            <TableHead className={cn("min-w-[120px] sm:min-w-[180px] sm:w-[180px] text-xs sm:text-sm", direction === "rtl" ? "text-left" : "text-right")}>
              {t("classes.actions") || "Actions"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-sm text-gray-500">
                    {t("teacher.noClassesFound") || "No classes found"}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            classes.map((classItem) => {
              // Highlight row if meet was entered and class is pending (waiting for data)
              const isInProgress = classItem.meet_link_used && classItem.status === 'pending';
              // Ensure boolean values are properly handled
              const meetLinkUsed = Boolean(classItem.meet_link_used);
              const canEnterMeet = Boolean(classItem.can_enter_meet) && !meetLinkUsed;
              const canEndClass = meetLinkUsed && classItem.status === 'pending';
              // Show edit button only after meet was entered
              const canEditDetails = meetLinkUsed;
              
              return (
              <TableRow
                key={classItem.id}
                className={cn(
                  "transition-colors hover:bg-gray-50/50",
                  isInProgress && "bg-blue-50/50 border-l-4 border-l-blue-500"
                )}
              >
                <TableCell>
                  <div className={cn(
                    "min-w-0",
                    direction === "rtl" ? "text-right" : "text-left"
                  )}>
                    <div className="font-medium text-gray-900 text-xs sm:text-sm">
                      {classItem.student?.full_name || "Unknown Student"}
                    </div>
                    {classItem.student?.email && (
                      <div className="text-xs text-gray-500 truncate hidden sm:block">
                        {classItem.student.email}
                      </div>
                    )}
                    {/* Show course on mobile in student cell */}
                    <div className="text-xs text-gray-600 sm:hidden mt-1">
                      {classItem.course?.name || "Unknown Course"}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="text-xs sm:text-sm text-gray-900 font-medium">
                    {classItem.course?.name || "Unknown Course"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {formatDate(classItem.class_date)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="text-xs sm:text-sm text-gray-600">
                    {classItem.duration ? `${classItem.duration} min` : "—"}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(classItem.status)}
                </TableCell>
                <TableCell className="min-w-[120px] sm:min-w-[180px]">
                  <div className={cn(
                    "flex items-center gap-1 flex-wrap",
                    direction === "rtl" ? "justify-start" : "justify-end"
                  )}>
                    <TooltipProvider>
                      {/* Step 1: Enter Meet - show only if can enter and haven't entered yet */}
                      {canEnterMeet && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              onClick={() => onEnterMeet(classItem)}
                            >
                              <Video className="h-4 w-4" />
                              <span className="sr-only">
                                {t("teacher.enterMeet") || "Enter Meet"}
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("teacher.enterMeet") || "Enter Meet"}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      
                      {/* Step 2: End Class - only show if meet was entered and class is pending */}
                      {canEndClass && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-colors"
                              onClick={() => onEndClass(classItem)}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span className="sr-only">
                                {t("teacher.endClass") || "End Class"}
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("teacher.endClass") || "End Class"}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      
                      {/* Step 3: Edit Details - show only after meet was entered (replaces eye icon) */}
                      {canEditDetails && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                              onClick={() => onViewDetails(classItem)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">
                                {t("teacher.editDetails") || "Edit Details"}
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("teacher.editDetails") || "Edit Details"}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      
                      {/* Show message if no actions available */}
                      {!canEnterMeet && !canEndClass && !canEditDetails && (
                        <span className="text-xs text-gray-400 italic">
                          {t("teacher.waitingForClassTime") || "Waiting for class time"}
                        </span>
                      )}
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
