"use client";

import { MessageSquare, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";

interface BulkNotificationActionsProps {
  selectedCount: number;
  onSendNotifications: () => void;
  onExport: () => void;
  isLoading?: boolean;
}

export function BulkNotificationActions({
  selectedCount,
  onSendNotifications,
  onExport,
  isLoading = false,
}: BulkNotificationActionsProps) {
  const { t } = useLanguage();

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="text-sm text-blue-900">
        {t("packages.selectedCount", { count: selectedCount })}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={isLoading}
        >
          <Download className="h-4 w-4 mr-2" />
          {t("packages.export")}
        </Button>
        <Button
          size="sm"
          onClick={onSendNotifications}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          {t("packages.sendBatchNotifications")}
        </Button>
      </div>
    </div>
  );
}
