"use client";

import { useState } from "react";
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
import { NotificationItem } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, User, BookOpen, Calendar, MessageSquare, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CancellationRequestsTableProps {
  cancellations: NotificationItem[];
  onApprove: (id: number) => void;
  onReject: (id: number, reason: string) => void;
  isLoading?: boolean;
  onViewLog?: () => void;
}

export function CancellationRequestsTable({
  cancellations,
  onApprove,
  onReject,
  isLoading = false,
  onViewLog,
}: CancellationRequestsTableProps) {
  const { t, direction } = useLanguage();
  const [selectedCancellation, setSelectedCancellation] = useState<NotificationItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return "—";
    try {
      const [hours, minutes, seconds] = timeString.split(":");
      const hour24 = parseInt(hours, 10);
      const hour12 = hour24 % 12 || 12;
      const ampm = hour24 >= 12 ? "PM" : "AM";
      const mins = minutes || "00";
      return `${hour12}:${mins} ${ampm}`;
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

  const handleViewDetails = (item: NotificationItem) => {
    setSelectedCancellation(item);
    setIsDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-8">
        <div className="text-center text-gray-500">
          {t("common.loading") || "Loading..."}
        </div>
      </div>
    );
  }

  if (cancellations.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-8">
        <div className="text-center text-gray-500">
          {t("notifications.noCancellationRequests") || "No cancellation requests"}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border border-gray-200 bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
              <TableHead className="min-w-[140px] text-xs sm:text-sm font-semibold text-gray-700">
                {t("notifications.student") || "Student"}
              </TableHead>
              <TableHead className="min-w-[120px] text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">
                {t("notifications.teacher") || "Teacher"}
              </TableHead>
              <TableHead className="min-w-[120px] text-xs sm:text-sm font-semibold text-gray-700 hidden md:table-cell">
                {t("notifications.course") || "Course"}
              </TableHead>
              <TableHead className="min-w-[100px] text-xs sm:text-sm font-semibold text-gray-700">
                {t("notifications.date") || "Date"}
              </TableHead>
              <TableHead className="min-w-[120px] text-xs sm:text-sm font-semibold text-gray-700 hidden lg:table-cell">
                {t("notifications.time") || "Time"}
              </TableHead>
              <TableHead className="min-w-[100px] text-xs sm:text-sm font-semibold text-gray-700">
                {t("notifications.status") || "Status"}
              </TableHead>
              <TableHead className={cn("min-w-[200px] text-xs sm:text-sm font-semibold text-gray-700", direction === "rtl" ? "text-left" : "text-right")}>
                {t("notifications.actions") || "Actions"}
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
                    <div className="text-xs text-gray-600 sm:hidden mt-1">
                      {item.teacher_name || t("notifications.unknownTeacher") || "Unknown Teacher"}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell py-4">
                  <div className="text-sm text-gray-900 font-medium">
                    {item.teacher_name || t("notifications.unknownTeacher") || "Unknown Teacher"}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell py-4">
                  <div className="text-sm text-gray-900 font-medium">
                    {item.course_name || t("notifications.unknownCourse") || "Unknown Course"}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="text-sm text-gray-700 font-medium">
                    {item.class_date ? formatDate(item.class_date) : "—"}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell py-4">
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
                <TableCell className="min-w-[200px] py-4">
                  <div className={cn(
                    "flex items-center gap-2 flex-wrap",
                    direction === "rtl" ? "justify-start" : "justify-end"
                  )}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(item)}
                      className="h-8 px-3 text-xs"
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                      {t("notifications.viewDetails") || "Details"}
                    </Button>
                    {item.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRejectingId(item.class_id!);
                            setIsRejectModalOpen(true);
                          }}
                          disabled={isLoading}
                          className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1.5" />
                          {t("notifications.reject") || "Reject"}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onApprove(item.class_id!)}
                          disabled={isLoading}
                          className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                          {t("notifications.approve") || "Approve"}
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t("notifications.cancellationRequestDetails") || "Cancellation Request Details"}
            </DialogTitle>
            <DialogDescription>
              {t("notifications.viewCancellationDetails") || "View full details of the cancellation request"}
            </DialogDescription>
          </DialogHeader>
          {selectedCancellation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t("notifications.student") || "Student"}
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedCancellation.student_name || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t("notifications.teacher") || "Teacher"}
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedCancellation.teacher_name || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t("notifications.course") || "Course"}
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedCancellation.course_name || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t("notifications.date") || "Date"}
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedCancellation.class_date ? formatDate(selectedCancellation.class_date) : "—"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t("notifications.startTime") || "Start Time"}
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedCancellation.start_time ? formatTime(selectedCancellation.start_time) : "—"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t("notifications.endTime") || "End Time"}
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {(selectedCancellation as any).end_time ? formatTime((selectedCancellation as any).end_time) : "—"}
                  </p>
                </div>
                {(selectedCancellation as any).duration && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      {t("notifications.duration") || "Duration"}
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {(selectedCancellation as any).duration} {t("notifications.minutes") || "minutes"}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t("notifications.requestStatus") || "Request Status"}
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    <Badge
                      variant="outline"
                      className={cn(
                        "border text-xs font-medium",
                        selectedCancellation.status === "pending"
                          ? "bg-orange-100 text-orange-700 border-orange-200"
                          : selectedCancellation.status === "approved"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      )}
                    >
                      {selectedCancellation.status === "pending"
                        ? (t("notifications.pending") || "Pending")
                        : selectedCancellation.status === "approved"
                        ? (t("notifications.approved") || "Approved")
                        : (t("notifications.rejected") || "Rejected")}
                    </Badge>
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  {t("notifications.cancellationReason") || "Cancellation Reason"}
                </label>
                <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {selectedCancellation.cancellation_reason || "—"}
                </p>
              </div>
              <div className="text-xs text-gray-500">
                {t("notifications.requestedAt") || "Requested at"}: {selectedCancellation.created_at 
                  ? format(new Date(selectedCancellation.created_at), "MMM dd, yyyy HH:mm")
                  : "—"}
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedCancellation?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedCancellation.class_id) {
                      setRejectingId(selectedCancellation.class_id);
                      setIsDetailsOpen(false);
                      setIsRejectModalOpen(true);
                    }
                  }}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {t("notifications.reject") || "Reject"}
                </Button>
                <Button
                  onClick={() => {
                    if (selectedCancellation.class_id) {
                      onApprove(selectedCancellation.class_id);
                      setIsDetailsOpen(false);
                    }
                  }}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t("notifications.approve") || "Approve"}
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              {t("common.close") || "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("notifications.rejectCancellation") || "Reject Cancellation Request"}
            </DialogTitle>
            <DialogDescription>
              {t("notifications.rejectCancellationDescription") || "Please provide a reason for rejecting this cancellation request. This reason will be visible to the teacher."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">
                {t("notifications.rejectionReason") || "Rejection Reason"} <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t("notifications.enterRejectionReason") || "Enter the reason for rejection..."}
                className="mt-2 min-h-[100px]"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectReason("");
                setRejectingId(null);
              }}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              onClick={() => {
                if (rejectReason.trim() && rejectingId) {
                  onReject(rejectingId, rejectReason.trim());
                  setIsRejectModalOpen(false);
                  setRejectReason("");
                  setRejectingId(null);
                }
              }}
              disabled={!rejectReason.trim() || isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t("notifications.reject") || "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
