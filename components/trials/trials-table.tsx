"use client";

import { Edit, Trash2, Eye, RotateCcw, CheckCircle, XCircle } from "lucide-react";
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
    return date.toLocaleDateString(t("common.locale") || "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  return (
    <div className="rounded-md border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead>{t("trials.student") || "Student"}</TableHead>
            <TableHead>{t("trials.teacher") || "Teacher"}</TableHead>
            <TableHead>{t("trials.course") || "Course"}</TableHead>
            <TableHead>{t("trials.trialDate") || "Date"}</TableHead>
            <TableHead>{t("trials.time") || "Time"}</TableHead>
            <TableHead>{t("trials.status.label") || "Status"}</TableHead>
            <TableHead className={cn("w-[120px]", direction === "rtl" ? "text-left" : "text-right")}>
              {t("trials.actions") || "Actions"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trials.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
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
                <TableCell className="font-medium">
                  {trial.student?.full_name || `Student #${trial.student_id}`}
                </TableCell>
                <TableCell>
                  {trial.teacher?.user?.name || `Teacher #${trial.teacher_id}`}
                </TableCell>
                <TableCell>{trial.course?.name || `Course #${trial.course_id}`}</TableCell>
                <TableCell>{formatDate(trial.trial_date)}</TableCell>
                <TableCell>
                  {formatTime(trial.start_time)} - {formatTime(trial.end_time)}
                </TableCell>
                <TableCell>
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
                  <div className={cn("flex gap-2", direction === "rtl" ? "justify-start" : "justify-end")}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onView(trial)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("trials.view") || "View"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {trial.status === 'pending' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(trial)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("trials.edit") || "Edit"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {trial.status === 'pending_review' && onApprove && onReject && (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onApprove(trial)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("trials.approve") || "Approve"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onReject(trial)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("trials.reject") || "Reject"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}

                    {(trial.status === 'pending' || trial.status === 'completed') && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onConvert(trial)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("trials.convert.button") || "Convert"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {trial.status !== 'converted' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(trial)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("trials.delete") || "Delete"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
