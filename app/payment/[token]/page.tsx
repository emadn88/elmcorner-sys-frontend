"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CreditCard,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  Calendar,
  Clock,
  Star,
} from "lucide-react";
import { BillingService } from "@/lib/services/billing.service";
import { BillDetails } from "@/lib/api/types";

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params.token as string;

  const [bill, setBill] = useState<BillDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const paypalButtonContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token) {
      loadBill();
    }
  }, [token]);

  // Load PayPal SDK
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.paypal && bill) {
      const script = document.createElement('script');
      // Use production client ID (from env or fallback to production)
      const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'AcjSyDBXwerwjC5jpZGWA2IsDCwEYQRWuxuc23euPHvcB10bR-qILNyVBdoyBXIb1wd2Bi-1BDFNMBh1';
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${bill.currency || 'USD'}&intent=capture&enable-funding=venmo,card`;
      script.async = true;
      script.onload = () => setPaypalLoaded(true);
      script.onerror = () => {
        setError('Failed to load PayPal. Please refresh the page.');
        setPaypalLoaded(false);
      };
      document.body.appendChild(script);
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    } else if (window.paypal) {
      setPaypalLoaded(true);
    }
  }, [bill]);

  // Initialize PayPal Smart Buttons
  useEffect(() => {
    if (!paypalLoaded || !window.paypal || !bill || bill.status === 'paid' || !paypalButtonContainerRef.current) {
      return;
    }

    // Clear any existing buttons
    paypalButtonContainerRef.current.innerHTML = '';

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal',
      },
      createOrder: async (data: any, actions: any) => {
        try {
          setIsProcessing(true);
          setError(null);
          if (!bill) {
            throw new Error('Bill information not loaded');
          }
          const result = await BillingService.createPayPalOrder(token, bill.total_amount || bill.amount, bill.currency || 'USD');
          return result.order_id;
        } catch (err: any) {
          setError(err.message || 'Failed to create PayPal order');
          setIsProcessing(false);
          throw err;
        }
      },
      onApprove: async (data: any, actions: any) => {
        try {
          setIsProcessing(true);
          setError(null);
          await BillingService.capturePayPalOrder(token, data.orderID);
          setPaymentSuccess(true);
          await loadBill();
        } catch (err: any) {
          setError(err.message || 'Failed to process payment');
        } finally {
          setIsProcessing(false);
        }
      },
      onError: (err: any) => {
        setError('An error occurred with PayPal. Please try again.');
        setIsProcessing(false);
      },
      onCancel: () => {
        setError('Payment was cancelled. Please try again if you wish to complete the payment.');
        setIsProcessing(false);
      },
    }).render(paypalButtonContainerRef.current);

    setIsProcessing(false);
  }, [paypalLoaded, bill, token]);

  // Handle PayPal return (for old redirect flow - keeping for backward compatibility)
  useEffect(() => {
    const paypalStatus = searchParams?.get('paypal');
    const paymentId = searchParams?.get('paymentId');
    const payerId = searchParams?.get('PayerID');

    if (paypalStatus === 'success' && paymentId && payerId && token) {
      handlePayPalExecute(paymentId, payerId);
    } else if (paypalStatus === 'cancel') {
      setError('Payment was cancelled. Please try again if you wish to complete the payment.');
    }
  }, [searchParams, token]);

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

  const handleDownloadPDF = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!token) return;

    try {
      setIsDownloadingPDF(true);
      setError(null);
      
      const blob = await BillingService.downloadPublicPDF(token);
      
      // Create a more descriptive filename
      const studentName = bill?.student?.name || "student";
      const sanitizedName = studentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const billId = bill?.id || "unknown";
      const date = new Date().toISOString().split('T')[0];
      const filename = `bill_${sanitizedName}_${billId}_${date}.pdf`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Failed to download PDF. Please try again.");
      console.error("PDF download error:", err);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const formatHours = (hours: number | string | undefined | null): string => {
    if (hours === null || hours === undefined) return "0.00";
    const numHours = typeof hours === 'number' ? hours : parseFloat(String(hours || '0'));
    return isNaN(numHours) ? "0.00" : numHours.toFixed(2);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getBillingPeriod = () => {
    if (bill?.classes && bill.classes.length > 0) {
      // Get dates from classes and sort them
      const dates = bill.classes
        .map((c: any) => new Date(c.date))
        .sort((a: Date, b: Date) => a.getTime() - b.getTime());
      
      const startDate = dates[0];
      const endDate = dates[dates.length - 1];
      
      // Format dates as MM/DD/YYYY
      const formatDate = (date: Date) => {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      };
      
      return {
        from: formatDate(startDate),
        to: formatDate(endDate),
      };
    } else if (bill?.bill_date) {
      // Fallback to bill_date if no classes
      const billDate = new Date(bill.bill_date);
      const month = (billDate.getMonth() + 1).toString().padStart(2, '0');
      const day = billDate.getDate().toString().padStart(2, '0');
      const year = billDate.getFullYear();
      const formattedDate = `${month}/${day}/${year}`;
      return {
        from: formattedDate,
        to: formattedDate,
      };
    }
    return null;
  };

  const getTotalClasses = () => {
    if (bill?.classes && bill.classes.length > 0) {
      return bill.classes.length;
    }
    return 1; // Default to 1 if no classes array
  };

  const handlePaymentMethodSelect = async (method: string) => {
    if (!token) return;

    try {
      setIsProcessing(true);
      await BillingService.processPayment(token, method);
      setPaymentSuccess(true);
      // Reload bill to get updated status
      await loadBill();
    } catch (err: any) {
      setError(err.message || "Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalPayment = async () => {
    if (!token) return;

    try {
      setIsProcessing(true);
      setError(null);
      const result = await BillingService.createPayPalPayment(token);
      // Redirect to PayPal
      window.location.href = result.approval_url;
    } catch (err: any) {
      setError(err.message || "Failed to create PayPal payment");
      setIsProcessing(false);
    }
  };

  const handlePayPalExecute = async (paymentId: string, payerId: string) => {
    if (!token) return;

    try {
      setIsProcessing(true);
      setError(null);
      await BillingService.executePayPalPayment(token, paymentId, payerId);
      setPaymentSuccess(true);
      // Reload bill to get updated status
      await loadBill();
      // Clean up URL parameters
      window.history.replaceState({}, '', window.location.pathname);
    } catch (err: any) {
      setError(err.message || "Failed to execute PayPal payment");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden font-sans" dir="ltr">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
          <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="loading-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-600"/>
                <polygon points="100,60 120,80 160,80 130,100 145,140 100,120 55,140 70,100 40,80 80,80" 
                         fill="none" 
                         stroke="currentColor" 
                         strokeWidth="1"
                         className="text-blue-600"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#loading-pattern)" />
          </svg>
        </div>
        <div className="relative z-10 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-700 font-semibold text-lg" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
            Loading bill information...
          </p>
        </div>
      </div>
    );
  }

  if (error && !bill) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden font-sans" dir="ltr">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
          <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="error-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1" className="text-red-600"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#error-pattern)" />
          </svg>
        </div>
        <Card className="max-w-md w-full relative z-10 border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl">
          <CardContent className="pt-8 pb-8 px-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                Error
              </h2>
              <p className="text-gray-600" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!bill) {
    return null;
  }

  const billingPeriod = getBillingPeriod();
  const studentName = bill.student?.name || "Student";

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .payment-page-ltr,
        .payment-page-ltr * {
          direction: ltr !important;
        }
        .payment-page-ltr h1,
        .payment-page-ltr h2,
        .payment-page-ltr h3,
        .payment-page-ltr p,
        .payment-page-ltr span,
        .payment-page-ltr div:not(.text-center):not([class*="text-center"]):not(.payment-center) {
          text-align: left !important;
        }
        .payment-page-ltr .text-center,
        .payment-page-ltr [class*="text-center"],
        .payment-page-ltr .payment-center {
          text-align: center !important;
        }
        .payment-center {
          text-align: center !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
        
        @keyframes rotate-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes rotate-reverse {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }
        
        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-15px) translateX(10px);
          }
        }
        
        @keyframes pulse-gentle {
          0%, 100% {
            opacity: 0.15;
            transform: scale(1);
          }
          50% {
            opacity: 0.25;
            transform: scale(1.05);
          }
        }
        
        @keyframes slide-in {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-rotate-slow {
          animation: rotate-slow 20s linear infinite;
        }
        
        .animate-rotate-reverse {
          animation: rotate-reverse 25s linear infinite;
        }
        
        .animate-float-gentle {
          animation: float-gentle 8s ease-in-out infinite;
        }
        
        .animate-pulse-gentle {
          animation: pulse-gentle 4s ease-in-out infinite;
        }
        
        .animate-slide-in {
          animation: slide-in 2s ease-out;
        }
      `}} />
      <div 
        className="payment-page-ltr min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden flex items-center justify-center p-3 sm:p-4 md:p-6 font-sans" 
        dir="ltr"
        style={{ direction: 'ltr !important' as any, textAlign: 'left' }}
      >
      {/* Professional Islamic & Payment Background Vectors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.15]">
        {/* Islamic Geometric Star Pattern - Top Left */}
        <div className="absolute top-4 left-4 sm:top-10 sm:left-10 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 animate-rotate-slow hidden sm:block">
          <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#059669" stopOpacity="1"/>
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.7"/>
              </linearGradient>
            </defs>
            {/* 8-pointed Islamic star */}
            <circle cx="100" cy="100" r="80" fill="none" stroke="url(#grad1)" strokeWidth="2.5"/>
            <polygon points="100,20 120,60 160,60 130,85 145,125 100,105 55,125 70,85 40,60 80,60" 
                     fill="none" 
                     stroke="url(#grad1)" 
                     strokeWidth="2.5"/>
            <polygon points="100,40 110,65 135,65 115,82 125,110 100,95 75,110 85,82 65,65 90,65" 
                     fill="none" 
                     stroke="url(#grad1)" 
                     strokeWidth="2"/>
          </svg>
        </div>

        {/* Payment/Credit Card Icon - Top Right */}
        <div className="absolute top-4 right-4 sm:top-20 sm:right-20 w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 animate-float-gentle hidden sm:block" style={{ animationDelay: '1s' }}>
          <svg viewBox="0 0 200 120" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#0891b2" stopOpacity="0.7"/>
              </linearGradient>
            </defs>
            {/* Credit Card Shape */}
            <rect x="10" y="20" width="180" height="100" rx="8" fill="url(#cardGrad)" stroke="#059669" strokeWidth="2.5" opacity="0.9"/>
            {/* Card Chip */}
            <rect x="25" y="40" width="30" height="25" rx="4" fill="#fbbf24" opacity="0.9"/>
            {/* Card Lines */}
            <line x1="25" y1="75" x2="175" y2="75" stroke="#059669" strokeWidth="2.5" opacity="0.7"/>
            <line x1="25" y1="85" x2="140" y2="85" stroke="#059669" strokeWidth="2" opacity="0.6"/>
            {/* Card Number Pattern */}
            <circle cx="150" cy="50" r="8" fill="#0891b2" opacity="0.7"/>
            <circle cx="165" cy="50" r="8" fill="#0891b2" opacity="0.7"/>
            <circle cx="180" cy="50" r="8" fill="#0891b2" opacity="0.7"/>
          </svg>
        </div>

        {/* Islamic Hexagonal Pattern - Bottom Right */}
        <div className="absolute bottom-4 right-4 sm:bottom-20 sm:right-16 w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 animate-rotate-reverse hidden sm:block">
          <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="#0891b2" stopOpacity="0.7"/>
              </linearGradient>
            </defs>
            {/* Outer Hexagon */}
            <polygon points="100,10 180,55 180,145 100,190 20,145 20,55" 
                     fill="none" 
                     stroke="url(#hexGrad)" 
                     strokeWidth="3"/>
            {/* Middle Hexagon */}
            <polygon points="100,30 160,65 160,135 100,170 40,135 40,65" 
                     fill="none" 
                     stroke="url(#hexGrad)" 
                     strokeWidth="2.5"/>
            {/* Inner Circle */}
            <circle cx="100" cy="100" r="35" fill="none" stroke="url(#hexGrad)" strokeWidth="2"/>
            {/* Center Star */}
            <polygon points="100,70 110,90 130,90 115,105 120,125 100,115 80,125 85,105 70,90 90,90" 
                     fill="none" 
                     stroke="url(#hexGrad)" 
                     strokeWidth="2"/>
          </svg>
        </div>

        {/* Payment Security Lock Icon - Bottom Left */}
        <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-6 w-20 h-20 sm:w-24 sm:h-24 md:w-[120px] md:h-[120px] animate-pulse-gentle hidden sm:block" style={{ animationDelay: '2s' }}>
          <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lockGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#059669"/>
                <stop offset="100%" stopColor="#10b981"/>
              </linearGradient>
              <filter id="lockGlow">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Background circle for visibility */}
            <circle cx="100" cy="100" r="90" fill="#059669" opacity="0.3"/>
            {/* Lock body */}
            <rect x="70" y="110" width="60" height="70" rx="8" fill="url(#lockGrad)" stroke="#047857" strokeWidth="6" filter="url(#lockGlow)"/>
            {/* Lock shackle */}
            <path d="M100,50 Q100,30 120,30 Q140,30 140,50 L140,90 L100,90 L100,50" 
                  fill="none" 
                  stroke="url(#lockGrad)" 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#lockGlow)"/>
            {/* Keyhole */}
            <circle cx="100" cy="145" r="12" fill="#ffffff" opacity="0.9"/>
            <rect x="95" y="145" width="10" height="20" rx="2" fill="#ffffff" opacity="0.9"/>
            {/* Security checkmark overlay */}
            <circle cx="100" cy="100" r="75" fill="none" stroke="#10b981" strokeWidth="3" opacity="0.5" strokeDasharray="10,5"/>
          </svg>
        </div>

        {/* Islamic Geometric Circle Pattern - Center Background */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] animate-rotate-slow opacity-5" style={{ animationDuration: '30s' }}>
          <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circlePattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="35" fill="none" stroke="#059669" strokeWidth="1.5" opacity="0.4"/>
                <circle cx="50" cy="50" r="20" fill="none" stroke="#0891b2" strokeWidth="1.2" opacity="0.3"/>
                <polygon points="50,15 60,40 85,40 65,55 70,80 50,65 30,80 35,55 15,40 40,40" 
                         fill="none" 
                         stroke="#10b981" 
                         strokeWidth="1.2" 
                         opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circlePattern)" />
          </svg>
        </div>

        {/* Subtle Gradient Overlays */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] bg-gradient-to-br from-emerald-100/30 to-blue-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] bg-gradient-to-tr from-blue-100/30 to-teal-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-full sm:max-w-lg mx-auto">
        {/* Success Message */}
        {paymentSuccess && (
          <Card className="mb-3 sm:mb-4 border-0 shadow-xl bg-gradient-to-r from-emerald-600 to-teal-600 backdrop-blur-sm rounded-xl sm:rounded-2xl">
            <CardContent className="pt-4 pb-4 px-4 sm:pt-5 sm:pb-5 sm:px-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/30 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-white text-sm sm:text-base mb-0.5 sm:mb-1" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                    Payment Processed Successfully
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 break-words" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                    Your payment has been recorded. Thank you!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-3 sm:mb-4 border-0 shadow-xl bg-gradient-to-r from-red-600 to-rose-600 backdrop-blur-sm rounded-xl sm:rounded-2xl">
            <CardContent className="pt-4 pb-4 px-4 sm:pt-5 sm:pb-5 sm:px-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/30 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-white text-sm sm:text-base mb-0.5 sm:mb-1" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                    Error
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 break-words" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Payment Card */}
        <Card className="border-0 shadow-2xl bg-white rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-sm w-full" style={{ direction: 'ltr' }}>
          <CardContent className="p-0" style={{ direction: 'ltr' }}>
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 px-4 py-6 sm:px-6 sm:py-7 md:px-8 md:py-8 relative overflow-hidden">
              {/* Decorative Islamic pattern overlay */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                  <defs>
                    <pattern id="header-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                      <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="1"/>
                      <polygon points="50,20 65,45 90,45 70,60 75,85 50,70 25,85 30,60 10,45 35,45" 
                               fill="none" 
                               stroke="white" 
                               strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#header-pattern)" />
                </svg>
              </div>
              
              <div className="relative z-10 text-center payment-center" style={{ direction: 'ltr', textAlign: 'center' }}>
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3" style={{ direction: 'ltr', justifyContent: 'center' }}>
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight payment-center" style={{ fontFamily: 'var(--font-inter), sans-serif', direction: 'ltr', textAlign: 'center', margin: '0 auto' }}>
                    ElmCorner Academy
                  </h1>
                </div>
                <div className="text-center payment-center" style={{ direction: 'ltr', textAlign: 'center', width: '100%' }}>
                  <p className="text-white/95 text-sm sm:text-base font-medium payment-center" style={{ fontFamily: 'var(--font-inter), sans-serif', direction: 'ltr', textAlign: 'center', display: 'block', margin: '0 auto' }}>
                    Hello, {studentName}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8">
              {/* Billing Period */}
              {billingPeriod && (
                <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-100">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                      Billing Period
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900 break-words" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                      From {billingPeriod.from} to {billingPeriod.to}
                    </p>
                  </div>
                </div>
              )}

              {/* Total Classes */}
              <div className="flex items-center justify-between mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100 flex-shrink-0">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                      Total Classes
                    </p>
                    <p className="text-base sm:text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                      {getTotalClasses()} {getTotalClasses() === 1 ? 'class' : 'classes'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 shadow-lg relative overflow-hidden">
                {/* Decorative corner pattern */}
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 opacity-10">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="0,0 100,0 100,100" fill="white"/>
                    <circle cx="80" cy="20" r="15" fill="none" stroke="white" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="relative z-10 text-center payment-center" style={{ direction: 'ltr', textAlign: 'center', width: '100%' }}>
                  <p className="text-white/90 text-xs sm:text-sm font-medium uppercase tracking-wider mb-1 sm:mb-2 payment-center" style={{ fontFamily: 'var(--font-inter), sans-serif', direction: 'ltr', textAlign: 'center', margin: '0 auto' }}>
                    Total Amount
                  </p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight payment-center break-words" style={{ fontFamily: 'var(--font-inter), sans-serif', direction: 'ltr', textAlign: 'center', margin: '0 auto' }}>
                    {formatCurrency(bill.total_amount, bill.currency)}
                  </p>
                </div>
              </div>

              {/* Payment Options */}
              {bill.status !== "paid" && (
                <div className="mb-6">
                  {/* PayPal Smart Buttons */}
                  <Card className="border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md bg-white">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 mb-2">
                          <div className="w-14 h-10 sm:w-16 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden flex-shrink-0">
                            {/* PayPal Logo */}
                            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.417 1.569 1.2 3.576.704 4.713-.495 1.137-1.735 2.225-3.576 2.225h-2.224c-.26 0-.5.17-.58.412l-1.14 3.478-.02.06c-.05.15-.19.26-.35.26h-1.7a.64.64 0 0 0-.63.52l-1.24 6.1-.01.06c-.04.2-.21.34-.41.34zm.65-2.22h1.7c.26 0 .5-.17.58-.41l1.14-3.48.02-.06c.05-.15.19-.26.35-.26h2.22c3.576 0 5.69-1.81 6.48-4.713.79-2.903.26-4.713-1.14-6.282C19.536 2.225 17.528 1.682 14.958 1.682H7.498c-.26 0-.5.17-.58.41L4.944 18.897h2.782z"/>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                              Secure Payment
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                              Pay with PayPal account or use Visa/Mastercard without an account
                            </p>
                          </div>
                        </div>
                        {/* PayPal Smart Buttons Container */}
                        <div ref={paypalButtonContainerRef} className="w-full"></div>
                        {!paypalLoaded && (
                          <div className="w-full py-3 text-center">
                            <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
                            <p className="text-xs text-gray-500 mt-2">Loading payment options...</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Paid Status */}
              {bill.status === "paid" && (
                <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl sm:rounded-2xl shadow-lg text-center border-2 border-emerald-500 mb-4 sm:mb-6">
                  <div className="flex items-center justify-center gap-2 sm:gap-3 text-white">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="font-bold text-sm sm:text-base" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                      Payment Completed
                    </span>
                  </div>
                </div>
              )}

              {/* Download PDF Button */}
              <Button
                type="button"
                className="w-full mt-3 sm:mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm sm:text-base py-2.5 sm:py-3 shadow-lg hover:shadow-xl transition-all border-0"
                onClick={handleDownloadPDF}
                disabled={isDownloadingPDF}
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                {isDownloadingPDF ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Download Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
