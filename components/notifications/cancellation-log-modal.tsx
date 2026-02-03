"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NotificationItem } from "@/lib/api/types";
import { NotificationService } from "@/lib/services/notification.service";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { X, Search, Filter } from "lucide-react";

interface CancellationLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancellationLogModal({
  open,
  onOpenChange,
}: CancellationLogModalProps) {
  const { t, direction } = useLanguage();
  const [cancellations, setCancellations] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return "—";
    try {
      const [hours, minutes] = timeString.split(":");
      const hour24 = parseInt(hours, 10);
      const hour12 = hour24 % 12 || 12;
      const ampm = hour24 >= 12 ? "PM" : "AM";
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const fetchCancellations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const filters: any = {};
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }
      if (dateFrom) {
        filters.date_from = dateFrom;
      }
      if (dateTo) {
        filters.date_to = dateTo;
      }
      if (search) {
        filters.search = search;
      }

      const data = await NotificationService.getAllCancellationRequests(filters);
      setCancellations(data);
    } catch (err: any) {
      setError(err.message || "Failed to load cancellation requests");
      console.error("Error fetching cancellation requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCancellations();
    }
  }, [open]);

  const handleApplyFilters = () => {
    fetchCancellations();
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    fetchCancellations();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("notifications.cancellationLog") || "Cancellation Requests Log"}
          </DialogTitle>
          <DialogDescription>
            {t("notifications.cancellationLogDescription") || "View all cancellation requests with filters"}
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="space-y-4 border-b pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter">
                {t("notifications.status") || "Status"}
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("notifications.all") || "All"}
                  </SelectItem>
                  <SelectItem value="pending">
                    {t("notifications.pending") || "Pending"}
                  </SelectItem>
                  <SelectItem value="approved">
                    {t("notifications.approved") || "Approved"}
                  </SelectItem>
                  <SelectItem value="rejected">
                    {t("notifications.rejected") || "Rejected"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-from">
                {t("notifications.dateFrom") || "Date From"}
              </Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-to">
                {t("notifications.dateTo") || "Date To"}
              </Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">
                {t("notifications.search") || "Search"}
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder={t("notifications.searchPlaceholder") || "Search by name, course..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} size="sm">
              <Filter className="h-4 w-4 mr-2" />
              {t("notifications.applyFilters") || "Apply Filters"}
            </Button>
            <Button onClick={handleClearFilters} variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              {t("notifications.clearFilters") || "Clear Filters"}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : cancellations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>{t("notifications.noCancellationRequests") || "No cancellation requests found"}</p>
          </div>
        ) : (
          <div className="rounded-md border border-gray-200 bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                  <TableHead className="min-w-[140px] text-xs sm:text-sm font-semibold text-gray-700">
                    {t("notifications.student") || "Student"}
                  </TableHead>
                  <TableHead className="min-w-[120px] text-xs sm:text-sm font-semibold text-gray-700">
                    {t("notifications.teacher") || "Teacher"}
                  </TableHead>
                  <TableHead className="min-w-[120px] text-xs sm:text-sm font-semibold text-gray-700">
                    {t("notifications.course") || "Course"}
                  </TableHead>
                  <TableHead className="min-w-[100px] text-xs sm:text-sm font-semibold text-gray-700">
                    {t("notifications.date") || "Date"}
                  </TableHead>
                  <TableHead className="min-w-[120px] text-xs sm:text-sm font-semibold text-gray-700">
                    {t("notifications.time") || "Time"}
                  </TableHead>
                  <TableHead className="min-w-[100px] text-xs sm:text-sm font-semibold text-gray-700">
                    {t("notifications.status") || "Status"}
                  </TableHead>
                  <TableHead className="min-w-[200px] text-xs sm:text-sm font-semibold text-gray-700">
                    {t("notifications.cancellationReason") || "Cancellation Reason"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cancellations.map((item) => (
                  <TableRow
                    key={item.id}
                    className="transition-all duration-200 hover:bg-gray-50/80 border-b border-gray-100"
                  >
                    <TableCell className="py-4">
                      <div className={cn(
                        "min-w-0",
                        direction === "rtl" ? "text-right" : "text-left"
                      )}>
                        <div className="font-semibold text-gray-900 text-sm">
                          {item.student_name || t("notifications.unknownStudent") || "Unknown Student"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {item.teacher_name || t("notifications.unknownTeacher") || "Unknown Teacher"}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {item.course_name || t("notifications.unknownCourse") || "Unknown Course"}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-gray-700 font-medium">
                        {item.class_date ? formatDate(item.class_date) : "—"}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-gray-700">
                        {item.start_time ? formatTime(item.start_time) : "—"}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border text-xs font-medium",
                          item.status === "pending"
                            ? "bg-orange-100 text-orange-700 border-orange-200"
                            : item.status === "approved"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        )}
                      >
                        {item.status === "pending"
                          ? (t("notifications.pending") || "Pending")
                          : item.status === "approved"
                          ? (t("notifications.approved") || "Approved")
                          : (t("notifications.rejected") || "Rejected")}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-gray-700 max-w-xs truncate">
                        {item.cancellation_reason || "—"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
