"use client";

import { ActivityLog } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { UserCircle } from "lucide-react";

interface ActivityItemProps {
  log: ActivityLog;
  isLast?: boolean;
}

export function ActivityItem({ log, isLast = false }: ActivityItemProps) {
  const { t, direction } = useLanguage();
  const router = useRouter();

  const getActionColor = (action: string) => {
    if (action?.includes("created")) return "bg-green-500";
    if (action?.includes("updated")) return "bg-blue-500";
    if (action?.includes("deleted")) return "bg-red-500";
    return "bg-purple-500";
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return t("activity.justNow") || "Just now";
    }
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return t("activity.minutesAgo", { count: minutes }) || `${minutes} minutes ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return t("activity.hoursAgo", { count: hours }) || `${hours} hours ago`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return t("activity.daysAgo", { count: days }) || `${days} days ago`;
    }

    return date.toLocaleString();
  };

  const handleStudentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (log.student_id) {
      router.push(`/dashboard/students/${log.student_id}`);
    }
  };

  return (
    <div
      className={cn(
        "relative pl-6 pb-4",
        direction === "rtl" && "pr-6 pl-0"
      )}
    >
      {!isLast && (
        <div
          className={cn(
            "absolute top-6 bottom-0 w-0.5 bg-gray-200",
            direction === "rtl" ? "right-2" : "left-2"
          )}
        />
      )}
      <div className={cn("flex items-start gap-3", direction === "rtl" && "flex-row-reverse")}>
        <div
          className={cn(
            "h-4 w-4 rounded-full border-2 border-white shadow-sm z-10",
            direction === "rtl" ? "ml-2" : "mr-2",
            getActionColor(log.action)
          )}
        />
        <div className={cn("flex-1", direction === "rtl" && "text-right")}>
          <div className="flex items-center gap-2 flex-wrap">
            {log.user && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <UserCircle className="h-4 w-4" />
                <span className="font-medium">{log.user.name}</span>
              </div>
            )}
            {log.student && (
              <button
                onClick={handleStudentClick}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                {log.student.full_name}
              </button>
            )}
          </div>
          <p className="font-medium text-gray-900 mt-1">{log.description || log.action}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span>{formatTime(log.created_at)}</span>
            {log.ip_address && (
              <>
                <span>•</span>
                <span>{log.ip_address}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
