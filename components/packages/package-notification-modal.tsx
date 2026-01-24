"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FinishedPackage } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { MessageSquare } from "lucide-react";

interface PackageNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: FinishedPackage | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function PackageNotificationModal({
  open,
  onOpenChange,
  package: pkg,
  onConfirm,
  isLoading = false,
}: PackageNotificationModalProps) {
  const { t } = useLanguage();

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  if (!pkg) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t("packages.sendNotification")}
          </DialogTitle>
          <DialogDescription>
            Send WhatsApp notification to {pkg.student.full_name} about their finished package?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div>
            <strong>Student:</strong> {pkg.student.full_name}
          </div>
          {pkg.student.whatsapp && (
            <div>
              <strong>WhatsApp:</strong> {pkg.student.whatsapp}
            </div>
          )}
          <div>
            <strong>Package:</strong> Round {pkg.round_number}, {pkg.total_hours || 0} hours
          </div>
          {pkg.bills_summary && (
            <div>
              <strong>Total Amount:</strong> {pkg.bills_summary.total_amount.toFixed(2)} {pkg.bills_summary.currency}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t("packages.cancel")}
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? t("packages.saving") : t("packages.sendWhatsApp")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
