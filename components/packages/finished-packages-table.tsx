"use client";

import { useState } from "react";
import { MessageSquare, FileText, Plus, Download, Copy, Check } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FinishedPackage } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface FinishedPackagesTableProps {
  packages: FinishedPackage[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onSendWhatsApp: (pkg: FinishedPackage) => void;
  onViewBills: (pkg: FinishedPackage) => void;
  onCreatePackage: (pkg: FinishedPackage) => void;
  onDownloadPdf: (pkg: FinishedPackage) => void;
}

export function FinishedPackagesTable({
  packages,
  selectedIds,
  onSelect,
  onSelectAll,
  onSendWhatsApp,
  onViewBills,
  onCreatePackage,
  onDownloadPdf,
}: FinishedPackagesTableProps) {
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

  return (
    <div className="rounded-md border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onSelectAll(checked === true)}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>{t("packages.student")}</TableHead>
            <TableHead>{t("packages.roundNumber")}</TableHead>
            <TableHead>{t("packages.totalHours") || "Total Hours"}</TableHead>
            <TableHead>{t("packages.completionDate")}</TableHead>
            <TableHead>{t("packages.billsSummary")}</TableHead>
            <TableHead>{t("packages.lastNotificationSent")}</TableHead>
            <TableHead className={cn("w-[200px]", direction === "rtl" ? "text-left" : "text-right")}>
              {t("students.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-sm text-gray-500">
                    {t("packages.noPackagesFound")}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            packages.map((pkg) => {
              const isSelected = selectedIds.includes(String(pkg.id));
              const billsSummary = pkg.bills_summary;
              return (
                <TableRow key={pkg.id} className={isSelected ? "bg-gray-50" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onSelect(String(pkg.id))}
                      aria-label={`Select package ${pkg.id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{pkg.student.full_name}</div>
                      {pkg.student.whatsapp && (
                        <button
                          onClick={() => copyWhatsApp(pkg.student.whatsapp!)}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                        >
                          {copiedWhatsApp === pkg.student.whatsapp ? (
                            <>
                              <Check className="h-3 w-3" />
                              {t("packages.whatsappCopied")}
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
                  </TableCell>
                  <TableCell>{pkg.round_number}</TableCell>
                  <TableCell>{pkg.total_hours || 0}h</TableCell>
                  <TableCell>{formatDate(pkg.completion_date)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {billsSummary.total_amount.toFixed(2)} {billsSummary.currency}
                      </div>
                      <div className="text-gray-500">
                        {t("packages.unpaidAmount")}: {billsSummary.unpaid_amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {billsSummary.bill_count} {t("packages.billCount")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDateTime(pkg.last_notification_sent)}</div>
                      {pkg.notification_count && (
                        <div className="text-xs text-gray-400">
                          {pkg.notification_count} {t("packages.notificationCount")}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={cn("flex flex-wrap gap-2", direction === "rtl" ? "flex-row-reverse" : "")}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSendWhatsApp(pkg)}
                        className="text-xs"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {t("packages.sendWhatsApp")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewBills(pkg)}
                        className="text-xs"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        {t("packages.viewBills")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCreatePackage(pkg)}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {t("packages.createNewPackage")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownloadPdf(pkg)}
                        className="text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        {t("packages.downloadPdf")}
                      </Button>
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
