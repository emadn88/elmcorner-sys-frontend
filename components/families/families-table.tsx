"use client";

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
import { Family } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface FamiliesTableProps {
  families: Family[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onEdit: (family: Family) => void;
  onDelete: (family: Family) => void;
  onView?: (family: Family) => void;
}

export function FamiliesTable({
  families,
  selectedIds,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onView,
}: FamiliesTableProps) {
  const { t, direction } = useLanguage();
  const allSelected = families.length > 0 && selectedIds.length === families.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < families.length;

  const getStatusBadge = (status: Family["status"]) => {
    const variants = {
      active: "bg-green-100 text-green-700 border-green-200",
      inactive: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return (
      <Badge
        variant="outline"
        className={cn("border", variants[status] || variants.inactive)}
      >
        {status}
      </Badge>
    );
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
            <TableHead>{t("families.name") || "Name"}</TableHead>
            <TableHead>{t("families.email") || "Email"}</TableHead>
            <TableHead>{t("families.whatsapp") || "WhatsApp"}</TableHead>
            <TableHead>{t("families.status") || "Status"}</TableHead>
            <TableHead>{t("families.studentsCount") || "Students"}</TableHead>
            <TableHead className={cn("w-[70px]", direction === "rtl" ? "text-left" : "text-right")}>
              {t("families.actions") || "Actions"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {families.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-sm text-gray-500">
                    {t("families.noFamilies") || "No families found"}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            families.map((family) => (
              <TableRow
                key={family.id}
                className={cn(
                  "transition-colors hover:bg-gray-50/50",
                  selectedIds.includes(String(family.id)) && "bg-purple-50/50"
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(String(family.id))}
                    onCheckedChange={() => onSelect(String(family.id))}
                    aria-label={`Select ${family.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className={cn(
                    "min-w-0",
                    direction === "rtl" ? "text-right" : "text-left"
                  )}>
                    <div className="font-medium text-gray-900 truncate">
                      {family.name}
                    </div>
                    {family.country && (
                      <div className="text-xs text-gray-500 truncate">
                        {family.country}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">{family.email || "—"}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">{family.whatsapp || "—"}</div>
                </TableCell>
                <TableCell>{getStatusBadge(family.status)}</TableCell>
                <TableCell>
                  <div className="text-sm font-medium text-gray-900">
                    {family.students_count || 0}
                  </div>
                </TableCell>
                <TableCell>
                  <div className={cn("flex items-center gap-0.5", direction === "rtl" ? "justify-start" : "justify-end")}>
                    <TooltipProvider>
                      {onView && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                              onClick={() => onView(family)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">{t("families.view") || "View"}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("families.view") || "View"}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            onClick={() => onEdit(family)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">{t("families.edit") || "Edit"}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("families.edit") || "Edit"}</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => onDelete(family)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">{t("families.delete") || "Delete"}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("families.delete") || "Delete"}</p>
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
