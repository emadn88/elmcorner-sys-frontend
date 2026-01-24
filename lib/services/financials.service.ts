/**
 * Financials Service
 * Service layer for financial operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  FinancialSummary,
  IncomeBreakdown,
  ExpenseBreakdown,
  MonthlyTrend,
  Expense,
  ExpenseFilters,
  CreateExpenseData,
  UpdateExpenseData,
  PaginatedResponse,
  CurrencyStatistics,
  CurrencyConversionRequest,
  CurrencyConversionResult,
} from "@/lib/api/types";

export class FinancialsService {
  /**
   * Get comprehensive financial summary
   */
  static async getFinancialSummary(filters?: {
    date_from?: string;
    date_to?: string;
    currency?: string;
  }): Promise<FinancialSummary> {
    const params = new URLSearchParams();

    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);
    if (filters?.currency) params.append("currency", filters.currency);

    const url = `${API_ENDPOINTS.ADMIN.FINANCIALS.SUMMARY}?${params.toString()}`;
    const response = await apiClient.get<FinancialSummary>(url);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch financial summary");
  }

  /**
   * Get income breakdown
   */
  static async getIncomeBreakdown(filters?: {
    date_from?: string;
    date_to?: string;
    currency?: string;
    group_by?: "month" | "teacher" | "course";
  }): Promise<IncomeBreakdown> {
    const params = new URLSearchParams();

    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);
    if (filters?.currency) params.append("currency", filters.currency);
    if (filters?.group_by) params.append("group_by", filters.group_by);

    const url = `${API_ENDPOINTS.ADMIN.FINANCIALS.INCOME}?${params.toString()}`;
    const response = await apiClient.get<IncomeBreakdown>(url);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch income breakdown");
  }

  /**
   * Get expense breakdown
   */
  static async getExpenseBreakdown(filters?: {
    date_from?: string;
    date_to?: string;
    currency?: string;
  }): Promise<ExpenseBreakdown> {
    const params = new URLSearchParams();

    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);
    if (filters?.currency) params.append("currency", filters.currency);

    const url = `${API_ENDPOINTS.ADMIN.FINANCIALS.EXPENSES}?${params.toString()}`;
    const response = await apiClient.get<ExpenseBreakdown>(url);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch expense breakdown");
  }

  /**
   * Get monthly trends
   */
  static async getTrends(year?: string): Promise<MonthlyTrend[]> {
    const params = new URLSearchParams();

    if (year) params.append("year", year);

    const url = `${API_ENDPOINTS.ADMIN.FINANCIALS.TRENDS}?${params.toString()}`;
    const response = await apiClient.get<MonthlyTrend[]>(url);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch trends");
  }

  /**
   * Get expenses list with filters and pagination
   */
  static async getExpenses(filters: ExpenseFilters = {}): Promise<PaginatedResponse<Expense>> {
    const params = new URLSearchParams();

    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);
    if (filters.category && filters.category !== "all")
      params.append("category", filters.category);
    if (filters.currency) params.append("currency", filters.currency);
    if (filters.per_page) params.append("per_page", filters.per_page.toString());
    if (filters.page) params.append("page", filters.page.toString());

    const url = `${API_ENDPOINTS.ADMIN.EXPENSES}?${params.toString()}`;
    const response = await apiClient.get<Expense[]>(url);

    if (response.status === "success") {
      return {
        data: response.data as any,
        current_page: (response as any).meta?.current_page || 1,
        last_page: (response as any).meta?.last_page || 1,
        per_page: (response as any).meta?.per_page || 15,
        total: (response as any).meta?.total || 0,
      };
    }

    throw new Error("Failed to fetch expenses");
  }

  /**
   * Get single expense
   */
  static async getExpense(id: number): Promise<Expense> {
    const response = await apiClient.get<Expense>(API_ENDPOINTS.ADMIN.EXPENSE(id));

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch expense");
  }

  /**
   * Create new expense
   */
  static async createExpense(data: CreateExpenseData): Promise<Expense> {
    const response = await apiClient.post<Expense>(API_ENDPOINTS.ADMIN.EXPENSES, data);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to create expense");
  }

  /**
   * Update expense
   */
  static async updateExpense(id: number, data: UpdateExpenseData): Promise<Expense> {
    const response = await apiClient.put<Expense>(API_ENDPOINTS.ADMIN.EXPENSE(id), data);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to update expense");
  }

  /**
   * Delete expense
   */
  static async deleteExpense(id: number): Promise<void> {
    const response = await apiClient.delete(API_ENDPOINTS.ADMIN.EXPENSE(id));

    if (response.status !== "success") {
      throw new Error(response.message || "Failed to delete expense");
    }
  }

  /**
   * Get income statistics by currency
   */
  static async getIncomeByCurrency(filters?: {
    date_from?: string;
    date_to?: string;
  }): Promise<CurrencyStatistics[]> {
    const params = new URLSearchParams();

    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);

    const url = `${API_ENDPOINTS.ADMIN.FINANCIALS.INCOME_BY_CURRENCY}?${params.toString()}`;
    const response = await apiClient.get<CurrencyStatistics[]>(url);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch currency statistics");
  }

  /**
   * Convert currency
   */
  static async convertCurrency(
    data: CurrencyConversionRequest
  ): Promise<CurrencyConversionResult> {
    const response = await apiClient.post<CurrencyConversionResult>(
      API_ENDPOINTS.ADMIN.FINANCIALS.CONVERT_CURRENCY,
      data
    );

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to convert currency");
  }
}
