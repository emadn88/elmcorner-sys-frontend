"use client";

import { useState } from "react";
import { Edit, Trash2, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Student } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface StudentsTableProps {
  students: Student[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onView: (student: Student) => void;
}

export function StudentsTable({
  students,
  selectedIds,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onView,
}: StudentsTableProps) {
  const { t, direction } = useLanguage();
  const allSelected = students.length > 0 && selectedIds.length === students.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < students.length;

  const getStatusBadge = (status: Student["status"]) => {
    const variants = {
      active: "bg-green-100 text-green-700 border-green-200",
      paused: "bg-yellow-100 text-yellow-700 border-yellow-200",
      stopped: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return (
      <Badge
        variant="outline"
        className={cn("border", variants[status] || variants.stopped)}
      >
        {t(`students.${status}`) || status}
      </Badge>
    );
  };

  const getTypeBadge = (type: Student["type"]) => {
    const variants = {
      trial: "bg-blue-100 text-blue-700 border-blue-200",
      confirmed: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return (
      <Badge
        variant="outline"
        className={cn("border", variants[type] || variants.trial)}
      >
        {t(`students.type.${type}`) || type}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(t("common.locale") || "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="rounded-md border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onSelectAll(checked === true)}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>{t("students.name")}</TableHead>
            <TableHead>{t("students.email")}</TableHead>
            <TableHead>{t("students.whatsapp")}</TableHead>
            <TableHead>{t("students.currency")}</TableHead>
            <TableHead>{t("students.country")}</TableHead>
            <TableHead>{t("students.type.label") || "Type"}</TableHead>
            <TableHead>{t("students.status")}</TableHead>
            <TableHead>{t("students.family")}</TableHead>
            <TableHead className={cn("w-[70px]", direction === "rtl" ? "text-left" : "text-right")}>
              {t("students.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-sm text-gray-500">
                    {t("students.noStudentsFound")}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            students.map((student, index) => (
              <TableRow
                key={student.id}
                className={cn(
                  "transition-colors hover:bg-gray-50/50",
                  selectedIds.includes(String(student.id)) && "bg-purple-50/50"
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(String(student.id))}
                    onCheckedChange={() => onSelect(String(student.id))}
                    aria-label={`Select ${student.full_name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className={cn(
                    "min-w-0",
                    direction === "rtl" ? "text-right" : "text-left"
                  )}>
                    <div className="font-medium text-gray-900 truncate">
                      {student.full_name}
                    </div>
                    {student.whatsapp && (
                      <div className="text-xs text-gray-500 truncate" dir="ltr">
                        {student.whatsapp}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">{student.email || "—"}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600" dir="ltr">
                    {student.whatsapp || "—"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600 font-medium">
                    {student.currency || "—"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">
                    {student.country || "—"}
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(student.type)}</TableCell>
                <TableCell>{getStatusBadge(student.status)}</TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">
                    {student.family?.name || "—"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className={cn("flex items-center gap-0.5", direction === "rtl" ? "justify-start" : "justify-end")}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            onClick={() => onView(student)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">{t("students.view")}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("students.view")}</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            onClick={() => onEdit(student)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">{t("students.edit")}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("students.edit")}</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => onDelete(student)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">{t("students.delete")}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("students.delete")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}



