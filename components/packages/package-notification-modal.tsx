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
import { MessageSquare, User, Phone, Package, DollarSign, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const { t, direction } = useLanguage();

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  if (!pkg) return null;

  const isFirstNotification = !pkg.last_notification_sent;
  const notificationCount = pkg.notification_count || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left">
            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/20">
              <MessageSquare className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <span>{isFirstNotification ? t("packages.sendNotification") : t("packages.remindStudent")}</span>
          </DialogTitle>
          <DialogDescription className="mt-2 text-left">
            {isFirstNotification
              ? (t("packages.sendNotificationDescription") || `Send WhatsApp notification to ${pkg.student.full_name} about their finished package?`).replace("{name}", pkg.student.full_name)
              : (t("packages.remindStudentDescription") || `Send a reminder to ${pkg.student.full_name} about their unpaid package bill?`).replace("{name}", pkg.student.full_name)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Student Information */}
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className={cn("flex items-start gap-3", direction === "rtl" && "flex-row-reverse")}>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t("packages.student")}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {pkg.student.full_name}
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp Number */}
          {pkg.student.whatsapp && (
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className={cn("flex items-start gap-3", direction === "rtl" && "flex-row-reverse")}>
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t("packages.whatsapp") || "WhatsApp"}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 ltr" dir="ltr">
                    {pkg.student.whatsapp}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Package Information */}
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className={cn("flex items-start gap-3", direction === "rtl" && "flex-row-reverse")}>
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t("packages.package") || "Package"}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {t("packages.roundNumber")} {pkg.round_number}
                </p>
                <div className={cn("flex items-center gap-2 mt-1", direction === "rtl" && "flex-row-reverse")}>
                  <Clock className="h-3 w-3 text-gray-400" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {pkg.total_hours || 0} {t("packages.hours")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bill Summary */}
          {pkg.bills_summary && (
            <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <div className={cn("flex items-start gap-3", direction === "rtl" && "flex-row-reverse")}>
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-2">
                    {t("packages.billsSummary")}
                  </p>
                  <div className="space-y-1">
                    <div className={cn("flex items-center justify-between", direction === "rtl" && "flex-row-reverse")}>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {t("packages.totalAmount")}:
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {pkg.bills_summary.total_amount.toFixed(2)} {pkg.bills_summary.currency}
                      </span>
                    </div>
                    {pkg.bills_summary.unpaid_amount > 0 && (
                      <div className={cn("flex items-center justify-between", direction === "rtl" && "flex-row-reverse")}>
                        <span className="text-xs text-red-600 dark:text-red-400">
                          {t("packages.unpaidAmount")}:
                        </span>
                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                          {pkg.bills_summary.unpaid_amount.toFixed(2)} {pkg.bills_summary.currency}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Count (if not first notification) */}
          {!isFirstNotification && notificationCount > 0 && (
            <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
              <div className={cn("flex items-center gap-2", direction === "rtl" && "flex-row-reverse")}>
                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {(t("packages.notificationSentCount") || `This will be notification #${notificationCount + 1}`).replace("{count}", String(notificationCount + 1))}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className={cn(direction === "rtl" && "flex-row-reverse")}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t("packages.cancel")}
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isLoading}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isLoading ? (
              <span className={cn("flex items-center gap-2", direction === "rtl" && "flex-row-reverse")}>
                <span className="animate-spin">⏳</span>
                {t("packages.sending") || t("packages.saving")}
              </span>
            ) : (
              <span className={cn("flex items-center gap-2", direction === "rtl" && "flex-row-reverse")}>
                <MessageSquare className="h-4 w-4" />
                {isFirstNotification ? t("packages.sendWhatsApp") : t("packages.remindStudent")}
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
