"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PackageService } from "@/lib/services/package.service";
import { useLanguage } from "@/contexts/language-context";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: number;
}

interface NotificationItem {
  id: number;
  sent_at: string;
  status: string;
  message_type: string;
  recipient: string;
}

export function NotificationHistoryModal({
  open,
  onOpenChange,
  packageId,
}: NotificationHistoryModalProps) {
  const { t, direction } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && packageId) {
      fetchNotificationHistory();
    }
  }, [open, packageId]);

  const fetchNotificationHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await PackageService.getNotificationHistory(packageId);
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch notification history");
      console.error("Error fetching notification history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    if (status === "sent") {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("packages.notificationHistory") || "Notification History"}
          </DialogTitle>
          <DialogDescription>
            {t("packages.notificationHistoryDescription") || 
              "View all sent notifications for this package"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {t("packages.noNotifications") || "No notifications sent yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 rounded-lg border",
                  direction === "rtl" ? "text-right" : "text-left",
                  notification.status === "sent"
                    ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                    : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getStatusIcon(notification.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatDateTime(notification.sent_at)}
                      </span>
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          notification.status === "sent"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        )}
                      >
                        {notification.status === "sent"
                          ? t("packages.sent") || "Sent"
                          : t("packages.failed") || "Failed"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div>
                        <span className="font-medium">
                          {t("packages.messageType") || "Type"}:{" "}
                        </span>
                        <span className="capitalize">
                          {notification.message_type}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">
                          {t("packages.recipient") || "Recipient"}:{" "}
                        </span>
                        <span>{notification.recipient}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
