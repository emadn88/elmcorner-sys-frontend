"use client";

import { useState } from "react";
import { Edit, Trash2, Eye, List } from "lucide-react";
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
import { Package } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface PackagesTableProps {
  packages: Package[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onEdit: (pkg: Package) => void;
  onDelete: (pkg: Package) => void;
  onView?: (pkg: Package) => void;
  onViewClasses?: (pkg: Package) => void;
}

export function PackagesTable({
  packages,
  selectedIds,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onView,
  onViewClasses,
}: PackagesTableProps) {
  const { t, direction } = useLanguage();
  const allSelected = packages.length > 0 && selectedIds.length === packages.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < packages.length;

  const getStatusBadge = (status: Package["status"]) => {
    const variants = {
      active: "bg-green-100 text-green-700 border-green-200",
      finished: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return (
      <Badge
        variant="outline"
        className={cn("border", variants[status] || variants.finished)}
      >
        {t(`packages.${status}`) || status}
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
            <TableHead>{t("packages.student")}</TableHead>
            <TableHead>{t("packages.roundNumber")}</TableHead>
            <TableHead>{t("packages.totalHours") || "Total Hours"}</TableHead>
            <TableHead>{t("packages.remainingHours") || "Remaining Hours"}</TableHead>
            <TableHead>{t("packages.startDate")}</TableHead>
            <TableHead>{t("packages.status")}</TableHead>
            <TableHead className={cn("w-[70px]", direction === "rtl" ? "text-left" : "text-right")}>
              {t("students.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-sm text-gray-500">
                    {t("packages.noPackagesFound")}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            packages.map((pkg) => {
              const isSelected = selectedIds.includes(String(pkg.id));
              const isFinished = pkg.status === "finished";
              return (
                <TableRow 
                  key={pkg.id} 
                  className={cn(
                    isSelected ? "bg-gray-50" : "",
                    isFinished ? "bg-gray-100/50" : ""
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onSelect(String(pkg.id))}
                      aria-label={`Select package ${pkg.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {pkg.student?.full_name || `Student #${pkg.student_id}`}
                  </TableCell>
                  <TableCell>{pkg.round_number}</TableCell>
                  <TableCell>{pkg.total_hours || 0}h</TableCell>
                  <TableCell>{pkg.remaining_hours !== null && pkg.remaining_hours !== undefined ? `${pkg.remaining_hours}h` : '-'}</TableCell>
                  <TableCell>{formatDate(pkg.start_date)}</TableCell>
                  <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                  <TableCell>
                    <div className={cn("flex gap-2", direction === "rtl" ? "flex-row-reverse" : "")}>
                      <TooltipProvider>
                        {onViewClasses && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onViewClasses(pkg)}
                              >
                                <List className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("packages.viewClasses") || "View Classes"}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {onView && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onView(pkg)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("students.view")}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(pkg)}
                            >
                              <Edit className="h-4 w-4" />
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
                              onClick={() => onDelete(pkg)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
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
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
