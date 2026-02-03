"use client";

import { Video, FileText, Clock, CheckCircle2, XCircle, AlertCircle, CheckCircle, Pencil } from "lucide-react";
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
  onWriteReport: (classItem: TeacherClass) => void;
  isLoading?: boolean;
}

export function ClassesTable({
  classes,
  onEnterMeet,
  onEndClass,
  onViewDetails,
  onWriteReport,
  isLoading = false,
}: ClassesTableProps) {
  const { t, direction } = useLanguage();

  const getStatusBadge = (classItem: TeacherClass) => {
    // Check if cancellation request is pending
    if (classItem.cancellation_request_status === 'pending') {
      return (
        <Badge
          variant="outline"
          className="border text-xs font-medium bg-orange-100 text-orange-700 border-orange-200"
        >
          {t("teacher.waitingForAdminApproval") || "Waiting for Admin Approval"}
        </Badge>
      );
    }
    
    // Check if cancellation request is approved (teacher should see this with disabled actions)
    if (classItem.cancellation_request_status === 'approved' && classItem.status === 'cancelled_by_student') {
      return (
        <Badge
          variant="outline"
          className="border text-xs font-medium bg-green-100 text-green-700 border-green-200"
        >
          {t("teacher.cancellationApproved") || "Cancellation Approved"}
        </Badge>
      );
    }
    
    // Check if cancellation request is rejected
    if (classItem.cancellation_request_status === 'rejected') {
      return (
        <Badge
          variant="outline"
          className="border text-xs font-medium bg-red-100 text-red-700 border-red-200"
        >
          {t("teacher.cancellationRejected") || "Cancellation Rejected"}
        </Badge>
      );
    }

    const status = classItem.status;
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
    const [hours, minutes, seconds] = timeString.split(":");
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 % 12 || 12;
    const ampm = hour24 >= 12 ? "PM" : "AM";
    const mins = minutes || "00";
    return `${hour12}:${mins} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    if (!dateString || !timeString) return "—";
    try {
      const date = formatDate(dateString);
      const time = formatTime(timeString);
      return `${date} ${time}`;
    } catch {
      return "—";
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
          <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
            <TableHead className="min-w-[140px] text-xs sm:text-sm font-semibold text-gray-700">
              {t("classes.student") || "Student"}
            </TableHead>
            <TableHead className="min-w-[120px] text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">
              {t("classes.course") || "Course"}
            </TableHead>
            <TableHead className="min-w-[100px] text-xs sm:text-sm font-semibold text-gray-700">
              {t("classes.date") || "Date"}
            </TableHead>
            <TableHead className="min-w-[120px] text-xs sm:text-sm font-semibold text-gray-700">
              {t("teacher.teacherTime") || "Teacher Time"}
            </TableHead>
            <TableHead className="min-w-[120px] text-xs sm:text-sm font-semibold text-gray-700">
              {t("teacher.studentTime") || "Student Time"}
            </TableHead>
            <TableHead className="min-w-[100px] text-xs sm:text-sm font-semibold text-gray-700">
              {t("classes.statusLabel") || "Status"}
            </TableHead>
            <TableHead className={cn("min-w-[180px] sm:min-w-[220px] text-xs sm:text-sm font-semibold text-gray-700", direction === "rtl" ? "text-left" : "text-right")}>
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
              // Highlight row if meet was entered
              const meetLinkUsed = Boolean(classItem.meet_link_used);
              const isPending = classItem.status === 'pending';
              const reportWritten = Boolean(classItem.class_report);
              const reportSent = Boolean(classItem.report_submitted_at);
              
              // Calculate class end time
              const classEndTime = classItem.class_date && classItem.end_time
                ? new Date(`${classItem.class_date}T${classItem.end_time}`)
                : null;
              const oneHourAfterEnd = classEndTime
                ? new Date(classEndTime.getTime() + 60 * 60 * 1000) // Add 1 hour
                : null;
              const isPastOneHour = oneHourAfterEnd ? new Date() > oneHourAfterEnd : false;
              
              // Check if cancellation was rejected or approved
              const hasRejectedCancellation = classItem.cancellation_request_status === 'rejected';
              const hasApprovedCancellation = classItem.cancellation_request_status === 'approved' && classItem.status === 'cancelled_by_student';
              
              // Button logic: Hide Start Class if meet link was used or status is not pending
              // Also disable if cancellation was rejected or approved
              const canEnterMeet = isPending && Boolean(classItem.can_enter_meet) && !meetLinkUsed && !hasRejectedCancellation && !hasApprovedCancellation;
              
              // Show Write Report if meet link was used (regardless of status) and report not written/sent yet
              // Disable if 1 hour passed after class end time, pending cancellation, rejected cancellation, or approved cancellation
              const canWriteReport = meetLinkUsed && !reportWritten && !isPastOneHour && classItem.cancellation_request_status !== 'pending' && !hasRejectedCancellation && !hasApprovedCancellation;
              const hasPendingCancellation = classItem.cancellation_request_status === 'pending';
              
              // Format teacher time with date
              const teacherTime = classItem.class_date
                ? `${formatDate(classItem.class_date)}\n${formatTime(classItem.start_time)} - ${formatTime(classItem.end_time)}`
                : `${formatTime(classItem.start_time)} - ${formatTime(classItem.end_time)}`;
              
              // Format student time with date if available
              const studentTime = classItem.student_date && classItem.student_start_time && classItem.student_end_time
                ? `${formatDate(classItem.student_date)}\n${formatTime(classItem.student_start_time)} - ${formatTime(classItem.student_end_time)}`
                : classItem.student_start_time && classItem.student_end_time
                ? `${formatTime(classItem.student_start_time)} - ${formatTime(classItem.student_end_time)}`
                : "—";
              
              return (
              <TableRow
                key={classItem.id}
                className={cn(
                  "transition-all duration-200 hover:bg-gray-50/80 border-b border-gray-100",
                  meetLinkUsed && "bg-blue-50/60 border-l-4 border-l-blue-500 shadow-sm"
                )}
              >
                <TableCell className="py-4">
                  <div className={cn(
                    "min-w-0",
                    direction === "rtl" ? "text-right" : "text-left"
                  )}>
                    <div className="font-semibold text-gray-900 text-sm">
                      {classItem.student?.full_name || t("teacher.unknownStudent") || "Unknown Student"}
                    </div>
                    {/* Show course on mobile in student cell */}
                    <div className="text-xs text-gray-600 sm:hidden mt-1">
                      {classItem.course?.name || t("teacher.unknownCourse") || "Unknown Course"}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell py-4">
                  <div className="text-sm text-gray-900 font-medium">
                    {classItem.course?.name || t("teacher.unknownCourse") || "Unknown Course"}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="text-sm text-gray-700 font-medium">
                    {formatDate(classItem.class_date)}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {teacherTime}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {studentTime}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {getStatusBadge(classItem)}
                </TableCell>
                <TableCell className="min-w-[180px] sm:min-w-[220px] py-4">
                  <div className={cn(
                    "flex items-center gap-2 flex-wrap",
                    direction === "rtl" ? "justify-start" : "justify-end"
                  )}>
                    <TooltipProvider>
                      {/* Start Class Button - visible initially, enabled if can enter meet */}
                      {canEnterMeet && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="default"
                              size="sm"
                              className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm"
                              onClick={() => onEnterMeet(classItem)}
                            >
                              <Video className="h-3.5 w-3.5 mr-1.5" />
                              {t("teacher.startClass") || "Start Class"}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("teacher.startClass") || "Start Class"}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      
                      {/* Write Report Button - visible if meet link was used */}
                      {meetLinkUsed && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={reportSent ? "default" : (canWriteReport ? "default" : "outline")}
                              size="sm"
                              className={cn(
                                "h-8 px-3 text-xs font-medium shadow-sm",
                                reportSent
                                  ? "bg-green-500 hover:bg-green-600 text-white cursor-default"
                                  : canWriteReport 
                                  ? "bg-green-600 hover:bg-green-700 text-white" 
                                  : hasPendingCancellation
                                  ? "bg-orange-100 text-orange-600 cursor-not-allowed border-orange-200"
                                  : isPastOneHour
                                  ? "bg-red-100 text-red-600 cursor-not-allowed border-red-200"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                              )}
                              onClick={() => canWriteReport && onWriteReport(classItem)}
                              disabled={reportWritten || !canWriteReport || hasPendingCancellation || isPastOneHour}
                            >
                              <FileText className="h-3.5 w-3.5 mr-1.5" />
                              {reportSent 
                                ? (t("teacher.reportSentSuccessfully") || "Report Sent Successfully")
                                : reportWritten
                                ? (t("teacher.writeReport") || "Write Report")
                                : (t("teacher.writeReport") || "Write Report")
                              }
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {reportSent
                                ? (t("teacher.reportSentSuccessfully") || "Report Sent Successfully")
                                : hasPendingCancellation
                                ? (t("teacher.waitingForAdminApproval") || "Waiting for Admin Approval")
                                : isPastOneHour
                                ? (t("teacher.reportDeadlinePassed") || "Report deadline passed (1 hour after class end)")
                                : canWriteReport 
                                ? (t("teacher.writeReport") || "Write Report")
                                : (t("teacher.startClassFirst") || "Start class first")
                              }
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      
                      {/* Show approved cancellation message */}
                      {hasApprovedCancellation && (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-green-600 font-medium">
                            {t("teacher.cancellationApproved") || "Cancellation Approved - Class counted for salary"}
                          </span>
                        </div>
                      )}
                      
                      {/* Show rejection message if cancelled and rejected */}
                      {hasRejectedCancellation && (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-red-600 font-medium">
                            {t("teacher.cancellationRejected") || "Cancellation Rejected"}
                          </span>
                          {classItem.admin_rejection_reason && (
                            <span className="text-xs text-gray-600 italic">
                              {t("teacher.adminReason") || "Admin Reason"}: {classItem.admin_rejection_reason}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Show message if no actions available at all */}
                      {!canEnterMeet && !meetLinkUsed && !hasRejectedCancellation && !hasApprovedCancellation && (
                        <span className="text-xs text-gray-400 italic">
                          {t("teacher.noActionsAvailable") || "No actions available"}
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
