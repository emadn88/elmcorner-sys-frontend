"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { FinancialsService } from "@/lib/services/financials.service";
import {
  FinancialSummary,
  Expense,
  ExpenseFilters,
  CreateExpenseData,
  UpdateExpenseData,
  CurrencyStatistics,
} from "@/lib/api/types";
import { FinancialSummaryCards } from "@/components/financials/financial-summary-cards";
import { IncomeExpensesChart } from "@/components/financials/income-expenses-chart";
import { ExpenseBreakdownChart } from "@/components/financials/expense-breakdown-chart";
import { MonthlyTrendsChart } from "@/components/financials/monthly-trends-chart";
import { ExpensesTable } from "@/components/financials/expenses-table";
import { ExpenseFiltersComponent } from "@/components/financials/expense-filters";
import { ExpenseFormModal } from "@/components/financials/expense-form-modal";
import { CurrencyStatisticsComponent } from "@/components/financials/currency-statistics";
import { CurrencyStatisticsCards } from "@/components/financials/currency-statistics-cards";
import { CurrencyConverter } from "@/components/financials/currency-converter";
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
import { cn } from "@/lib/utils";
// Toast notifications removed - using simple state-based alerts

export default function FinancialsPage() {
  const { t, direction } = useLanguage();
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currencyStats, setCurrencyStats] = useState<CurrencyStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [currencyStatsLoading, setCurrencyStatsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<ExpenseFilters>({
    category: "all",
    page: 1,
    per_page: 10,
  });

  const [dateRange, setDateRange] = useState({
    date_from: "",
    date_to: "",
  });

  useEffect(() => {
    loadFinancialData();
    loadCurrencyStatistics();
  }, [dateRange]);

  useEffect(() => {
    loadExpenses();
  }, [filters]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      const data = await FinancialsService.getFinancialSummary({
        date_from: dateRange.date_from || undefined,
        date_to: dateRange.date_to || undefined,
      });
      setSummary(data);
    } catch (error: any) {
      setNotification({ type: "error", message: error.message || t("common.errorOccurred") || "An error occurred" });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      setExpensesLoading(true);
      const response = await FinancialsService.getExpenses({
        ...filters,
        date_from: dateRange.date_from || filters.date_from,
        date_to: dateRange.date_to || filters.date_to,
      });
      setExpenses(response.data);
      setCurrentPage(response.current_page);
      setTotalPages(response.last_page);
    } catch (error: any) {
      setNotification({ type: "error", message: error.message || t("common.errorOccurred") || "An error occurred" });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setExpensesLoading(false);
    }
  };

  const loadCurrencyStatistics = async () => {
    try {
      setCurrencyStatsLoading(true);
      const stats = await FinancialsService.getIncomeByCurrency({
        date_from: dateRange.date_from || undefined,
        date_to: dateRange.date_to || undefined,
      });
      setCurrencyStats(stats);
    } catch (error: any) {
      setNotification({ type: "error", message: error.message || t("common.errorOccurred") || "An error occurred" });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setCurrencyStatsLoading(false);
    }
  };

  const handleCreateExpense = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleSaveExpense = async (data: CreateExpenseData | UpdateExpenseData) => {
    try {
      setIsSaving(true);
      if (editingExpense) {
        await FinancialsService.updateExpense(editingExpense.id, data);
        setNotification({ type: "success", message: t("financials.expenseUpdated") || "Expense updated successfully" });
        setTimeout(() => setNotification(null), 5000);
      } else {
        await FinancialsService.createExpense(data as CreateExpenseData);
        setNotification({ type: "success", message: t("financials.expenseCreated") || "Expense created successfully" });
        setTimeout(() => setNotification(null), 5000);
      }
      setIsModalOpen(false);
      setEditingExpense(null);
      await loadExpenses();
      await loadFinancialData();
    } catch (error: any) {
      setNotification({ type: "error", message: error.message || t("common.errorOccurred") || "An error occurred" });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExpense = (expense: Expense) => {
    setDeleteExpense(expense);
  };

  const confirmDelete = async () => {
    if (!deleteExpense) return;

    try {
      setIsDeleting(true);
      await FinancialsService.deleteExpense(deleteExpense.id);
      setNotification({ type: "success", message: t("financials.expenseDeleted") || "Expense deleted successfully" });
      setTimeout(() => setNotification(null), 5000);
      setDeleteExpense(null);
      await loadExpenses();
      await loadFinancialData();
    } catch (error: any) {
      setNotification({ type: "error", message: error.message || t("common.errorOccurred") || "An error occurred" });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    loadFinancialData();
    loadExpenses();
    loadCurrencyStatistics();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t("common.errorOccurred") || "Failed to load data"}</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", direction === "rtl" ? "text-right" : "text-left")}>
      {notification && (
        <div
          className={cn(
            "rounded-lg p-4 border",
            notification.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          )}
        >
          {notification.message}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("sidebar.financials") || "Financials"}
          </h1>
          <p className="text-gray-600 mt-2">
            {t("financials.description") || "Track income, expenses, and profit"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button onClick={handleCreateExpense}>
            <Plus className="h-4 w-4 mr-2" />
            {t("financials.addExpense") || "Add Expense"}
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("common.dateRange") || "Date Range"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_from">
                {t("common.dateFrom") || "Date From"}
              </Label>
              <Input
                id="date_from"
                type="date"
                value={dateRange.date_from}
                onChange={(e) =>
                  setDateRange({ ...dateRange, date_from: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_to">
                {t("common.dateTo") || "Date To"}
              </Label>
              <Input
                id="date_to"
                type="date"
                value={dateRange.date_to}
                onChange={(e) =>
                  setDateRange({ ...dateRange, date_to: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <FinancialSummaryCards summary={summary} />

      {/* Currency Statistics Cards */}
      {currencyStatsLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {t("financials.currencyStatistics.title") || "Income by Currency"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyStatisticsCards statistics={currencyStats} />
          </CardContent>
        </Card>
      )}

      {/* Currency Converter */}
      <CurrencyConverter />

      {/* Currency Statistics Table */}
      {currencyStatsLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <CurrencyStatisticsComponent statistics={currencyStats} />
      )}

      {/* Monthly Trends Chart */}
      <MonthlyTrendsChart summary={summary} />

      {/* Charts - Moved to bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeExpensesChart summary={summary} />
        <ExpenseBreakdownChart summary={summary} />
      </div>

      {/* Expenses Management */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("financials.expenses") || "Expenses"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExpenseFiltersComponent filters={filters} onFiltersChange={setFilters} />

          {expensesLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <ExpensesTable
                expenses={expenses}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {t("common.page") || "Page"} {currentPage} {t("common.of") || "of"} {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({ ...filters, page: currentPage - 1 })}
                      disabled={currentPage === 1}
                    >
                      {t("common.previous") || "Previous"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({ ...filters, page: currentPage + 1 })}
                      disabled={currentPage === totalPages}
                    >
                      {t("common.next") || "Next"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Expense Form Modal */}
      <ExpenseFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        expense={editingExpense}
        onSave={handleSaveExpense}
        isLoading={isSaving}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteExpense}
        onOpenChange={(open) => !open && setDeleteExpense(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("common.confirmDelete") || "Confirm Delete"}
            </DialogTitle>
            <DialogDescription>
              {t("financials.deleteExpenseConfirm") ||
                "Are you sure you want to delete this expense? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteExpense(null)}
              disabled={isDeleting}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting
                ? t("common.deleting") || "Deleting..."
                : t("common.delete") || "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
