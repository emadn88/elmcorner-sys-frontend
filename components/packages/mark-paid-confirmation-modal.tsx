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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { FinishedPackage } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface MarkPaidConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: FinishedPackage | null;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export function MarkPaidConfirmationModal({
  open,
  onOpenChange,
  package: pkg,
  onConfirm,
  isLoading = false,
}: MarkPaidConfirmationModalProps) {
  const { t, direction } = useLanguage();
  const [paymentReason, setPaymentReason] = useState("");

  const handleConfirm = () => {
    if (!paymentReason.trim()) return;
    onConfirm(paymentReason);
    setPaymentReason("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setPaymentReason("");
    onOpenChange(false);
  };

  if (!pkg) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[500px]", direction === "rtl" && "rtl")}>
        <DialogHeader>
          <div className={cn("flex items-center gap-3", direction === "rtl" && "flex-row-reverse")}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className={cn("flex-1", direction === "rtl" && "text-right")}>
              <DialogTitle className={cn("text-xl", direction === "rtl" && "text-right")}>
                {t("packages.markAsPaid") || "Mark as Paid"}
              </DialogTitle>
              <DialogDescription className={cn("mt-1", direction === "rtl" && "text-right")}>
                {t("packages.confirmMarkAsPaid") || "Are you sure you want to mark this package as paid?"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4 space-y-3">
          <div className={cn("p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700", direction === "rtl" && "text-right")}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("packages.student") || "Student"}:
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {pkg.student.full_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("packages.roundNumber") || "Round"}:
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {pkg.round_number}
                </span>
              </div>
              {pkg.bills_summary && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t("packages.totalAmount") || "Total Amount"}:
                    </span>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {pkg.bills_summary.total_amount.toFixed(2)} {pkg.bills_summary.currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t("packages.unpaidAmount") || "Unpaid Amount"}:
                    </span>
                    <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                      {pkg.bills_summary.unpaid_amount.toFixed(2)} {pkg.bills_summary.currency}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <p className={cn("text-sm text-gray-600 dark:text-gray-400", direction === "rtl" && "text-right")}>
            {t("packages.markAsPaidWarning") || "All bills for this package will be marked as paid. This action cannot be undone."}
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="payment_reason">
              {t("billing.markPaidForm.paymentReason") || "Payment Reason"} *
            </Label>
            <Textarea
              id="payment_reason"
              value={paymentReason}
              onChange={(e) => setPaymentReason(e.target.value)}
              rows={3}
              placeholder={t("billing.markPaidForm.paymentReasonPlaceholder") || "Enter the reason for marking this package as paid..."}
              className={cn(direction === "rtl" && "text-right")}
            />
          </div>
        </div>

        <DialogFooter className={cn(direction === "rtl" && "flex-row-reverse")}>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            {t("packages.cancel") || "Cancel"}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !paymentReason.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isLoading ? (t("packages.saving") || "Saving...") : (t("packages.markAsPaid") || "Mark as Paid")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
