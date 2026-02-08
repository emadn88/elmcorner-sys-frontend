/**
 * Billing Service
 * Service layer for billing operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  Bill,
  BillDetails,
  BillingStatistics,
  BillingFilters,
  BillingResponse,
  CreateCustomBillData,
  MarkBillPaidData,
} from "@/lib/api/types";

export class BillingService {
  /**
   * Get bills with filters
   */
  static async getBills(filters: BillingFilters = {}): Promise<BillingResponse> {
    const params = new URLSearchParams();

    if (filters.year) params.append("year", filters.year.toString());
    if (filters.month) params.append("month", filters.month.toString());
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        filters.status.forEach((s) => params.append("status[]", s));
      } else {
        params.append("status", filters.status);
      }
    }
    if (filters.student_id) {
      if (Array.isArray(filters.student_id)) {
        filters.student_id.forEach((id) => params.append("student_id[]", id.toString()));
      } else {
        params.append("student_id", filters.student_id.toString());
      }
    }
    if (filters.teacher_id) params.append("teacher_id", filters.teacher_id.toString());
    if (filters.is_custom !== undefined) params.append("is_custom", filters.is_custom.toString());

    const url = `${API_ENDPOINTS.ADMIN.BILLS}?${params.toString()}`;
    const response = await apiClient.get<BillingResponse>(url);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to fetch bills");
  }

  /**
   * Get billing statistics for a month
   */
  static async getStatistics(year: number, month: number): Promise<BillingStatistics> {
    const params = new URLSearchParams();
    params.append("year", year.toString());
    params.append("month", month.toString());

    const url = `${API_ENDPOINTS.ADMIN.BILLS_STATISTICS}?${params.toString()}`;
    const response = await apiClient.get<BillingStatistics>(url);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to fetch statistics");
  }

  /**
   * Get single bill with details
   */
  static async getBill(id: number): Promise<BillDetails> {
    const response = await apiClient.get<{ bill: Bill; classes: any[] }>(
      API_ENDPOINTS.ADMIN.BILL(id)
    );

    if (response.status === "success" && response.data) {
      return {
        ...response.data.bill,
        classes: response.data.classes,
      } as BillDetails;
    }

    throw new Error(response.message || "Failed to fetch bill");
  }

  /**
   * Create custom bill
   */
  static async createCustomBill(data: CreateCustomBillData): Promise<Bill> {
    const response = await apiClient.post<Bill>(API_ENDPOINTS.ADMIN.BILLS, data);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to create custom bill");
  }

  /**
   * Mark bill as paid
   */
  static async markAsPaid(id: number, data: MarkBillPaidData): Promise<Bill> {
    const response = await apiClient.put<Bill>(API_ENDPOINTS.ADMIN.BILL_MARK_PAID(id), data);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to mark bill as paid");
  }

  /**
   * Send bill via WhatsApp directly to student
   */
  static async sendViaWhatsApp(id: number, whatsappNumber?: string): Promise<void> {
    const response = await apiClient.post<void>(
      API_ENDPOINTS.ADMIN.BILL_SEND_WHATSAPP(id),
      whatsappNumber ? { whatsapp_number: whatsappNumber } : {}
    );

    if (response.status === "success") {
      return;
    }

    throw new Error(response.message || "Failed to send WhatsApp message");
  }

  /**
   * Download bill PDF
   */
  static async downloadPDF(id: number): Promise<Blob> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const token =
      typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.BILL_PDF(id)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/pdf",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to download PDF: ${response.status} ${errorText}`);
    }

    return response.blob();
  }

  /**
   * Generate payment token
   */
  static async generatePaymentToken(id: number): Promise<{ token: string; payment_url: string }> {
    const response = await apiClient.post<{ token: string; payment_url: string }>(
      API_ENDPOINTS.ADMIN.BILL_GENERATE_TOKEN(id)
    );

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to generate payment token");
  }

  /**
   * Get bill for public payment page (no auth)
   */
  static async getPublicBill(token: string): Promise<BillDetails> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EXTERNAL.PAYMENT(token)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch bill");
    }

    const data = await response.json();

    if (data.status === "success" && data.data) {
      return {
        ...data.data.bill,
        classes: data.data.classes,
      } as BillDetails;
    }

    throw new Error(data.message || "Failed to fetch bill");
  }

  /**
   * Download PDF for public payment page (no auth)
   */
  static async downloadPublicPDF(token: string): Promise<Blob> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EXTERNAL.PAYMENT_PDF(token)}`, {
      method: "GET",
      headers: {
        Accept: "application/pdf",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to download PDF: ${response.status} ${errorText}`);
    }

    return response.blob();
  }

  /**
   * Process payment (placeholder, no real integration)
   */
  static async processPayment(token: string, paymentMethod: string): Promise<void> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EXTERNAL.PAYMENT_PROCESS(token)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ payment_method: paymentMethod }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to process payment");
    }

    const data = await response.json();

    if (data.status !== "success") {
      throw new Error(data.message || "Failed to process payment");
    }
  }

  /**
   * Create PayPal payment
   */
  static async createPayPalPayment(token: string): Promise<{ payment_id: string; approval_url: string }> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EXTERNAL.PAYMENT_PAYPAL_CREATE(token)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create PayPal payment");
    }

    const data = await response.json();

    if (data.status !== "success" || !data.data) {
      throw new Error(data.message || "Failed to create PayPal payment");
    }

    return {
      payment_id: data.data.payment_id,
      approval_url: data.data.approval_url,
    };
  }

  /**
   * Execute PayPal payment
   */
  static async executePayPalPayment(
    token: string,
    paymentId: string,
    payerId: string
  ): Promise<{ payment_id: string; transaction_id?: string; amount: string; currency: string }> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EXTERNAL.PAYMENT_PAYPAL_EXECUTE(token)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        paymentId,
        PayerID: payerId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to execute PayPal payment");
    }

    const data = await response.json();

    if (data.status !== "success" || !data.data) {
      throw new Error(data.message || "Failed to execute PayPal payment");
    }

    return {
      payment_id: data.data.payment_id,
      transaction_id: data.data.transaction_id,
      amount: data.data.amount,
      currency: data.data.currency,
    };
  }

  /**
   * Create PayPal order for Smart Buttons
   */
  static async createPayPalOrder(token: string, amount: number, currency: string): Promise<{ order_id: string }> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EXTERNAL.PAYMENT_PAYPAL_ORDER(token)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create PayPal order");
    }

    const data = await response.json();

    if (data.status !== "success" || !data.data) {
      throw new Error(data.message || "Failed to create PayPal order");
    }

    return {
      order_id: data.data.order_id,
    };
  }

  /**
   * Capture PayPal order for Smart Buttons
   */
  static async capturePayPalOrder(token: string, orderID: string): Promise<void> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EXTERNAL.PAYMENT_PAYPAL_CAPTURE(token)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ orderID }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to capture PayPal order");
    }

    const data = await response.json();

    if (data.status !== "success") {
      throw new Error(data.message || "Failed to capture PayPal order");
    }
  }
}
