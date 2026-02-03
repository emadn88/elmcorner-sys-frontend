"use client";

import { useState, useEffect, useRef } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Teacher } from "@/types/teachers";
import { TeacherService } from "@/lib/services/teacher.service";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { X, Search, Filter, Download, Clock, FileText, Users } from "lucide-react";
import React from "react";

interface TeacherRatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher;
}

export function TeacherRatesModal({
  open,
  onOpenChange,
  teacher,
}: TeacherRatesModalProps) {
  const { t, direction } = useLanguage();
  const [rateData, setRateData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [rateTypeFilter, setRateTypeFilter] = useState<string>("all");

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

  const fetchRateDetails = async () => {
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
      if (rateTypeFilter !== "all") {
        filters.rate_type = rateTypeFilter;
      }

      const data = await TeacherService.getTeacherRateDetails(teacher.id, filters);
      setRateData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load rate details");
      console.error("Error fetching rate details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchRateDetails();
    }
  }, [open]);

  const handleApplyFilters = () => {
    fetchRateDetails();
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setRateTypeFilter("all");
    fetchRateDetails();
  };

  const handlePrint = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters from filters
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append('status', statusFilter);
      }
      if (dateFrom) {
        params.append('date_from', dateFrom);
      }
      if (dateTo) {
        params.append('date_to', dateTo);
      }
      if (rateTypeFilter !== "all") {
        params.append('rate_type', rateTypeFilter);
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      const url = `${API_BASE_URL}/admin/teachers/${teacher.id}/rate-details/pdf?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url_blob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url_blob;
      a.download = `teacher-rates-${teacher.id}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url_blob);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Failed to download PDF");
      console.error("Error downloading PDF:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const punctualityClasses = rateData?.classes?.filter((c: any) => c.type === 'punctuality') || [];
  const reportSubmissionClasses = rateData?.classes?.filter((c: any) => c.type === 'report_submission') || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {t("teachers.rateDetails") || "Rate Details"} - {teacher.user?.name || "N/A"}
              </DialogTitle>
              <DialogDescription>
                {t("teachers.rateDetailsDescription") || "View cumulative punctuality and report submission rates"}
              </DialogDescription>
            </div>
            <Button 
              onClick={handlePrint} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? (t("common.loading") || "Loading...") : (t("common.downloadPdf") || "Download PDF")}
            </Button>
          </div>
        </DialogHeader>

        <div ref={printRef}>
          {/* Statistics Cards */}
          {rateData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("teacher.attendanceRate") || "Attendance Rate"}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {rateData.attendance?.rate || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("teacher.attendanceScore") || "Score"}: {rateData.attendance?.score || 0}/100
                  </p>
                  <div className="mt-2 text-xs text-gray-600">
                    <span className="text-green-600">
                      {t("teacher.attended") || "Attended"}: {rateData.attendance?.attended || 0}
                    </span>
                    {" • "}
                    <span className="text-blue-600">
                      {t("teacher.cancelledByStudent") || "Cancelled by Student"}: {rateData.attendance?.cancelled_by_student || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("teacher.punctualityRate") || "Punctuality Rate"}
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {rateData.punctuality?.rate || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("teacher.punctualityScore") || "Score"}: {rateData.punctuality?.score || 0}/100
                  </p>
                  <div className="mt-2 text-xs text-gray-600">
                    <span className="text-green-600">
                      {t("teacher.onTime") || "On-time"}: {rateData.punctuality?.on_time || 0}
                    </span>
                    {" • "}
                    <span className="text-yellow-600">
                      {t("teacher.late") || "Late"}: {rateData.punctuality?.late || 0}
                    </span>
                    {" • "}
                    <span className="text-red-600">
                      {t("teacher.veryLate") || "Very Late"}: {rateData.punctuality?.very_late || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("teacher.reportSubmissionRate") || "Report Submission Rate"}
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {rateData.report_submission?.rate || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("teacher.reportSubmissionScore") || "Score"}: {rateData.report_submission?.score || 0}/100
                  </p>
                  <div className="mt-2 text-xs text-gray-600">
                    <span className="text-green-600">
                      {t("teacher.immediate") || "Immediate"}: {rateData.report_submission?.immediate || 0}
                    </span>
                    {" • "}
                    <span className="text-yellow-600">
                      {t("teacher.late") || "Late"}: {rateData.report_submission?.late || 0}
                    </span>
                    {" • "}
                    <span className="text-red-600">
                      {t("teacher.veryLate") || "Very Late"}: {rateData.report_submission?.very_late || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("teachers.totalJoined") || "Total Joined"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {rateData.punctuality?.total_joined || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("teachers.classes") || "Classes"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("teachers.totalSubmitted") || "Total Submitted"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {rateData.report_submission?.total_reports || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("teachers.reports") || "Reports"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <div className="space-y-4 border-b pb-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate-type-filter">
                  {t("teachers.rateType") || "Rate Type"}
                </Label>
                <Select value={rateTypeFilter} onValueChange={setRateTypeFilter}>
                  <SelectTrigger id="rate-type-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("notifications.all") || "All"}
                    </SelectItem>
                    <SelectItem value="punctuality">
                      {t("teacher.punctualityRate") || "Punctuality"}
                    </SelectItem>
                    <SelectItem value="report_submission">
                      {t("teacher.reportSubmissionRate") || "Report Submission"}
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
                    <SelectItem value="on_time">
                      {t("teacher.onTime") || "On-time"}
                    </SelectItem>
                    <SelectItem value="late">
                      {t("teacher.late") || "Late"}
                    </SelectItem>
                    <SelectItem value="very_late">
                      {t("teacher.veryLate") || "Very Late"}
                    </SelectItem>
                  </SelectContent>
                </Select>
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
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Tables */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : rateData ? (
            <div className="space-y-6">
              {/* Punctuality Table */}
              {(rateTypeFilter === "all" || rateTypeFilter === "punctuality") && punctualityClasses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {t("teacher.punctualityRate") || "Punctuality Rate"} - {t("teachers.details") || "Details"}
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("teacher.student") || "Student"}</TableHead>
                          <TableHead>{t("teacher.course") || "Course"}</TableHead>
                          <TableHead>{t("teacher.date") || "Date"}</TableHead>
                          <TableHead>{t("teacher.classStartTime") || "Class Start"}</TableHead>
                          <TableHead>{t("teacher.joinedTime") || "Joined Time"}</TableHead>
                          <TableHead>{t("teacher.status") || "Status"}</TableHead>
                          <TableHead>{t("teacher.minutesLate") || "Minutes Late"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {punctualityClasses.map((classItem: any) => (
                          <TableRow key={`punctuality-${classItem.id}`}>
                            <TableCell>{classItem.student_name}</TableCell>
                            <TableCell>{classItem.course_name}</TableCell>
                            <TableCell>{formatDate(classItem.class_date)}</TableCell>
                            <TableCell>{formatTime(classItem.start_time)}</TableCell>
                            <TableCell>
                              {format(new Date(classItem.joined_time), "MMM dd, yyyy h:mm a")}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  classItem.status === 'on_time'
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : classItem.status === 'late'
                                    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                    : "bg-red-100 text-red-700 border-red-200"
                                }
                              >
                                {classItem.status === 'on_time'
                                  ? (t("teacher.onTime") || "On-time")
                                  : classItem.status === 'late'
                                  ? (t("teacher.late") || "Late")
                                  : (t("teacher.veryLate") || "Very Late")
                                }
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {classItem.minutes_late > 0 ? `${classItem.minutes_late} min` : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Report Submission Table */}
              {(rateTypeFilter === "all" || rateTypeFilter === "report_submission") && reportSubmissionClasses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {t("teacher.reportSubmissionRate") || "Report Submission Rate"} - {t("teachers.details") || "Details"}
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("teacher.student") || "Student"}</TableHead>
                          <TableHead>{t("teacher.course") || "Course"}</TableHead>
                          <TableHead>{t("teacher.date") || "Date"}</TableHead>
                          <TableHead>{t("teacher.classEndTime") || "Class End"}</TableHead>
                          <TableHead>{t("teacher.submittedTime") || "Submitted Time"}</TableHead>
                          <TableHead>{t("teacher.status") || "Status"}</TableHead>
                          <TableHead>{t("teacher.minutesAfterEnd") || "Minutes After End"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportSubmissionClasses.map((classItem: any) => (
                          <TableRow key={`report-${classItem.id}`}>
                            <TableCell>{classItem.student_name}</TableCell>
                            <TableCell>{classItem.course_name}</TableCell>
                            <TableCell>{formatDate(classItem.class_date)}</TableCell>
                            <TableCell>{formatTime(classItem.end_time)}</TableCell>
                            <TableCell>
                              {format(new Date(classItem.submitted_time), "MMM dd, yyyy h:mm a")}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  classItem.status === 'immediate'
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : classItem.status === 'late'
                                    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                    : "bg-red-100 text-red-700 border-red-200"
                                }
                              >
                                {classItem.status === 'immediate'
                                  ? (t("teacher.immediate") || "Immediate")
                                  : classItem.status === 'late'
                                  ? (t("teacher.late") || "Late")
                                  : (t("teacher.veryLate") || "Very Late")
                                }
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {classItem.minutes_after_end > 0 ? `${classItem.minutes_after_end} min` : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {(!punctualityClasses.length && !reportSubmissionClasses.length) && (
                <div className="text-center py-12 text-gray-500">
                  <p>{t("teachers.noRateData") || "No rate data available"}</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
