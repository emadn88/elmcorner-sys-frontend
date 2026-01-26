"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { BillingService } from "@/lib/services/billing.service";
import { BillDetails } from "@/lib/api/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function PaymentPage() {
  const params = useParams();
  const token = params.token as string;

  const [bill, setBill] = useState<BillDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      loadBill();
    }
  }, [token]);

  const loadBill = async () => {
    try {
      setLoading(true);
      setError(null);
      const billData = await BillingService.getPublicBill(token);
      setBill(billData);
    } catch (err: any) {
      setError(err.message || "Failed to load bill");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!token) return;

    try {
      const blob = await BillingService.downloadPublicPDF(token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bill-${bill?.id || "unknown"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Failed to download PDF");
    }
  };

  const formatHours = (hours: number | string | undefined | null): string => {
    if (hours === null || hours === undefined) return "0.00";
    const numHours = typeof hours === 'number' ? hours : parseFloat(String(hours || '0'));
    return isNaN(numHours) ? "0.00" : numHours.toFixed(2);
  };

  const handleProcessPayment = async () => {
    if (!token || !paymentMethod) return;

    try {
      setIsProcessing(true);
      await BillingService.processPayment(token, paymentMethod);
      setPaymentSuccess(true);
      setShowPaymentDialog(false);
      // Reload bill to get updated status
      await loadBill();
    } catch (err: any) {
      setError(err.message || "Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate start and end dates from classes or bill_date
  const getBillPeriod = () => {
    if (bill?.classes && bill.classes.length > 0) {
      const dates = bill.classes.map((c: any) => new Date(c.date)).sort((a, b) => a.getTime() - b.getTime());
      const startDate = dates[0];
      const endDate = dates[dates.length - 1];
      return { startDate, endDate };
    } else if (bill?.bill_date) {
      const billDate = new Date(bill.bill_date);
      const year = billDate.getFullYear();
      const month = billDate.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      return { startDate, endDate };
    }
    return null;
  };

  const getMonthName = (date: Date) => {
    return format(date, "MMMM yyyy");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>
        <div className="relative z-10 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 font-medium text-lg">
            Loading bill information...
          </p>
        </div>
      </div>
    );
  }

  if (error && !bill) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>
        <Card className="max-w-md w-full relative z-10 border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Error
              </h2>
              <p className="text-gray-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!bill) {
    return null;
  }

  const billPeriod = getBillPeriod();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-emerald-950 to-gray-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Vectors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Animated Blobs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gray-800/30 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-950/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-emerald-800/20 rounded-lg rotate-45 opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-emerald-700/20 rounded-full opacity-20 animate-float animation-delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-gray-700/20 rounded-full opacity-20 animate-float animation-delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-14 h-14 bg-emerald-900/20 rotate-45 opacity-20 animate-float animation-delay-3000"></div>
        
        {/* Animated Lines */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#065f46" />
            </linearGradient>
          </defs>
          <path d="M0,100 Q250,50 500,100 T1000,100" stroke="url(#lineGradient)" strokeWidth="2" fill="none" strokeDasharray="1000" strokeDashoffset="1000" className="animate-draw" />
          <path d="M0,300 Q250,250 500,300 T1000,300" stroke="url(#lineGradient)" strokeWidth="2" fill="none" strokeDasharray="1000" strokeDashoffset="1000" className="animate-draw animation-delay-2000" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Success Message */}
        {paymentSuccess && (
          <Card className="mb-4 border-0 shadow-xl bg-gradient-to-r from-emerald-600 to-teal-600 backdrop-blur-sm">
            <CardContent className="pt-4 pb-4 px-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Payment Processed Successfully
                  </h3>
                  <p className="text-xs text-white/90 mt-0.5">
                    Your payment has been recorded. Thank you!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-4 border-0 shadow-xl bg-gradient-to-r from-red-600 to-rose-600 backdrop-blur-sm">
            <CardContent className="pt-4 pb-4 px-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <XCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Error
                  </h3>
                  <p className="text-xs text-white/90 mt-0.5">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Payment Card */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-xl overflow-hidden relative">
          {/* Decorative Gradient Top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gray-800 via-emerald-800 to-gray-800"></div>
          
          <CardContent className="p-6 sm:p-7 md:p-8 relative">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-gray-800 to-emerald-800 rounded-xl shadow-lg mb-3 transform hover:scale-105 transition-transform">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 via-emerald-700 to-gray-800 bg-clip-text text-transparent mb-2">
                ElmCorner Payment Gateway
              </h1>
              {billPeriod && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <p className="text-xs font-semibold text-gray-600 bg-gray-100 inline-block px-3 py-1 rounded-full">
                    {format(billPeriod.startDate, "MMM d")} - {format(billPeriod.endDate, "MMM d, yyyy")}
                  </p>
                  <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-full">
                    {getMonthName(billPeriod.startDate)}
                  </p>
                </div>
              )}
            </div>

            {/* Client Name Section */}
            <div className="mb-6 text-center">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Client Name
              </p>
              <div className="inline-block p-3 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl border-2 border-gray-200">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-emerald-700 bg-clip-text text-transparent">
                  {bill.student?.name || "N/A"}
                </h2>
              </div>
            </div>

            {/* Divider with Gradient */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-gray-600 text-xs font-semibold">Details</span>
              </div>
            </div>

            {/* Bill Details */}
            <div className="space-y-4 mb-6">
              {/* Total Hours */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl border-2 border-gray-200 transform hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-emerald-700 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">H</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    Total Hours
                  </p>
                </div>
                <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-emerald-700 bg-clip-text text-transparent">
                  {formatHours(bill.total_hours)} <span className="text-sm font-normal text-gray-500">hrs</span>
                </p>
              </div>

              {/* Total Amount */}
              <div className="p-6 bg-gradient-to-br from-gray-800 via-emerald-800 to-gray-800 rounded-2xl shadow-xl transform hover:scale-[1.02] transition-transform">
                <p className="text-xs font-bold text-white/90 uppercase tracking-wider mb-3 text-center">
                  Total Amount
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-white text-center drop-shadow-lg">
                  {formatCurrency(bill.total_amount, bill.currency)}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full h-11 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 border-2 border-gray-300 font-semibold text-sm transition-all hover:shadow-lg hover:scale-[1.02] transform"
                variant="outline"
                onClick={handleDownloadPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>

              {bill.status !== "paid" && (
                <Button
                  className="w-full h-11 bg-gradient-to-r from-gray-800 via-emerald-700 to-gray-800 hover:from-gray-900 hover:via-emerald-800 hover:to-gray-900 text-white font-semibold text-sm shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02] transform"
                  onClick={() => setShowPaymentDialog(true)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
                </Button>
              )}

              {bill.status === "paid" && (
                <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg text-center border-2 border-emerald-500">
                  <div className="flex items-center justify-center gap-2.5 text-white">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold text-base">
                      Payment Completed
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Select Payment Method
            </DialogTitle>
            <DialogDescription>
              Choose your preferred payment method. Note: This is a placeholder - no real payment integration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Payment Method
              </label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Credit Card
                    </div>
                  </SelectItem>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Bank Transfer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong>{" "}
                This is a placeholder payment form. Real payment gateway integration will be implemented later.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleProcessPayment}
              disabled={isProcessing || !paymentMethod}
              className="bg-gradient-to-r from-gray-800 to-emerald-700 hover:from-gray-900 hover:to-emerald-800"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
