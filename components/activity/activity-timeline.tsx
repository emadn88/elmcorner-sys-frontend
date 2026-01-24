"use client";

import { ActivityLog } from "@/lib/api/types";
import { ActivityItem } from "./activity-item";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface ActivityTimelineProps {
  logs: ActivityLog[];
}

export function ActivityTimeline({ logs }: ActivityTimelineProps) {
  const { t, direction } = useLanguage();

  const groupByDate = (logs: ActivityLog[]) => {
    const groups: Record<string, ActivityLog[]> = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    logs.forEach((log) => {
      const logDate = new Date(log.created_at);
      let groupKey: string;

      if (logDate >= today) {
        groupKey = "today";
      } else if (logDate >= yesterday) {
        groupKey = "yesterday";
      } else if (logDate >= weekAgo) {
        groupKey = "thisWeek";
      } else {
        groupKey = "older";
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(log);
    });

    return groups;
  };

  const groupedLogs = groupByDate(logs);
  const groupOrder = ["today", "yesterday", "thisWeek", "older"];

  const getGroupLabel = (key: string) => {
    switch (key) {
      case "today":
        return t("activity.today") || "Today";
      case "yesterday":
        return t("activity.yesterday") || "Yesterday";
      case "thisWeek":
        return t("activity.thisWeek") || "This Week";
      case "older":
        return t("activity.older") || "Older";
      default:
        return key;
    }
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className={cn("text-gray-500", direction === "rtl" && "text-right")}>
          {t("activity.noActivities") || "No activities found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupOrder.map((groupKey) => {
        const groupLogs = groupedLogs[groupKey];
        if (!groupLogs || groupLogs.length === 0) return null;

        return (
          <div key={groupKey} className="space-y-4">
            <h3
              className={cn(
                "text-sm font-semibold text-gray-700 uppercase tracking-wide",
                direction === "rtl" && "text-right"
              )}
            >
              {getGroupLabel(groupKey)}
            </h3>
            <div className="space-y-0">
              {groupLogs.map((log, idx) => (
                <ActivityItem
                  key={log.id}
                  log={log}
                  isLast={idx === groupLogs.length - 1 && groupKey === groupOrder[groupOrder.length - 1]}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
