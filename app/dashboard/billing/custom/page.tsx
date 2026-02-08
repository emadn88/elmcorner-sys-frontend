"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  MessageCircle,
  CheckCircle,
  XCircle,
  Download,
  Plus,
  Calendar,
  MoreVertical,
  Eye,
  CreditCard,
  Search,
  X,
  Loader2,
} from "lucide-react";
import { BillingService } from "@/lib/services/billing.service";
import { StudentService } from "@/lib/services/student.service";
import {
  Bill,
  BillingStatistics,
  BillingResponse,
  CreateCustomBillData,
  MarkBillPaidData,
  Student,
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

export default function CustomBillingPage() {
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
  const [isCustomBillOpen, setIsCustomBillOpen] = useState(false);
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sendingBillId, setSendingBillId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [isWhatsAppNumberOpen, setIsWhatsAppNumberOpen] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [billToSend, setBillToSend] = useState<Bill | null>(null);

  // Student search for custom bill form
  const [customBillStudentSearch, setCustomBillStudentSearch] = useState("");
  const [customBillStudents, setCustomBillStudents] = useState<Student[]>([]);
  const [filteredCustomBillStudents, setFilteredCustomBillStudents] = useState<Student[]>([]);
  const [showCustomBillStudentDropdown, setShowCustomBillStudentDropdown] = useState(false);
  const [isLoadingCustomBillStudents, setIsLoadingCustomBillStudents] = useState(false);
  const customBillStudentDropdownRef = useRef<HTMLDivElement>(null);

  // Custom bill form
  const [customBillForm, setCustomBillForm] = useState<CreateCustomBillData>({
    student_id: undefined,
    amount: 0,
    currency: "USD",
    description: "",
  });

  // Mark paid form
  const [markPaidForm, setMarkPaidForm] = useState<MarkBillPaidData>({
    payment_method: "",
    payment_date: format(new Date(), "yyyy-MM-dd"),
    payment_reason: "",
  });

  useEffect(() => {
    loadBillingData();
  }, [selectedYear, selectedMonth]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        customBillStudentDropdownRef.current &&
        !customBillStudentDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCustomBillStudentDropdown(false);
      }
    };

    if (showCustomBillStudentDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCustomBillStudentDropdown]);

  // Load students for custom bill form
  useEffect(() => {
    if (isCustomBillOpen) {
      const loadStudents = async () => {
        if (customBillStudentSearch || customBillStudentSearch === "") {
          setIsLoadingCustomBillStudents(true);
          try {
            const response = await StudentService.getStudents({
              search: customBillStudentSearch,
              per_page: 100,
            });
            setCustomBillStudents(response.data);
            setFilteredCustomBillStudents(response.data);
          } catch (error) {
            console.error("Failed to load students:", error);
            setCustomBillStudents([]);
            setFilteredCustomBillStudents([]);
          } finally {
            setIsLoadingCustomBillStudents(false);
          }
        }
      };

      const timeoutId = setTimeout(() => {
        loadStudents();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [customBillStudentSearch, isCustomBillOpen]);

  // Filter students for custom bill form
  useEffect(() => {
    if (customBillStudentSearch) {
      const filtered = customBillStudents.filter((student) =>
        student.full_name.toLowerCase().includes(customBillStudentSearch.toLowerCase())
      );
      setFilteredCustomBillStudents(filtered);
    } else {
      setFilteredCustomBillStudents(customBillStudents);
    }
  }, [customBillStudentSearch, customBillStudents]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const data = await BillingService.getBills({
        year: selectedYear,
        month: selectedMonth,
        is_custom: true, // Only custom bills
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
    // If bill has no student, show dialog to ask for WhatsApp number
    if (!bill.student_id || !bill.student) {
      setBillToSend(bill);
      setIsWhatsAppNumberOpen(true);
      setOpenDropdownId(null); // Close dropdown
      return;
    }

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

  const handleConfirmWhatsAppSend = async () => {
    if (!billToSend || !whatsAppNumber.trim()) {
      setNotification({
        type: "error",
        message: t("billing.whatsAppNumberRequired") || "WhatsApp number is required",
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      setSendingBillId(billToSend.id);
      await BillingService.sendViaWhatsApp(billToSend.id, whatsAppNumber.trim());
      setNotification({
        type: "success",
        message: t("billing.whatsAppSent") || "Bill sent via WhatsApp successfully",
      });
      setTimeout(() => setNotification(null), 3000);
      setIsWhatsAppNumberOpen(false);
      setWhatsAppNumber("");
      setBillToSend(null);
      await loadBillingData();
    } catch (error: any) {
      setNotification({
        type: "error",
        message: error.message || t("billing.failedToSend") || "Failed to send WhatsApp",
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setSendingBillId(null);
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

  const handleCreateCustomBill = async () => {
    if (!customBillForm.amount) {
      setNotification({
        type: "error",
        message: t("billing.fillRequiredFields") || "Please fill in all required fields",
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      setIsSaving(true);
      await BillingService.createCustomBill(customBillForm);
      setNotification({
        type: "success",
        message: t("billing.successCreated") || "Custom bill created successfully",
      });
      setTimeout(() => setNotification(null), 3000);
      setIsCustomBillOpen(false);
      setCustomBillForm({
        student_id: undefined,
        amount: 0,
        currency: "USD",
        description: "",
      });
      setCustomBillStudentSearch("");
      setShowCustomBillStudentDropdown(false);
      await loadBillingData();
    } catch (error: any) {
      setNotification({
        type: "error",
        message: error.message || t("billing.failedToCreate") || "Failed to create custom bill",
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
    switch (status?.toLowerCase()) {
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

  // Collect all custom bills
  const allCustomBills: Bill[] = [];
  if (billingData?.bills) {
    Object.values(billingData.bills).forEach((data) => {
      allCustomBills.push(...data.bills.filter(bill => bill.is_custom));
    });
  }

  const paidBills = allCustomBills.filter(bill => bill.status === 'paid');
  const unpaidBills = allCustomBills.filter(bill => bill.status !== 'paid');

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
          {t("sidebar.customBillings") || "Custom Billings"}
        </h1>
        <p className="text-gray-600 mt-2">
          {t("billing.customBillsDescription") || "Manage custom bills and payments"}
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

        <Button onClick={() => setIsCustomBillOpen(true)} size="sm" className="h-9 flex-shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          {t("billing.createCustomBill") || "Create Custom Bill"}
        </Button>
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

      {/* Paid Custom Billings Section */}
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
                    <TableHead className="h-12 text-right font-semibold text-gray-900">{t("billing.amount") || "Amount"}</TableHead>
                    <TableHead className="h-12 text-center font-semibold text-gray-900">{t("billing.currency") || "Currency"}</TableHead>
                    <TableHead className="h-12 text-center font-semibold text-gray-900">{t("billing.status") || "Status"}</TableHead>
                    <TableHead className="h-12 text-center font-semibold text-gray-900">{t("billing.billDate") || "Bill Date"}</TableHead>
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
                            {bill.student?.full_name || t("billing.noStudent") || "No Student"}
                          </div>
                          {bill.description && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {bill.description}
                            </div>
                          )}
                        </div>
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

      {/* Unpaid Custom Billings Section */}
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
                            {bill.student?.full_name || t("billing.noStudent") || "No Student"}
                          </div>
                          {bill.description && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {bill.description}
                            </div>
                          )}
                        </div>
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
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {activeTab === 'paid' 
                ? t("billing.noPaidBills") || "No paid bills found"
                : t("billing.noUnpaidBills") || "No unpaid bills found"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Custom Bill Dialog */}
      <Dialog 
        open={isCustomBillOpen} 
        onOpenChange={(open) => {
          setIsCustomBillOpen(open);
          if (!open) {
            setCustomBillStudentSearch("");
            setShowCustomBillStudentDropdown(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("billing.createCustomBillForm.title") || "Create Custom Bill"}
            </DialogTitle>
            <DialogDescription>
              {t("billing.createCustomBillForm.description") ||
                "Create a custom bill for advance payments or special cases"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2 relative" ref={customBillStudentDropdownRef}>
              <Label htmlFor="student_search">
                {t("billing.createCustomBillForm.student") || "Student"}
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  id="student_search"
                  type="text"
                  placeholder={t("billing.searchStudents") || "Search students..."}
                  value={customBillStudentSearch}
                  onChange={(e) => {
                    setCustomBillStudentSearch(e.target.value);
                    setShowCustomBillStudentDropdown(true);
                    if (!e.target.value) {
                      setCustomBillForm({ ...customBillForm, student_id: undefined });
                    }
                  }}
                  onFocus={() => setShowCustomBillStudentDropdown(true)}
                  className={cn(
                    "pl-9",
                    customBillForm.student_id > 0 && "pr-9"
                  )}
                />
                {customBillForm.student_id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCustomBillStudentSearch("");
                      setCustomBillForm({ ...customBillForm, student_id: undefined });
                      setShowCustomBillStudentDropdown(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {showCustomBillStudentDropdown && (customBillStudentSearch || !customBillForm.student_id) && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                  {isLoadingCustomBillStudents ? (
                    <div className="px-4 py-2 text-sm text-muted-foreground text-center">
                      {t("common.loading") || "Loading..."}
                    </div>
                  ) : filteredCustomBillStudents.length > 0 ? (
                    filteredCustomBillStudents.map((student) => (
                      <div
                        key={student.id}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          setCustomBillForm({ ...customBillForm, student_id: student.id });
                          setCustomBillStudentSearch(student.full_name);
                          setShowCustomBillStudentDropdown(false);
                        }}
                      >
                        {student.full_name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      {t("billing.noStudentsFound") || "No students found"}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">
                {t("billing.createCustomBillForm.amount") || "Amount"} *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={customBillForm.amount || ""}
                onChange={(e) =>
                  setCustomBillForm({
                    ...customBillForm,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">
                {t("billing.createCustomBillForm.currency") || "Currency"}
              </Label>
              <Select
                value={customBillForm.currency}
                onValueChange={(value) =>
                  setCustomBillForm({ ...customBillForm, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="SAR">SAR</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">
                {t("billing.createCustomBillForm.description") || "Description"}
              </Label>
              <Textarea
                id="description"
                value={customBillForm.description || ""}
                onChange={(e) =>
                  setCustomBillForm({ ...customBillForm, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCustomBillOpen(false);
                setCustomBillStudentSearch("");
                setShowCustomBillStudentDropdown(false);
                setCustomBillForm({
                  student_id: undefined,
                  amount: 0,
                  currency: "USD",
                  description: "",
                });
              }}
            >
              {t("billing.createCustomBillForm.cancel") || "Cancel"}
            </Button>
            <Button onClick={handleCreateCustomBill} disabled={isSaving}>
              {isSaving
                ? t("billing.createCustomBillForm.creating") || "Creating..."
                : t("billing.createCustomBillForm.createBill") || "Create Bill"}
            </Button>
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

      {/* WhatsApp Number Dialog */}
      <Dialog open={isWhatsAppNumberOpen} onOpenChange={setIsWhatsAppNumberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("billing.whatsAppNumberDialog.title") || "Enter WhatsApp Number"}
            </DialogTitle>
            <DialogDescription>
              {t("billing.whatsAppNumberDialog.description") || "This bill has no student. Please enter the WhatsApp number to send the bill to."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">
                {t("billing.whatsAppNumberDialog.whatsAppNumber") || "WhatsApp Number"} *
              </Label>
              <Input
                id="whatsapp_number"
                type="tel"
                placeholder={t("billing.whatsAppNumberDialog.placeholder") || "+1234567890"}
                value={whatsAppNumber}
                onChange={(e) => setWhatsAppNumber(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                {t("billing.whatsAppNumberDialog.hint") || "Include country code (e.g., +1234567890)"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsWhatsAppNumberOpen(false);
                setWhatsAppNumber("");
                setBillToSend(null);
              }}
              disabled={sendingBillId === billToSend?.id}
            >
              {t("billing.whatsAppNumberDialog.cancel") || "Cancel"}
            </Button>
            <Button
              onClick={handleConfirmWhatsAppSend}
              disabled={!whatsAppNumber.trim() || sendingBillId === billToSend?.id}
            >
              {sendingBillId === billToSend?.id
                ? t("billing.sending") || "Sending..."
                : t("billing.whatsAppNumberDialog.send") || "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
