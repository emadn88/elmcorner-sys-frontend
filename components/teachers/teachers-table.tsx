"use client";

import { Edit, Trash2, Eye, TrendingUp, Info, Key, Loader2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
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
import { Teacher } from "@/types/teachers";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface TeachersTableProps {
  teachers: Teacher[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
  onView: (teacher: Teacher) => void;
  onViewPerformance?: (teacher: Teacher) => void;
  onViewDetails?: (teacher: Teacher) => void;
  onSendWhatsApp?: (teacher: Teacher) => void;
  onViewCredentials?: (teacher: Teacher) => void;
  sendingWhatsAppId?: number | null;
}

export function TeachersTable({
  teachers,
  selectedIds,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onView,
  onViewPerformance,
  onViewDetails,
  onSendWhatsApp,
  onViewCredentials,
  sendingWhatsAppId,
}: TeachersTableProps) {
  const { t, direction } = useLanguage();
  const allSelected = teachers.length > 0 && selectedIds.length === teachers.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < teachers.length;

  const getStatusBadge = (status: Teacher["status"]) => {
    const variants = {
      active: "bg-green-100 text-green-700 border-green-200",
      inactive: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return (
      <Badge
        variant="outline"
        className={cn("border", variants[status] || variants.inactive)}
      >
        {t(`teachers.${status}`) || status}
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
            <TableHead>{t("teachers.name") || "Name"}</TableHead>
            <TableHead>{t("teachers.email") || "Email"}</TableHead>
            <TableHead>{t("teachers.courses") || "Courses"}</TableHead>
            <TableHead>{t("teachers.hourlyRate") || "Hourly Rate"}</TableHead>
            <TableHead>{t("teachers.status") || "Status"}</TableHead>
            <TableHead className={cn("w-[70px]", direction === "rtl" ? "text-left" : "text-right")}>
              {t("teachers.actions") || "Actions"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-sm text-gray-500">
                    {t("teachers.noTeachersFound") || "No teachers found"}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            teachers.map((teacher) => (
              <TableRow
                key={teacher.id}
                className={cn(
                  "transition-colors hover:bg-gray-50/50",
                  selectedIds.includes(String(teacher.id)) && "bg-purple-50/50"
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(String(teacher.id))}
                    onCheckedChange={() => onSelect(String(teacher.id))}
                    aria-label={`Select ${teacher.user?.name || "teacher"}`}
                  />
                </TableCell>
                <TableCell>
                  <div className={cn(
                    "min-w-0",
                    direction === "rtl" ? "text-right" : "text-left"
                  )}>
                    <div className="font-medium text-gray-900 truncate">
                      {teacher.user?.name || "N/A"}
                    </div>
                    {teacher.user?.whatsapp && (
                      <div className="text-xs text-gray-500 truncate">
                        {teacher.user.whatsapp}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">{teacher.user?.email || "—"}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">
                    {teacher.courses?.length || 0} {t("teachers.courses") || "courses"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">
                    {teacher.hourly_rate} {teacher.currency}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                <TableCell>
                  <div className={cn("flex items-center gap-0.5", direction === "rtl" ? "justify-start" : "justify-end")}>
                    <TooltipProvider>
                      {onViewDetails && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              onClick={() => onViewDetails(teacher)}
                            >
                              <Info className="h-4 w-4" />
                              <span className="sr-only">{t("teachers.details") || "Details"}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("teachers.details") || "Details"}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            onClick={() => onView(teacher)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">{t("teachers.view") || "View"}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("teachers.view") || "View"}</p>
                        </TooltipContent>
                      </Tooltip>
                      {onViewPerformance && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              onClick={() => onViewPerformance(teacher)}
                            >
                              <TrendingUp className="h-4 w-4" />
                              <span className="sr-only">{t("teachers.performance") || "Performance"}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("teachers.performance") || "Performance"}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {onSendWhatsApp && teacher.user?.whatsapp && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                              onClick={() => onSendWhatsApp(teacher)}
                              disabled={sendingWhatsAppId === teacher.id}
                            >
                              {sendingWhatsAppId === teacher.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <WhatsAppIcon className="h-4 w-4" />
                              )}
                              <span className="sr-only">{t("teachers.sendWhatsApp") || "Send WhatsApp"}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {sendingWhatsAppId === teacher.id
                                ? t("teachers.sending") || "جاري الإرسال..."
                                : t("teachers.sendWhatsApp") || "Send WhatsApp"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {onViewCredentials && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
                              onClick={() => onViewCredentials(teacher)}
                            >
                              <Key className="h-4 w-4" />
                              <span className="sr-only">{t("teachers.viewCredentials") || "View Credentials"}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("teachers.viewCredentials") || "View Credentials"}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            onClick={() => onEdit(teacher)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">{t("teachers.edit") || "Edit"}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("teachers.edit") || "Edit"}</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => onDelete(teacher)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">{t("teachers.delete") || "Delete"}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("teachers.delete") || "Delete"}</p>
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
