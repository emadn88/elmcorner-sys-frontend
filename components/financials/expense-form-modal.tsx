"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Expense, CreateExpenseData, UpdateExpenseData } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface ExpenseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
  onSave: (data: CreateExpenseData | UpdateExpenseData) => Promise<void>;
  isLoading?: boolean;
}

export function ExpenseFormModal({
  open,
  onOpenChange,
  expense,
  onSave,
  isLoading = false,
}: ExpenseFormModalProps) {
  const { t, direction } = useLanguage();
  const isEdit = !!expense;

  const [formData, setFormData] = useState({
    category: (expense?.category || "misc") as "salaries" | "tools" | "marketing" | "misc",
    description: expense?.description || "",
    amount: expense?.amount || 0,
    currency: expense?.currency || "USD",
    expense_date: expense?.expense_date || new Date().toISOString().split("T")[0],
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (expense) {
        setFormData({
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
          currency: expense.currency,
          expense_date: expense.expense_date,
        });
      } else {
        setFormData({
          category: "misc",
          description: "",
          amount: 0,
          currency: "USD",
          expense_date: new Date().toISOString().split("T")[0],
        });
      }
      setError(null);
    }
  }, [open, expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.description.trim()) {
      setError(t("financials.expenseForm.errors.descriptionRequired") || "Description is required");
      return;
    }

    if (formData.amount <= 0) {
      setError(t("financials.expenseForm.errors.amountRequired") || "Amount must be greater than 0");
      return;
    }

    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || t("common.error") || "An error occurred");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-[500px]",
          direction === "rtl" ? "text-right" : "text-left"
        )}
      >
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t("financials.expenseForm.editTitle") || "Edit Expense"
              : t("financials.expenseForm.createTitle") || "Create Expense"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("financials.expenseForm.editDescription") || "Update expense details"
              : t("financials.expenseForm.createDescription") || "Add a new expense to track"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">
              {t("financials.expenseForm.category") || "Category"}
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value as any })
              }
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salaries">
                  {t("financials.categories.salaries") || "Salaries"}
                </SelectItem>
                <SelectItem value="tools">
                  {t("financials.categories.tools") || "Tools"}
                </SelectItem>
                <SelectItem value="marketing">
                  {t("financials.categories.marketing") || "Marketing"}
                </SelectItem>
                <SelectItem value="misc">
                  {t("financials.categories.misc") || "Miscellaneous"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              {t("financials.expenseForm.description") || "Description"}
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder={t("financials.expenseForm.descriptionPlaceholder") || "Enter expense description"}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                {t("financials.expenseForm.amount") || "Amount"}
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">
                {t("financials.expenseForm.currency") || "Currency"}
              </Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="SAR">SAR</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                  <SelectItem value="EGP">EGP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense_date">
              {t("financials.expenseForm.date") || "Date"}
            </Label>
            <Input
              id="expense_date"
              type="date"
              value={formData.expense_date}
              onChange={(e) =>
                setFormData({ ...formData, expense_date: e.target.value })
              }
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? t("common.saving") || "Saving..."
                : isEdit
                ? t("common.update") || "Update"
                : t("common.create") || "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
