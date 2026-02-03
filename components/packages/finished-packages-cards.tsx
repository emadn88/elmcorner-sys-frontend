"use client";

import { useState } from "react";
import { 
  MessageSquare, 
  FileText, 
  Plus, 
  Download, 
  Copy, 
  Check, 
  User,
  Calendar,
  DollarSign,
  Clock,
  Bell,
  CheckCircle2,
  Package
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FinishedPackage } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface FinishedPackagesCardsProps {
  packages: FinishedPackage[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onSendWhatsApp: (pkg: FinishedPackage) => void;
  onViewBills: (pkg: FinishedPackage) => void;
  onMarkAsPaid: (pkg: FinishedPackage) => void;
  onDownloadPdf: (pkg: FinishedPackage) => void;
}

export function FinishedPackagesCards({
  packages,
  selectedIds,
  onSelect,
  onSelectAll,
  onSendWhatsApp,
  onViewBills,
  onMarkAsPaid,
  onDownloadPdf,
}: FinishedPackagesCardsProps) {
  const { t, direction } = useLanguage();
  const [copiedWhatsApp, setCopiedWhatsApp] = useState<string | null>(null);
  const allSelected = packages.length > 0 && selectedIds.length === packages.length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return t("packages.neverSent");
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return t("activity.justNow") || "Just now";
    if (diffInHours < 24) return t("activity.hoursAgo", { count: diffInHours }) || `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return t("activity.daysAgo", { count: diffInDays }) || `${diffInDays} days ago`;
    
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyWhatsApp = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedWhatsApp(phone);
    setTimeout(() => setCopiedWhatsApp(null), 2000);
  };

  const getDaysSinceFinished = (updatedAt: string) => {
    const finishedDate = new Date(updatedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - finishedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (packages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">
          {t("packages.noPackagesFound")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Select All Checkbox */}
      <div className="flex items-center gap-2 px-1">
        <Checkbox
          checked={allSelected}
          onCheckedChange={(checked) => onSelectAll(checked === true)}
          aria-label="Select all"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("packages.selectedCount", { count: selectedIds.length }) || `${selectedIds.length} selected`}
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {packages.map((pkg) => {
          const isSelected = selectedIds.includes(String(pkg.id));
          const billsSummary = pkg.bills_summary;
          const daysSinceFinished = getDaysSinceFinished(pkg.updated_at);
          const hasUnpaidBills = billsSummary.unpaid_amount > 0;
          const notificationSent = !!pkg.last_notification_sent;

          return (
            <Card
              key={pkg.id}
              className={cn(
                "relative transition-all duration-200 hover:shadow-xl border-2 overflow-hidden",
                isSelected 
                  ? "ring-2 ring-purple-500 border-purple-400 shadow-lg" 
                  : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
              )}
            >
              {/* Colored Top Border */}
              <div className={cn(
                "h-1 w-full",
                notificationSent ? "bg-blue-500" : "bg-orange-500"
              )} />

              {/* Selection Checkbox */}
              <div className="absolute top-2 right-2 z-10">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onSelect(String(pkg.id))}
                  aria-label={`Select package ${pkg.id}`}
                  className="bg-white dark:bg-gray-800 shadow-md"
                />
              </div>

              <CardContent className="p-2.5 space-y-2">
                {/* Student Header */}
                <div className="flex items-start gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 truncate">
                      {pkg.student.full_name}
                    </h3>
                    {pkg.student.whatsapp && (
                      <button
                        onClick={() => copyWhatsApp(pkg.student.whatsapp!)}
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 mt-0.5 transition-colors font-medium"
                      >
                        {copiedWhatsApp === pkg.student.whatsapp ? (
                          <>
                            <Check className="h-3 w-3" />
                            {t("packages.whatsappCopied") || "Copied!"}
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            {pkg.student.whatsapp}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Package Info - Simplified Grid */}
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="bg-gray-50 dark:bg-gray-800 p-1.5 rounded-lg text-center border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Package className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium mb-1">{t("packages.roundNumber") || "Round"}</p>
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100">#{pkg.round_number}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-1.5 rounded-lg text-center border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium mb-1">{t("packages.totalHours") || "Hours"}</p>
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{pkg.total_hours || 0}h</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-1.5 rounded-lg text-center border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium mb-1">{t("packages.completionDate") || "Days"}</p>
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{daysSinceFinished}d</p>
                  </div>
                </div>

                {/* Bills Summary - Simplified */}
                <div className="p-2 rounded-lg border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded bg-gray-100 dark:bg-gray-700">
                        <DollarSign className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {t("packages.billsSummary") || "Bills"}
                      </span>
                    </div>
                    {hasUnpaidBills && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5 font-bold">
                        {t("packages.unpaidAmount") || "Unpaid"}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {billsSummary.total_amount.toFixed(2)} {billsSummary.currency}
                    </p>
                    {hasUnpaidBills && (
                      <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                        {t("packages.unpaidAmount")}: {billsSummary.unpaid_amount.toFixed(2)} {billsSummary.currency}
                      </p>
                    )}
                  </div>
                </div>

                {/* Show Bill Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewBills(pkg)}
                  className={cn(
                    "w-full text-sm border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300",
                    direction === "rtl" && "flex-row-reverse"
                  )}
                >
                  <FileText className="h-3.5 w-3.5" />
                  {t("packages.showBill") || t("packages.viewBills") || "Show Bill"}
                </Button>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onSendWhatsApp(pkg)}
                    className={cn(
                      "text-sm bg-teal-600 hover:bg-teal-700 text-white",
                      direction === "rtl" && "flex-row-reverse"
                    )}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    {pkg.notification_count && pkg.notification_count > 0
                      ? t("packages.remindStudent") || "Remind"
                      : t("packages.sendWhatsApp") || "WhatsApp"}
                    {pkg.notification_count && pkg.notification_count > 0 && (
                      <span className="px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-bold">
                        {pkg.notification_count}
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onMarkAsPaid(pkg)}
                    className={cn(
                      "text-sm bg-emerald-600 hover:bg-emerald-700 text-white",
                      direction === "rtl" && "flex-row-reverse"
                    )}
                    disabled={pkg.bills_summary?.unpaid_amount === 0}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t("packages.markAsPaid") || "Mark as Paid"}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onDownloadPdf(pkg)}
                    className={cn(
                      "text-sm bg-slate-600 hover:bg-slate-700 text-white col-span-2",
                      direction === "rtl" && "flex-row-reverse"
                    )}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {t("packages.downloadPdf") || "PDF"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
