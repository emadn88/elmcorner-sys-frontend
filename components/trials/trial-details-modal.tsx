"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TrialClass } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TrialDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trial: TrialClass | null;
}

export function TrialDetailsModal({
  open,
  onOpenChange,
  trial,
}: TrialDetailsModalProps) {
  const { t, direction } = useLanguage();

  if (!trial) return null;

  const getStatusBadge = (status: TrialClass["status"]) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      pending_review: "bg-blue-100 text-blue-700 border-blue-200",
      completed: "bg-green-100 text-green-700 border-green-200",
      no_show: "bg-red-100 text-red-700 border-red-200",
      converted: "bg-purple-100 text-purple-700 border-purple-200",
    };
    
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
    return format(date, "PPP");
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return format(date, "PPP 'at' p");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("trials.viewDetails") || "Trial Details"}</DialogTitle>
          <DialogDescription>
            {t("trials.viewDetailsDescription") || "Complete information about the trial class"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div>
            <h3 className="font-semibold mb-2">{t("trials.status.label") || "Status"}</h3>
            <div className="flex items-center gap-2">
              {getStatusBadge(trial.status)}
              {trial.meet_link_used && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {t("trials.enteredMeeting") || "تم دخول الاجتماع"}
                </Badge>
              )}
            </div>
          </div>

          {/* Student Information */}
          <div>
            <h3 className="font-semibold mb-2">
              {t("trials.student") || "Student Information"}
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p>
                <span className="font-medium">{t("trials.student") || "Student"}:</span>{" "}
                {trial.student?.full_name || `Student #${trial.student_id}`}
              </p>
              {trial.student?.email && (
                <p>
                  <span className="font-medium">{t("common.email") || "Email"}:</span>{" "}
                  {trial.student.email}
                </p>
              )}
              {trial.student?.whatsapp && (
                <p>
                  <span className="font-medium">{t("common.whatsapp") || "WhatsApp"}:</span>{" "}
                  {trial.student.whatsapp}
                </p>
              )}
              {trial.student?.country && (
                <p>
                  <span className="font-medium">{t("common.country") || "Country"}:</span>{" "}
                  {trial.student.country}
                </p>
              )}
            </div>
          </div>

          {/* Teacher Information */}
          <div>
            <h3 className="font-semibold mb-2">
              {t("trials.teacher") || "Teacher Information"}
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>
                <span className="font-medium">{t("trials.teacher") || "Teacher"}:</span>{" "}
                {trial.teacher?.user?.name || `Teacher #${trial.teacher_id}`}
              </p>
            </div>
          </div>

          {/* Course Information */}
          <div>
            <h3 className="font-semibold mb-2">
              {t("trials.course") || "Course Information"}
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>
                <span className="font-medium">{t("trials.course") || "Course"}:</span>{" "}
                {trial.course?.name || `Course #${trial.course_id}`}
              </p>
            </div>
          </div>

          {/* Schedule Information */}
          <div>
            <h3 className="font-semibold mb-2">
              {t("trials.schedule") || "Schedule Information"}
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p>
                <span className="font-medium">{t("trials.trialDate") || "Date"}:</span>{" "}
                {formatDate(trial.trial_date)}
              </p>
              <p>
                <span className="font-medium">{t("trials.time") || "Time"}:</span>{" "}
                {formatTime(trial.start_time)} - {formatTime(trial.end_time)}
              </p>
              {trial.meet_link_accessed_at && (
                <p>
                  <span className="font-medium">
                    {t("trials.meetEnteredAt") || "Meet Entered At"}:{" "}
                  </span>
                  {formatDateTime(trial.meet_link_accessed_at)}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          {trial.notes && (
            <div>
              <h3 className="font-semibold mb-2">{t("trials.notes") || "Notes"}</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{trial.notes}</p>
              </div>
            </div>
          )}

          {/* Converted Package */}
          {trial.converted_to_package_id && trial.converted_package && (
            <div>
              <h3 className="font-semibold mb-2">
                {t("trials.convertedPackage") || "Converted Package"}
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p>
                  <span className="font-medium">
                    {t("trials.packageId") || "Package ID"}:{" "}
                  </span>
                  {trial.converted_to_package_id}
                </p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div>
            <h3 className="font-semibold mb-2">
              {t("trials.timestamps") || "Timestamps"}
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">{t("common.createdAt") || "Created At"}:</span>{" "}
                {formatDateTime(trial.created_at)}
              </p>
              <p>
                <span className="font-medium">{t("common.updatedAt") || "Updated At"}:</span>{" "}
                {formatDateTime(trial.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
