"use client";

import { Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Expense } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface ExpensesTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpensesTable({
  expenses,
  onEdit,
  onDelete,
}: ExpensesTableProps) {
  const { t, direction } = useLanguage();

  const getCategoryBadge = (category: Expense["category"]) => {
    const variants = {
      salaries: "bg-blue-100 text-blue-700 border-blue-200",
      tools: "bg-purple-100 text-purple-700 border-purple-200",
      marketing: "bg-pink-100 text-pink-700 border-pink-200",
      misc: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return (
      <Badge
        variant="outline"
        className={cn("border", variants[category] || variants.misc)}
      >
        {t(`financials.categories.${category}`) || category}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (expenses.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">
          {t("financials.noExpenses") || "No expenses found"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className={cn(direction === "rtl" ? "text-right" : "text-left")}>
              {t("financials.table.date") || "Date"}
            </TableHead>
            <TableHead className={cn(direction === "rtl" ? "text-right" : "text-left")}>
              {t("financials.table.category") || "Category"}
            </TableHead>
            <TableHead className={cn(direction === "rtl" ? "text-right" : "text-left")}>
              {t("financials.table.description") || "Description"}
            </TableHead>
            <TableHead className={cn(direction === "rtl" ? "text-right" : "text-left")}>
              {t("financials.table.amount") || "Amount"}
            </TableHead>
            <TableHead className={cn(direction === "rtl" ? "text-right" : "text-left", "w-24")}>
              {t("common.actions") || "Actions"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>{formatDate(expense.expense_date)}</TableCell>
              <TableCell>{getCategoryBadge(expense.category)}</TableCell>
              <TableCell className="max-w-xs truncate">
                {expense.description}
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(expense.amount, expense.currency)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(expense)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(expense)}
                    className="h-8 w-8 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
