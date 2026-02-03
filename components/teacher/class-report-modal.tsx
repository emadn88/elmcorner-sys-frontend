"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeacherService } from "@/lib/services/teacher.service";
import { TeacherClass } from "@/lib/api/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useLanguage } from "@/contexts/language-context";
import { AlertCircle } from "lucide-react";

interface ClassReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItem: TeacherClass;
  onUpdate: () => void;
}

export function ClassReportModal({
  open,
  onOpenChange,
  classItem,
  onUpdate,
}: ClassReportModalProps) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<"present" | "cancelled">("present");
  const [evaluation, setEvaluation] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [notes, setNotes] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setStatus("present");
      setEvaluation("");
      setReportDetails("");
      setNotes("");
      setCancellationReason("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (sendWhatsApp: boolean) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (status === "present") {
        if (!evaluation || !reportDetails) {
          setError(t("teacher.fillRequiredFields") || "Please fill all required fields");
          setIsSubmitting(false);
          return;
        }

        await TeacherService.submitClassReport(classItem.id, {
          status: "attended",
          student_evaluation: evaluation,
          class_report: reportDetails,
          notes: notes,
          send_whatsapp: sendWhatsApp,
        });
      } else {
        if (!cancellationReason.trim()) {
          setError(t("teacher.cancellationReasonRequired") || "Cancellation reason is required");
          setIsSubmitting(false);
          return;
        }

        await TeacherService.requestClassCancellation(classItem.id, cancellationReason);
      }

      onUpdate();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || t("teacher.failedToSubmit") || "Failed to submit report");
      console.error("Error submitting report:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const evaluationOptions = [
    { value: "good", label: t("teacher.evaluationGood") || "Good" },
    { value: "very_good", label: t("teacher.evaluationVeryGood") || "Very Good" },
    { value: "excellent", label: t("teacher.evaluationExcellent") || "Excellent" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("teacher.writeReport") || "Write Report"}</DialogTitle>
          <DialogDescription>
            {t("teacher.reportDescription") || "Submit class report and evaluation"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Status Selection */}
            <div>
              <Label className="text-base font-semibold">
                {t("teacher.reportStatus") || "Status"} *
              </Label>
              <Select value={status} onValueChange={(value: "present" | "cancelled") => setStatus(value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">
                    {t("teacher.reportStatusPresent") || "Present"}
                  </SelectItem>
                  <SelectItem value="cancelled">
                    {t("teacher.reportStatusCancelled") || "Cancelled"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Fields Based on Status */}
            {status === "present" ? (
              <>
                {/* Evaluation Dropdown */}
                <div>
                  <Label className="text-base font-semibold">
                    {t("teacher.evaluation") || "Evaluation"} *
                  </Label>
                  <Select value={evaluation} onValueChange={setEvaluation}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder={t("teacher.selectEvaluation") || "Select evaluation"} />
                    </SelectTrigger>
                    <SelectContent>
                      {evaluationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Report Details */}
                <div>
                  <Label className="text-base font-semibold">
                    {t("teacher.reportDetails") || "Report Details"} *
                  </Label>
                  <Textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder={t("teacher.reportDetailsPlaceholder") || "Enter class report details..."}
                    className="mt-2 min-h-[120px]"
                    rows={5}
                  />
                </div>

                {/* Notes */}
                <div>
                  <Label className="text-base font-semibold">
                    {t("teacher.notes") || "Notes"}
                  </Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("teacher.notesPlaceholder") || "Additional notes (optional)..."}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                {/* Submit Button for Present Status */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={() => handleSubmit(true)}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSubmitting 
                      ? (t("teacher.submitting") || "Submitting...")
                      : (t("teacher.submitAndSendWhatsApp") || "Submit and Send WhatsApp")
                    }
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Cancellation Reason */}
                <div>
                  <Label className="text-base font-semibold">
                    {t("teacher.cancellationReason") || "Cancellation Reason"} *
                  </Label>
                  <Textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder={t("teacher.cancellationReasonPlaceholder") || "Please provide a reason for cancellation..."}
                    className="mt-2 min-h-[120px]"
                    rows={5}
                  />
                </div>

                {/* Send to Admin Button */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting || !cancellationReason.trim()}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isSubmitting
                      ? (t("teacher.sending") || "Sending...")
                      : (t("teacher.sendToAdmin") || "Send to Admin")
                    }
                  </Button>
                </div>
              </>
            )}

            {/* Cancel Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t("teacher.cancel") || "Cancel"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
