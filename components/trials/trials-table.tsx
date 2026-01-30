"use client";

import { Edit, Trash2, Eye, RotateCcw, CheckCircle, XCircle, MoreVertical } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TrialClass } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface TrialsTableProps {
  trials: TrialClass[];
  onEdit: (trial: TrialClass) => void;
  onDelete: (trial: TrialClass) => void;
  onView: (trial: TrialClass) => void;
  onConvert: (trial: TrialClass) => void;
  onApprove?: (trial: TrialClass) => void;
  onReject?: (trial: TrialClass) => void;
}

export function TrialsTable({
  trials,
  onEdit,
  onDelete,
  onView,
  onConvert,
  onApprove,
  onReject,
}: TrialsTableProps) {
  const { t, direction } = useLanguage();

  const getStatusBadge = (status: TrialClass["status"]) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      pending_review: "bg-blue-100 text-blue-700 border-blue-200",
      completed: "bg-green-100 text-green-700 border-green-200",
      no_show: "bg-red-100 text-red-700 border-red-200",
      converted: "bg-purple-100 text-purple-700 border-purple-200",
    };
    
    // Map status to translation key
    const statusKeyMap: Record<string, string> = {
      pending: "pending",
      pending_review: "pendingReview",
      completed: "completed",
      no_show: "noShow",
      converted: "converted",
    };
    
    const translationKey = statusKeyMap[status] || status;
    
    return (
      <Badge
        variant="outline"
        className={cn("border", variants[status] || variants.pending)}
      >
        {t(`trials.status.${translationKey}`) || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Force English locale for dates
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    // Convert 24-hour format (HH:mm) to 12-hour format with AM/PM
    const time = timeString.substring(0, 5); // Get HH:mm
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const convertToStudentTimezone = (
    dateString: string,
    timeString: string,
    studentTimezone: string | undefined
  ): string => {
    if (!studentTimezone || studentTimezone === 'UTC' || studentTimezone === 'Africa/Cairo') {
      // If no timezone or same as Egypt, return original time formatted
      return formatTime(timeString);
    }

    try {
      const time = timeString.substring(0, 5); // Get HH:mm
      const [hours, minutes] = time.split(':');
      
      // Create a date string in ISO format
      const dateTimeStr = `${dateString}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
      
      // Create a date object - we need to interpret this as being in Egypt timezone
      // Since JavaScript Date doesn't support timezone in constructor, we'll use a workaround:
      // 1. Create date assuming it's UTC
      // 2. Get the UTC offset for Egypt at this date
      // 3. Adjust to get the correct UTC time
      // 4. Then format in student timezone
      
      const [year, month, day] = dateString.split('-');
      
      // Create a date object representing this time in UTC
      // We'll then adjust it based on timezone offsets
      const utcDate = new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      ));
      
      // Get the offset difference between Egypt and student timezone
      // We'll format the same UTC moment in both timezones and compare
      const egyptFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Africa/Cairo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      
      const studentFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: studentTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      
      // Format the UTC date in both timezones
      const egyptTime = egyptFormatter.format(utcDate);
      const studentTime = studentFormatter.format(utcDate);
      
      // Parse the times
      const egyptMatch = egyptTime.match(/(\d{1,2}):(\d{2})/);
      const studentMatch = studentTime.match(/(\d{1,2}):(\d{2})/);
      
      if (!egyptMatch || !studentMatch) {
        return formatTime(timeString);
      }
      
      // Calculate what UTC time would produce the desired Egypt time
      const egyptHour = parseInt(egyptMatch[1]);
      const egyptMin = parseInt(egyptMatch[2]);
      const studentHour = parseInt(studentMatch[1]);
      const studentMin = parseInt(studentMatch[2]);
      
      // Calculate the difference
      const egyptTotalMins = egyptHour * 60 + egyptMin;
      const studentTotalMins = studentHour * 60 + studentMin;
      const diffMins = studentTotalMins - egyptTotalMins;
      
      // Apply difference to original time
      const originalTotalMins = parseInt(hours) * 60 + parseInt(minutes);
      let adjustedTotalMins = originalTotalMins + diffMins;
      
      // Handle overflow/underflow
      if (adjustedTotalMins < 0) adjustedTotalMins += 24 * 60;
      if (adjustedTotalMins >= 24 * 60) adjustedTotalMins -= 24 * 60;
      
      const adjustedHours = Math.floor(adjustedTotalMins / 60);
      const adjustedMins = adjustedTotalMins % 60;
      
      // Format in 12-hour format
      const hour12 = adjustedHours === 0 ? 12 : adjustedHours > 12 ? adjustedHours - 12 : adjustedHours;
      const ampm = adjustedHours >= 12 ? 'PM' : 'AM';
      
      return `${hour12}:${adjustedMins.toString().padStart(2, '0')} ${ampm}`;
    } catch (error) {
      console.error('Error converting timezone:', error);
      // Fallback to original time
      return formatTime(timeString);
    }
  };

  return (
    <div className="rounded-md border border-gray-200 bg-white overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="min-w-[150px] whitespace-nowrap">{t("trials.student") || "Student"}</TableHead>
            <TableHead className="min-w-[150px] whitespace-nowrap">{t("trials.teacher") || "Teacher"}</TableHead>
            <TableHead className="min-w-[120px] whitespace-nowrap">{t("trials.course") || "Course"}</TableHead>
            <TableHead className="min-w-[100px] whitespace-nowrap">{t("trials.trialDate") || "Date"}</TableHead>
            <TableHead className="min-w-[140px] whitespace-nowrap">{t("trials.time") || "Time"}</TableHead>
            <TableHead className="min-w-[180px] whitespace-nowrap">{t("trials.studentTime") || "Student Time"}</TableHead>
            <TableHead className="min-w-[120px] whitespace-nowrap">{t("trials.status.label") || "Status"}</TableHead>
            <TableHead className={cn("min-w-[50px] w-[50px]", direction === "rtl" ? "text-left" : "text-right")}>
              {t("trials.actions") || "Actions"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trials.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-sm text-gray-500">
                    {t("trials.noTrials") || "No trial classes found"}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            trials.map((trial) => (
              <TableRow key={trial.id} className="hover:bg-gray-50/50">
                <TableCell className="font-medium min-w-[150px]">
                  <div className="truncate" title={trial.student?.full_name || `Student #${trial.student_id}`}>
                    {trial.student?.full_name || `Student #${trial.student_id}`}
                  </div>
                </TableCell>
                <TableCell className="min-w-[150px]">
                  <div className="truncate" title={trial.teacher?.user?.name || `Teacher #${trial.teacher_id}`}>
                    {trial.teacher?.user?.name || `Teacher #${trial.teacher_id}`}
                  </div>
                </TableCell>
                <TableCell className="min-w-[120px]">
                  <div className="truncate" title={trial.course?.name || `Course #${trial.course_id}`}>
                    {trial.course?.name || `Course #${trial.course_id}`}
                  </div>
                </TableCell>
                <TableCell className="min-w-[100px] whitespace-nowrap">{formatDate(trial.trial_date)}</TableCell>
                <TableCell className="min-w-[140px] whitespace-nowrap" dir="ltr">
                  {formatTime(trial.start_time)} - {formatTime(trial.end_time)}
                </TableCell>
                <TableCell className="min-w-[180px] whitespace-nowrap" dir="ltr">
                  {convertToStudentTimezone(
                    trial.trial_date,
                    trial.start_time,
                    trial.student?.timezone
                  )} - {convertToStudentTimezone(
                    trial.trial_date,
                    trial.end_time,
                    trial.student?.timezone
                  )}
                </TableCell>
                <TableCell className="min-w-[120px]">
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(trial.status)}
                    {trial.meet_link_used && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                        {t("trials.enteredMeeting") || "تم دخول الاجتماع"}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className={cn("flex", direction === "rtl" ? "justify-start" : "justify-end")}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={direction === "rtl" ? "start" : "end"} className="w-48">
                        <DropdownMenuItem
                          onClick={() => onView(trial)}
                          className="cursor-pointer"
                        >
                          <Eye className={cn("h-4 w-4", direction === "rtl" ? "ml-2" : "mr-2")} />
                          {t("trials.view") || "View"}
                        </DropdownMenuItem>

                        {trial.status === 'pending' && (
                          <DropdownMenuItem
                            onClick={() => onEdit(trial)}
                            className="cursor-pointer"
                          >
                            <Edit className={cn("h-4 w-4", direction === "rtl" ? "ml-2" : "mr-2")} />
                            {t("trials.edit") || "Edit"}
                          </DropdownMenuItem>
                        )}

                        {trial.status === 'pending_review' && onApprove && onReject && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onApprove(trial)}
                              className="cursor-pointer text-green-600 focus:text-green-700 focus:bg-green-50"
                            >
                              <CheckCircle className={cn("h-4 w-4", direction === "rtl" ? "ml-2" : "mr-2")} />
                              {t("trials.approve") || "Approve"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onReject(trial)}
                              className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                            >
                              <XCircle className={cn("h-4 w-4", direction === "rtl" ? "ml-2" : "mr-2")} />
                              {t("trials.reject") || "Reject"}
                            </DropdownMenuItem>
                          </>
                        )}

                        {(trial.status === 'pending' || trial.status === 'completed') && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onConvert(trial)}
                              className="cursor-pointer"
                            >
                              <RotateCcw className={cn("h-4 w-4", direction === "rtl" ? "ml-2" : "mr-2")} />
                              {t("trials.convert.button") || "Convert"}
                            </DropdownMenuItem>
                          </>
                        )}

                        {trial.status !== 'converted' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(trial)}
                              className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                            >
                              <Trash2 className={cn("h-4 w-4", direction === "rtl" ? "ml-2" : "mr-2")} />
                              {t("trials.delete") || "Delete"}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
