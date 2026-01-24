"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { ActivityFiltersComponent } from "@/components/activity/activity-filters";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { ActivityService } from "@/lib/services/activity.service";
import { ActivityLog, ActivityFilters, ActivityStats } from "@/lib/api/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ActivityPage() {
  const { t, direction } = useLanguage();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filters, setFilters] = useState<ActivityFilters>({
    action: "all",
    per_page: 50,
    page: 1,
  });
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch activity logs
  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ActivityService.getActivityLogs({
        ...filters,
        page: currentPage,
      });
      setLogs(response.data);
      setTotalPages(response.last_page);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || t("activity.errorLoading") || "Failed to fetch activity logs");
      console.error("Error fetching activity logs:", err);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const statsData = await ActivityService.getActivityStats(
        filters.date_from,
        filters.date_to
      );
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Load data when filters or page changes
  useEffect(() => {
    fetchLogs();
  }, [filters, currentPage]);

  // Load stats when filters change
  useEffect(() => {
    fetchStats();
  }, [filters.date_from, filters.date_to]);

  const handleFiltersChange = (newFilters: ActivityFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", direction === "rtl" ? "text-right" : "text-left")}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("sidebar.activity") || "Activity"}
        </h1>
        <p className="text-gray-600 mt-2">
          {t("activity.description") || "View all system activity logs and track changes"}
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t("activity.totalActivities") || "Total Activities"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t("activity.todayActivities") || "Today"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.today}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t("activity.currentPage") || "Current Page"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {currentPage} / {totalPages}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("activity.filters") || "Filters"}</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t("activity.timeline") || "Activity Timeline"}
            {total > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({total} {t("activity.total") || "total"})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <ActivityTimeline logs={logs} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  className={cn(
                    "flex items-center justify-between mt-6 pt-6 border-t",
                    direction === "rtl" && "flex-row-reverse"
                  )}
                >
                  <div className="text-sm text-gray-600">
                    {t("activity.showing") || "Showing"} {logs.length}{" "}
                    {t("activity.of") || "of"} {total} {t("activity.activities") || "activities"}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      {t("activity.previous") || "Previous"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      {t("activity.next") || "Next"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
