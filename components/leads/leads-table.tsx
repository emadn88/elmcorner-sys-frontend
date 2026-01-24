"use client";

import { Edit, Trash2, MessageCircle, ArrowRight, FlaskConical } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lead } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/lib/countries-timezones";

interface LeadsTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
  onAddTrial?: (lead: Lead) => void;
}

export function LeadsTable({
  leads,
  onEdit,
  onDelete,
  onConvert,
  onAddTrial,
}: LeadsTableProps) {
  const { t, direction } = useLanguage();

  const getStatusBadge = (status: Lead["status"]) => {
    const variants: Record<string, string> = {
      new: "bg-blue-100 text-blue-700 border-blue-200",
      contacted: "bg-green-100 text-green-700 border-green-200",
      needs_follow_up: "bg-yellow-100 text-yellow-700 border-yellow-200",
      trial_scheduled: "bg-purple-100 text-purple-700 border-purple-200",
      trial_confirmed: "bg-indigo-100 text-indigo-700 border-indigo-200",
      converted: "bg-emerald-100 text-emerald-700 border-emerald-200",
      not_interested: "bg-gray-100 text-gray-700 border-gray-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    return (
      <Badge
        variant="outline"
        className={cn("border", variants[status] || variants.new)}
      >
        {t(`leads.status.${status}`) || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: Lead["priority"]) => {
    const variants: Record<string, string> = {
      high: "bg-red-100 text-red-700 border-red-200",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      low: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return (
      <Badge
        variant="outline"
        className={cn("border text-xs", variants[priority] || variants.medium)}
      >
        {t(`leads.priority.${priority}`) || priority}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString(t("common.locale") || "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const isOverdue = date < new Date();
    return (
      <span className={cn(isOverdue && "text-red-600 font-medium")}>
        {date.toLocaleDateString(t("common.locale") || "en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
        {isOverdue && " (Overdue)"}
      </span>
    );
  };

  const getCountryName = (code?: string) => {
    if (!code) return "-";
    const country = COUNTRIES.find((c) => c.code === code);
    return country?.name || code;
  };

  const getDaysSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const openWhatsApp = (whatsapp: string) => {
    const cleanNumber = whatsapp.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanNumber}`, "_blank");
  };

  return (
    <div className="rounded-md border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead>{t("leads.name") || "Name"}</TableHead>
            <TableHead>{t("leads.whatsapp") || "WhatsApp"}</TableHead>
            <TableHead>{t("leads.country") || "Country"}</TableHead>
            <TableHead>{t("leads.students") || "Students"}</TableHead>
            <TableHead>{t("leads.statusLabel") || "Status"}</TableHead>
            <TableHead>{t("leads.priorityLabel") || "Priority"}</TableHead>
            <TableHead>{t("leads.nextFollowUp") || "Next Follow-up"}</TableHead>
            <TableHead>{t("leads.daysSince") || "Days"}</TableHead>
            <TableHead className={cn("w-[120px]", direction === "rtl" ? "text-left" : "text-right")}>
              {t("leads.actions") || "Actions"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-sm text-gray-500">
                    {t("leads.noLeadsFound") || "No leads found"}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow
                key={lead.id}
                className="transition-colors hover:bg-gray-50/50"
              >
                <TableCell>
                  <div className={cn(
                    "min-w-0",
                    direction === "rtl" ? "text-right" : "text-left"
                  )}>
                    <div className="font-medium text-gray-900">
                      {lead.name}
                    </div>
                    {lead.source && (
                      <div className="text-xs text-gray-500">
                        {lead.source}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm" dir="ltr" style={{ textAlign: "left" }}>{lead.whatsapp}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => openWhatsApp(lead.whatsapp)}
                          >
                            <MessageCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("leads.openWhatsApp") || "Open WhatsApp"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{getCountryName(lead.country)}</span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <span className="font-medium">{lead.number_of_students}</span>
                    {lead.ages && lead.ages.length > 0 && (
                      <span className="text-gray-500 ml-1">
                        ({lead.ages.join(", ")})
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(lead.status)}</TableCell>
                <TableCell>{getPriorityBadge(lead.priority)}</TableCell>
                <TableCell>
                  {formatDateTime(lead.next_follow_up)}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {getDaysSince(lead.created_at)} {t("leads.days") || "days"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className={cn(
                    "flex items-center gap-1",
                    direction === "rtl" ? "flex-row-reverse" : ""
                  )}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => onEdit(lead)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("leads.edit") || "Edit"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {lead.status !== "converted" && onAddTrial && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-purple-600"
                              onClick={() => onAddTrial(lead)}
                            >
                              <FlaskConical className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("leads.addTrial") || "Add Trial"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {lead.status !== "converted" && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-green-600"
                              onClick={() => onConvert(lead)}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("leads.convert") || "Convert to Student"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600"
                            onClick={() => onDelete(lead)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("leads.delete") || "Delete"}</p>
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
