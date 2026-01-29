"use client";

import { Users, Mail, DollarSign, Info, Eye, TrendingUp, Edit, Trash2, Key, Loader2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface TeachersCardViewProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
  onView: (teacher: Teacher) => void;
  onViewPerformance?: (teacher: Teacher) => void;
  onViewDetails?: (teacher: Teacher) => void;
  onSendWhatsApp?: (teacher: Teacher) => void;
  onViewCredentials?: (teacher: Teacher) => void;
  sendingWhatsAppId?: number | null;
}

export function TeachersCardView({
  teachers,
  onEdit,
  onDelete,
  onView,
  onViewPerformance,
  onViewDetails,
  onSendWhatsApp,
  onViewCredentials,
  sendingWhatsAppId,
}: TeachersCardViewProps) {
  const { t, direction } = useLanguage();

  const getStatusBadge = (status: Teacher["status"]) => {
    const variants = {
      active: "bg-green-100 text-green-700 border-green-200",
      inactive: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return (
      <Badge
        variant="outline"
        className={cn("border text-xs font-semibold", variants[status] || variants.inactive)}
      >
        {t(`teachers.${status}`) || status}
      </Badge>
    );
  };

  if (teachers.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-sm text-gray-500">
          {t("teachers.noTeachersFound") || "No teachers found"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {teachers.map((teacher) => (
        <Card
          key={teacher.id}
          className="hover:shadow-lg transition-shadow border border-gray-200"
        >
          <CardHeader className="pb-3">
            <div className={cn(
              "flex items-start justify-between",
              direction === "rtl" && "flex-row-reverse"
            )}>
              <div className={cn("flex-1 min-w-0", direction === "rtl" && "text-right")}>
                <CardTitle className={cn(
                  "text-lg font-semibold text-gray-900 mb-1 truncate",
                  direction === "rtl" && "text-right"
                )}>
                  {teacher.user?.name || "N/A"}
                </CardTitle>
                {teacher.user?.email && (
                  <div className={cn(
                    "flex items-center gap-1.5 text-sm text-gray-600 mt-1",
                    direction === "rtl" && "flex-row-reverse justify-end"
                  )}>
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{teacher.user.email}</span>
                  </div>
                )}
              </div>
              {getStatusBadge(teacher.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Courses Count */}
            <div className={cn(
              "flex items-center gap-2 text-sm text-gray-600",
              direction === "rtl" && "flex-row-reverse justify-end"
            )}>
              <Users className="h-4 w-4 flex-shrink-0" />
              <span>
                {teacher.courses?.length || 0} {t("teachers.courses") || "courses"}
              </span>
            </div>

            {/* Hourly Rate */}
            <div className={cn(
              "flex items-center gap-2 text-sm text-gray-700 font-medium",
              direction === "rtl" && "flex-row-reverse justify-end"
            )}>
              <DollarSign className="h-4 w-4 flex-shrink-0 text-emerald-600" />
              <span>
                {teacher.hourly_rate} {teacher.currency} / {t("salaries.hours") || "hour"}
              </span>
            </div>

            {/* WhatsApp if available */}
            {teacher.user?.whatsapp && (
              <div className={cn(
                "flex items-center gap-2 text-sm text-gray-600",
                direction === "rtl" && "flex-row-reverse justify-end"
              )}>
                <WhatsAppIcon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{teacher.user.whatsapp}</span>
              </div>
            )}

            {/* Actions */}
            <div className={cn(
              "flex items-center gap-1 pt-2 border-t border-gray-200",
              direction === "rtl" ? "justify-start flex-row-reverse" : "justify-end"
            )}>
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
                          ? t("teachers.sending") || "Sending..."
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
