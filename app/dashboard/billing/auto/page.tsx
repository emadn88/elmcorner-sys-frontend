"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  MessageCircle,
  CheckCircle,
  XCircle,
  Download,
  Calendar,
  MoreVertical,
  Eye,
  Loader2,
} from "lucide-react";
import { BillingService } from "@/lib/services/billing.service";
import {
  Bill,
  BillingStatistics,
  BillingResponse,
  MarkBillPaidData,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AutoBillingPage() {
  const { t, direction } = useLanguage();
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [billingData, setBillingData] = useState<BillingResponse | null>(null);
  const [statistics, setStatistics] = useState<BillingStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [activeTab, setActiveTab] = useState<'paid' | 'unpaid'>('unpaid');
  const [isBillDetailsOpen, setIsBillDetailsOpen] = useState(false);
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sendingBillId, setSendingBillId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Mark paid form
  const [markPaidForm, setMarkPaidForm] = useState<MarkBillPaidData>({
    payment_method: "",
    payment_date: format(new Date(), "yyyy-MM-dd"),
    payment_reason: "",
  });

  useEffect(() => {
    loadBillingData();
  }, [selectedYear, selectedMonth]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const data = await BillingService.getBills({
        year: selectedYear,
        month: selectedMonth,
        is_custom: false, // Only auto bills
      });
      
      setBillingData(data);
      setStatistics(data.statistics);
    } catch (error: any) {
      console.error('Error loading billing data:', error);
      setNotification({
        type: "error",
        message: error.message || t("billing.failedToLoad") || "Failed to load billing data",
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBill = async (bill: Bill) => {
    try {
      const billDetails = await BillingService.getBill(bill.id);
      setSelectedBill(billDetails as any);
      setIsBillDetailsOpen(true);
    } catch (error: any) {
      setNotification({
        type: "error",
        message: error.message || t("billing.failedToLoad") || "Failed to load bill details",
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleDownloadPDF = async (billId: number) => {
    try {
      const blob = await BillingService.downloadPDF(billId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bill-${billId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      setNotification({
        type: "error",
        message: error.message || t("billing.failedToDownload") || "Failed to download PDF",
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleSendWhatsApp = async (bill: Bill) => {
    try {
      setSendingBillId(bill.id);
      setOpenDropdownId(bill.id); // Keep dropdown open
      await BillingService.sendViaWhatsApp(bill.id);
      setNotification({
        type: "success",
        message: t("billing.whatsAppSent") || "Bill sent via WhatsApp successfully",
      });
      setTimeout(() => setNotification(null), 3000);
      await loadBillingData();
    } catch (error: any) {
      setNotification({
        type: "error",
        message: error.message || t("billing.failedToSend") || "Failed to send WhatsApp",
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setSendingBillId(null);
      setOpenDropdownId(null); // Close dropdown after sending
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedBill) return;

    try {
      setIsSaving(true);
      await BillingService.markAsPaid(selectedBill.id, markPaidForm);
      setNotification({
        type: "success",
        message: t("billing.successMarkedPaid") || "Bill marked as paid successfully",
      });
      setTimeout(() => setNotification(null), 3000);
      setIsMarkPaidOpen(false);
      await loadBillingData();
    } catch (error: any) {
      setNotification({
        type: "error",
        message: error.message || t("billing.failedToMarkPaid") || "Failed to mark bill as paid",
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatHours = (hours: number | string | undefined | null): string => {
    if (hours === null || hours === undefined) return "0.00";
    const numHours = typeof hours === 'number' ? hours : parseFloat(String(hours || '0'));
    return isNaN(numHours) ? "0.00" : numHours.toFixed(2);
  };

  const getMonthName = (month: number, year?: number) => {
    const yearToUse = year || selectedYear;
    return format(new Date(yearToUse, month - 1, 1), "MMMM yyyy");
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-all";
    // Normalize status to handle any case variations or truncation
    const normalizedStatus = status?.toLowerCase()?.trim() || "";
    switch (normalizedStatus) {
      case "paid":
        return (
          <span className={cn(baseClasses, "bg-green-50 text-green-700 border border-green-200")}>
            {t("billing.statuses.paid") || "Paid"}
          </span>
        );
      case "sent":
        return (
          <span className={cn(baseClasses, "bg-blue-50 text-blue-700 border border-blue-200")}>
            {t("billing.statuses.sent") || "Sent"}
          </span>
        );
      case "pending":
        return (
          <span className={cn(baseClasses, "bg-amber-50 text-amber-700 border border-amber-200")}>
            {t("billing.statuses.pending") || "Pending"}
          </span>
        );
      default:
        return <span className={cn(baseClasses, "bg-gray-50 text-gray-700 border border-gray-200")}>{status || "Unknown"}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading billing data...</p>
        </div>
      </div>
    );
  }

  // Collect all auto bills (non-custom)
  const allAutoBills: Bill[] = [];
  if (billingData?.bills) {
    Object.values(billingData.bills).forEach((data) => {
      allAutoBills.push(...data.bills.filter(bill => !bill.is_custom));
    });
  }

  const paidBills = allAutoBills.filter(bill => bill.status === 'paid');
  const unpaidBills = allAutoBills.filter(bill => bill.status !== 'paid');

  return (
    <div
      className={cn(
        "flex flex-col gap-6 p-6",
        direction === "rtl" ? "text-right" : "text-left"
      )}
    >
      {/* Notification */}
      {notification && (
        <div
          className={cn(
            "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg",
            notification.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          )}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("sidebar.autoBillings") || "Auto Billings"}
        </h1>
        <p className="text-gray-600 mt-2">
          {t("billing.autoBillsDescription") || "Automatically generated bills from completed lessons"}
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("billing.statistics.dueBillings") || "Due Billings"}
              </CardTitle>
              <XCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold space-y-1">
                {Object.entries(statistics.due.total).length > 0 ? (
                  Object.entries(statistics.due.total).map(([currency, amount]) => (
                    <div key={currency} className="text-lg">
                      {formatCurrency(amount, currency)}
                    </div>
                  ))
                ) : (
                  <div className="text-lg text-gray-400">0.00</div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {statistics.due.count}{" "}
                {statistics.due.count === 1
                  ? t("billing.statistics.bill") || "bill"
                  : t("billing.statistics.bills") || "bills"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("billing.statistics.paidBillings") || "Paid Billings"}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold space-y-1">
                {Object.entries(statistics.paid.total).length > 0 ? (
                  Object.entries(statistics.paid.total).map(([currency, amount]) => (
                    <div key={currency} className="text-lg">
                      {formatCurrency(amount, currency)}
                    </div>
                  ))
                ) : (
                  <div className="text-lg text-gray-400">0.00</div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {statistics.paid.count}{" "}
                {statistics.paid.count === 1
                  ? t("billing.statistics.bill") || "bill"
                  : t("billing.statistics.bills") || "bills"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("billing.statistics.unpaidBillings") || "Unpaid Billings"}
              </CardTitle>
              <CreditCard className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold space-y-1">
                {Object.entries(statistics.unpaid.total).length > 0 ? (
                  Object.entries(statistics.unpaid.total).map(([currency, amount]) => (
                    <div key={currency} className="text-lg">
                      {formatCurrency(amount, currency)}
                    </div>
                  ))
                ) : (
                  <div className="text-lg text-gray-400">0.00</div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {statistics.unpaid.count}{" "}
                {statistics.unpaid.count === 1
                  ? t("billing.statistics.bill") || "bill"
                  : t("billing.statistics.bills") || "bills"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Year and Month Selector - Horizontal */}
      <div className="flex gap-3 items-center mb-4">
        <Select
          value={selectedYear.toString()}
          onValueChange={(value) => setSelectedYear(parseInt(value))}
        >
          <SelectTrigger className="w-28 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(
              (year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        <div className="flex-1 flex gap-1.5 overflow-x-auto pb-1">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
            const isActive = month === selectedMonth;
            const isCurrentMonth = month === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear();
            return (
              <Button
                key={month}
                variant={isActive ? "default" : "outline"}
                onClick={() => setSelectedMonth(month)}
                size="sm"
                className={cn(
                  "min-w-[60px] px-2 h-9 text-xs transition-all duration-200 flex-shrink-0",
                  isActive 
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 border-blue-600" 
                    : "hover:bg-gray-100 border-gray-300",
                  isCurrentMonth && !isActive && "border-blue-300 bg-blue-50"
                )}
              >
                {format(new Date(selectedYear, month - 1, 1), "MMM")}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Horizontal Tabs for Paid/Unpaid */}
      <div className="flex gap-4 mb-4">
        <Card 
          className={cn(
            "flex-1 cursor-pointer transition-all duration-200 hover:shadow-md",
            activeTab === 'unpaid' 
              ? "ring-2 ring-red-500 shadow-lg bg-red-50/50" 
              : "hover:bg-gray-50"
          )}
          onClick={() => setActiveTab('unpaid')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                  {t("billing.unpaidBillings") || "Unpaid Billings"}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {unpaidBills.length} {unpaidBills.length === 1 ? t("billing.statistics.bill") || "bill" : t("billing.statistics.bills") || "bills"}
                </p>
              </div>
              <XCircle className={cn(
                "h-8 w-8",
                activeTab === 'unpaid' ? "text-red-600" : "text-gray-400"
              )} />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "flex-1 cursor-pointer transition-all duration-200 hover:shadow-md",
            activeTab === 'paid' 
              ? "ring-2 ring-green-500 shadow-lg bg-green-50/50" 
              : "hover:bg-gray-50"
          )}
          onClick={() => setActiveTab('paid')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                  {t("billing.paidBillings") || "Paid Billings"}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {paidBills.length} {paidBills.length === 1 ? t("billing.statistics.bill") || "bill" : t("billing.statistics.bills") || "bills"}
                </p>
              </div>
              <CheckCircle className={cn(
                "h-8 w-8",
                activeTab === 'paid' ? "text-green-600" : "text-gray-400"
              )} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paid Auto Billings Section */}
      {activeTab === 'paid' && paidBills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {t("billing.paidBillings") || "Paid Billings"} ({paidBills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-200">
                    <TableHead className="h-12 font-semibold text-gray-900">{t("billing.student") || "Student"}</TableHead>
                    <TableHead className="h-12 text-center font-semibold text-gray-900">{t("billing.totalHours") || "Hours"}</TableHead>
                    <TableHead className="h-12 text-right font-semibold text-gray-900">{t("billing.amount") || "Amount"}</TableHead>
                    <TableHead className="h-12 text-center font-semibold text-gray-900">{t("billing.currency") || "Currency"}</TableHead>
                    <TableHead className="h-12 text-center font-semibold text-gray-900">{t("billing.status") || "Status"}</TableHead>
                    <TableHead className="h-12 text-center font-semibold text-gray-900">{t("billing.billDate") || "Bill Date"}</TableHead>
                    <TableHead className="h-12 text-center font-semibold text-gray-900">{t("payment.paidOn") || "Paid On"}</TableHead>
                    <TableHead className="h-12 text-center font-semibold text-gray-900 w-20">{t("billing.actions.title") || "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paidBills.map((bill) => (
                    <TableRow 
                      key={bill.id} 
                      className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-150 group"
                    >
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {bill.student?.student?.full_name || "Unknown Student"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <span className="text-sm font-medium text-gray-700">
                          {formatHours(bill.total_hours)} <span className="text-gray-500 text-xs">{t("billing.hours") || "hrs"}</span>
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <span className="text-base font-semibold text-gray-900">
                          {formatCurrency(bill.amount, bill.currency)}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          {bill.currency}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        {getStatusBadge(bill.status)}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <span className="text-sm text-gray-600">
                          {format(new Date(bill.bill_date), "MMM d, yyyy")}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <span className="text-sm text-gray-600">
                          {bill.payment_date
                            ? format(new Date(bill.payment_date), "MMM d, yyyy")
                            : <span className="text-gray-400">-</span>}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100 data-[state=open]:bg-gray-100"
                              >
                                <MoreVertical className="h-4 w-4 text-gray-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleViewBill(bill)}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                {t("billing.actions.view") || "View"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDownloadPDF(bill.id)}
                                className="cursor-pointer"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                {t("billing.actions.downloadPdf") || "Download PDF"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unpaid Auto Billings Section */}
      {activeTab === 'unpaid' && unpaidBills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              {t("billing.unpaidBillings") || "Unpaid Billings"} ({unpaidBills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-200">
                    <TableHead className="h-12 font-semibold text-gray-900">{t("billing.student") || "Student"}</TableHead>
                    <TableHead className="h-12 text-center font-semibold text-gray-900">{t("billing.totalHours") || "Hours"}</TableHead>
                    <TableHead className="h-12 text-right font-semibold text-gray-900">{t("billing.amount") || "Amount"}</TableHead>
                    <TableHead className="h-12 text-center font-semibold text-gray-900">{t("billing.currency") || "Currency"}</TableHead>
                    <TableHead className="h-12 text-center font-semibold text-gray-900">{t("billing.status") || "Status"}</TableHead>
                    <TableHead className="h-12 text-center font-semibold text-gray-900">{t("billing.billDate") || "Bill Date"}</TableHead>
                    <TableHead className="h-12 text-center font-semibold text-gray-900 w-20">{t("billing.actions.title") || "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unpaidBills.map((bill) => (
                    <TableRow
                      key={bill.id}
                      className={cn(
                        "border-b border-gray-100 transition-colors duration-150 group",
                        bill.status === "pending" 
                          ? "bg-amber-50/50 hover:bg-amber-50 border-l-4 border-l-amber-400" 
                          : "hover:bg-red-50/30"
                      )}
                    >
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {bill.student?.student?.full_name || "Unknown Student"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <span className="text-sm font-medium text-gray-700">
                          {formatHours(bill.total_hours)} <span className="text-gray-500 text-xs">{t("billing.hours") || "hrs"}</span>
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <span className="text-base font-semibold text-gray-900">
                          {formatCurrency(bill.amount, bill.currency)}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          {bill.currency}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        {getStatusBadge(bill.status)}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <span className="text-sm text-gray-600">
                          {format(new Date(bill.bill_date), "MMM d, yyyy")}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-center">
                          <DropdownMenu 
                            open={openDropdownId === bill.id}
                            onOpenChange={(open) => {
                              if (!open && sendingBillId !== bill.id) {
                                setOpenDropdownId(null);
                              } else if (open) {
                                setOpenDropdownId(bill.id);
                              }
                            }}
                          >
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100 data-[state=open]:bg-gray-100"
                              >
                                <MoreVertical className="h-4 w-4 text-gray-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  handleViewBill(bill);
                                }}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                {t("billing.actions.view") || "View"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  if (sendingBillId !== bill.id) {
                                    e.preventDefault();
                                    handleSendWhatsApp(bill);
                                  }
                                }}
                                className="cursor-pointer"
                                disabled={sendingBillId === bill.id}
                              >
                                {sendingBillId === bill.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <MessageCircle className="mr-2 h-4 w-4" />
                                )}
                                {sendingBillId === bill.id
                                  ? t("billing.sending") || "Sending..."
                                  : t("billing.actions.sendWhatsApp") || "Send WhatsApp"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  handleDownloadPDF(bill.id);
                                }}
                                className="cursor-pointer"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                {t("billing.actions.downloadPdf") || "Download PDF"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  setSelectedBill(bill);
                                  setIsMarkPaidOpen(true);
                                }}
                                className="cursor-pointer text-green-700 focus:text-green-700 focus:bg-green-50"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {t("billing.actions.markPaid") || "Mark as Paid"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {((activeTab === 'paid' && paidBills.length === 0) || (activeTab === 'unpaid' && unpaidBills.length === 0)) && (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {activeTab === 'paid' 
                ? t("billing.noPaidBills") || "No paid bills found"
                : t("billing.noUnpaidBills") || "No unpaid bills found"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Bill Details Dialog */}
      <Dialog open={isBillDetailsOpen} onOpenChange={setIsBillDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("billing.autoInvoice") || "Auto Invoice"}</DialogTitle>
            <DialogDescription>
              {t("billing.billDetails") || "Complete information about the bill"}
            </DialogDescription>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">
                  {t("billing.studentInformation") || "Student Information"}
                </h3>
                <p>{selectedBill.student?.full_name || selectedBill.student?.student?.full_name || "Unknown"}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  {t("billing.billSummary") || "Bill Summary"}
                </h3>
                <p>
                  {t("billing.totalHours") || "Total Hours"}:{" "}
                  {formatHours(selectedBill.total_hours)}{" "}
                  {t("billing.hours") || "hours"}
                </p>
                <p>
                  {t("billing.totalAmount") || "Total Amount"}:{" "}
                  {formatCurrency(selectedBill.amount, selectedBill.currency)}
                </p>
                <p>
                  {t("billing.status") || "Status"}: {getStatusBadge(selectedBill.status)}
                </p>
              </div>
              {selectedBill.classes && selectedBill.classes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">
                    {t("billing.lessonsIncluded") || "Lessons Included"}
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className={cn("p-2", direction === "rtl" ? "text-right" : "text-left")}>{t("billing.date") || "Date"}</th>
                          <th className={cn("p-2", direction === "rtl" ? "text-right" : "text-left")}>{t("billing.time") || "Time"}</th>
                          <th className={cn("p-2", direction === "rtl" ? "text-right" : "text-left")}>{t("billing.duration") || "Duration"}</th>
                          <th className={cn("p-2", direction === "rtl" ? "text-right" : "text-left")}>{t("billing.teacher") || "Teacher"}</th>
                          <th className={cn("p-2", direction === "rtl" ? "text-right" : "text-left")}>{t("billing.cost") || "Cost"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBill.classes.map((lesson: any, idx: number) => (
                          <tr key={idx} className="border-t">
                            <td className="p-2">{format(new Date(lesson.date), "MMM d, yyyy")}</td>
                            <td className="p-2">{lesson.time}</td>
                            <td className="p-2">{lesson.duration_hours} hrs</td>
                            <td className="p-2">{lesson.teacher}</td>
                            <td className="p-2">
                              {formatCurrency(lesson.cost, selectedBill.currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBillDetailsOpen(false)}>
              {t("billing.actions.close") || "Close"}
            </Button>
            {selectedBill && (
              <Button onClick={() => handleDownloadPDF(selectedBill.id)}>
                <Download className="h-4 w-4 mr-2" />
                {t("billing.actions.downloadPdf") || "Download PDF"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Paid Dialog */}
      <Dialog open={isMarkPaidOpen} onOpenChange={setIsMarkPaidOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("billing.markPaidForm.title") || "Mark Bill as Paid"}
            </DialogTitle>
            <DialogDescription>
              {t("billing.markPaidForm.description") || "Record payment for this bill"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">
                {t("billing.markPaidForm.paymentMethod") || "Payment Method"} *
              </Label>
              <Select
                value={markPaidForm.payment_method}
                onValueChange={(value) =>
                  setMarkPaidForm({ ...markPaidForm, payment_method: value })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("billing.markPaidForm.selectPaymentMethod") || "Select payment method"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">
                    {t("billing.paymentMethods.cash") || "Cash"}
                  </SelectItem>
                  <SelectItem value="Bank Transfer">
                    {t("billing.paymentMethods.bankTransfer") || "Bank Transfer"}
                  </SelectItem>
                  <SelectItem value="Credit Card">
                    {t("billing.paymentMethods.creditCard") || "Credit Card"}
                  </SelectItem>
                  <SelectItem value="Online Payment">
                    {t("billing.paymentMethods.onlinePayment") || "Online Payment"}
                  </SelectItem>
                  <SelectItem value="Other">
                    {t("billing.paymentMethods.other") || "Other"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_date">
                {t("billing.markPaidForm.paymentDate") || "Payment Date"}
              </Label>
              <Input
                id="payment_date"
                type="date"
                value={markPaidForm.payment_date}
                onChange={(e) =>
                  setMarkPaidForm({ ...markPaidForm, payment_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_reason">
                {t("billing.markPaidForm.paymentReason") || "Payment Reason"} *
              </Label>
              <Textarea
                id="payment_reason"
                value={markPaidForm.payment_reason || ""}
                onChange={(e) =>
                  setMarkPaidForm({ ...markPaidForm, payment_reason: e.target.value })
                }
                rows={3}
                placeholder={t("billing.markPaidForm.paymentReasonPlaceholder") || "Enter the reason for marking this bill as paid..."}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMarkPaidOpen(false)}>
              {t("billing.markPaidForm.cancel") || "Cancel"}
            </Button>
            <Button
              onClick={handleMarkAsPaid}
              disabled={isSaving || !markPaidForm.payment_method || !markPaidForm.payment_reason}
            >
              {isSaving
                ? t("billing.markPaidForm.saving") || "Saving..."
                : t("billing.markPaidForm.markAsPaid") || "Mark as Paid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
