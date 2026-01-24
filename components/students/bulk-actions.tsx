"use client";

import { Trash2, Download, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/language-context";
import { motion } from "framer-motion";

interface BulkActionsProps {
  selectedCount: number;
  onDelete: () => void;
  onExport: () => void;
  onStatusChange: (status: string) => void;
}

export function BulkActions({
  selectedCount,
  onDelete,
  onExport,
  onStatusChange,
}: BulkActionsProps) {
  const { t } = useLanguage();

  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-purple-900">
          {t("students.selectedCount", { count: selectedCount })}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="border-purple-300 text-purple-700 hover:bg-purple-100"
        >
          <Download className="h-4 w-4 mr-2" />
          {t("students.export")}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-purple-300 text-purple-700 hover:bg-purple-100"
            >
              <MoreHorizontal className="h-4 w-4 mr-2" />
              {t("students.changeStatus")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onStatusChange("active")}>
              {t("students.setActive")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("inactive")}>
              {t("students.setInactive")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("pending")}>
              {t("students.setPending")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          className="bg-red-600 hover:bg-red-700"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {t("students.deleteSelected")}
        </Button>
      </div>
    </motion.div>
  );
}



