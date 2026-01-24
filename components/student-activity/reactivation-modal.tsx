"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StudentActivity } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface ReactivationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentActivity | null;
  onConfirm: (message?: string) => Promise<void>;
  isLoading?: boolean;
}

export function ReactivationModal({
  open,
  onOpenChange,
  student,
  onConfirm,
  isLoading = false,
}: ReactivationModalProps) {
  const { t, direction } = useLanguage();
  const [message, setMessage] = useState("");

  const handleConfirm = async () => {
    await onConfirm(message || undefined);
    setMessage("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setMessage("");
    onOpenChange(false);
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(direction === "rtl" && "text-right")}>
        <DialogHeader>
          <DialogTitle>
            {t("studentActivity.sendReactivationOffer") || "Send Reactivation Offer"}
          </DialogTitle>
          <DialogDescription>
            {t("studentActivity.reactivationDescription") || 
              "Send a WhatsApp message to encourage the student to resume their classes."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className={cn(direction === "rtl" && "text-right")}>
              {t("studentActivity.student") || "Student"}
            </Label>
            <p className="font-medium text-gray-900 mt-1">{student.full_name}</p>
            {student.whatsapp && (
              <p className="text-sm text-gray-500 mt-1">
                {t("studentActivity.whatsapp") || "WhatsApp"}: {student.whatsapp}
              </p>
            )}
            {!student.whatsapp && (
              <p className="text-sm text-red-500 mt-1">
                {t("studentActivity.noWhatsApp") || "Student does not have a WhatsApp number"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="message" className={cn(direction === "rtl" && "text-right")}>
              {t("studentActivity.customMessage") || "Custom Message (Optional)"}
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("studentActivity.messagePlaceholder") || 
                "Leave empty to use default template message..."}
              className={cn("mt-1", direction === "rtl" && "text-right")}
              rows={4}
              disabled={!student.whatsapp}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("studentActivity.messageHint") || 
                "If left empty, a default reactivation message will be sent."}
            </p>
          </div>
        </div>

        <DialogFooter className={cn(direction === "rtl" && "flex-row-reverse")}>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !student.whatsapp}
          >
            {isLoading
              ? t("studentActivity.sending") || "Sending..."
              : t("studentActivity.send") || "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
