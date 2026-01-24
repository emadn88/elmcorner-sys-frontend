"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart3, Download, MessageSquare, Trash2, FileText, Users, User, GraduationCap, DollarSign, CreditCard, TrendingUp } from "lucide-react";
import { Report, ReportFilters, GenerateReportRequest } from "@/lib/api/types";
import { ReportService } from "@/lib/services/report.service";
import { StudentService } from "@/lib/services/student.service";
import { FamilyService } from "@/lib/services/family.service";
import { TeacherService } from "@/lib/services/teacher.service";
import { Student, Family, Teacher } from "@/lib/api/types";
import { PaginatedResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export default function ReportsPage() {
  const { t, direction } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({
    page: 1,
    per_page: 15,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [generatingTypes, setGeneratingTypes] = useState<Set<string>>(new Set());

  // Shared data for all report types
  const [students, setStudents] = useState<Student[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Available currencies
  const currencies = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'EGP', 'JOD', 'KWD', 'BHD', 'OMR', 'QAR'];

  // Form data for each report type
  const [formData, setFormData] = useState<Record<string, GenerateReportRequest>>({
    student_single: {
      type: "student_single",
      date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      date_to: new Date().toISOString().split('T')[0],
    },
    students_multiple: {
      type: "students_multiple",
      date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      date_to: new Date().toISOString().split('T')[0],
    },
    students_family: {
      type: "students_family",
      date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      date_to: new Date().toISOString().split('T')[0],
    },
    students_all: {
      type: "students_all",
      date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      date_to: new Date().toISOString().split('T')[0],
    },
    teacher_performance: {
      type: "teacher_performance",
      date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      date_to: new Date().toISOString().split('T')[0],
    },
    salaries: {
      type: "salaries",
      date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      date_to: new Date().toISOString().split('T')[0],
    },
    income: {
      type: "income",
      date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      date_to: new Date().toISOString().split('T')[0],
    },
    package_report: {
      type: "package_report",
      date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      date_to: new Date().toISOString().split('T')[0],
    },
  });

  const [selectedStudentIds, setSelectedStudentIds] = useState<Record<string, number[]>>({
    students_multiple: [],
  });

  // Load all options on mount
  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [studentsResponse, familiesResponse, teachersResponse] = await Promise.all([
          StudentService.getStudents({ status: 'all', per_page: 1000 }),
          FamilyService.getFamilies({ status: 'all', per_page: 1000 }),
          TeacherService.getTeachers({ status: 'all', per_page: 1000 }),
        ]);
        setStudents(studentsResponse.data);
        setFamilies(familiesResponse.data);
        setTeachers(teachersResponse.data);
      } catch (err) {
        console.error("Error loading options:", err);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  // Fetch reports
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: PaginatedResponse<Report> = await ReportService.getReports({
        ...filters,
        page: currentPage,
        per_page: 15,
      });
      setReports(response.data);
      setTotalPages(response.last_page);
    } catch (err: any) {
      setError(err.message || "Failed to fetch reports");
      console.error("Error fetching reports:", err);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filters, currentPage]);

  // Handle generate report for specific type
  const handleGenerateReport = async (type: string) => {
    try {
      setGeneratingTypes(prev => new Set(prev).add(type));
      setError(null);
      
      const data = formData[type];
      const submitData: GenerateReportRequest = {
        ...data,
        student_ids: type === 'students_multiple' ? selectedStudentIds[type] : undefined,
        // Ensure "all" is never sent as currency value
        currency: data.currency === "all" ? undefined : data.currency,
      };
      
      await ReportService.generateReport(submitData);
      await fetchReports();
      
      // Show success message
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to generate report");
    } finally {
      setGeneratingTypes(prev => {
        const next = new Set(prev);
        next.delete(type);
        return next;
      });
    }
  };

  // Handle download PDF
  const handleDownloadPdf = async (reportId: number) => {
    try {
      setIsLoading(true);
      const blob = await ReportService.downloadReport(reportId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Failed to download PDF");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle send WhatsApp
  const handleSendWhatsApp = async (reportId: number) => {
    try {
      setIsLoading(true);
      await ReportService.sendReportViaWhatsApp(reportId);
      await fetchReports();
    } catch (err: any) {
      setError(err.message || "Failed to send report via WhatsApp");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (reportId: number) => {
    if (!confirm(t("reports.deleteConfirmation") || "Are you sure you want to delete this report?")) return;

    try {
      setIsLoading(true);
      await ReportService.deleteReport(reportId);
      await fetchReports();
    } catch (err: any) {
      setError(err.message || "Failed to delete report");
    } finally {
      setIsLoading(false);
    }
  };

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      lesson_summary: t("reports.types.lessonSummary") || "Lesson Summary",
      package_report: t("reports.types.packageReport") || "Package Report",
      student_single: t("reports.types.studentSingle") || "Single Student",
      students_multiple: t("reports.types.studentsMultiple") || "Multiple Students",
      students_family: t("reports.types.studentsFamily") || "Family",
      students_all: t("reports.types.studentsAll") || "All Students",
      teacher_performance: t("reports.types.teacherPerformance") || "Teacher Performance",
      salaries: t("reports.types.salaries") || "Salaries",
      income: t("reports.types.income") || "Income",
      custom: t("reports.types.custom") || "Custom",
    };
    return labels[type] || type;
  };

  const handleStudentToggle = (type: string, studentId: number) => {
    setSelectedStudentIds(prev => ({
      ...prev,
      [type]: prev[type]?.includes(studentId)
        ? prev[type].filter((id) => id !== studentId)
        : [...(prev[type] || []), studentId],
    }));
  };

  const updateFormData = (type: string, updates: Partial<GenerateReportRequest>) => {
    setFormData(prev => ({
      ...prev,
      [type]: { ...prev[type], ...updates },
    }));
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("flex flex-col gap-6", direction === "rtl" ? "text-right" : "text-left")}
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("sidebar.reports")}
        </h1>
        <p className="text-gray-600 mt-2">
          {t("reports.description") || "Generate and manage reports"}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Report Generation Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Student Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("reports.types.studentSingle") || "Single Student Report"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t("reports.selectStudent") || "Select Student"}</Label>
              <Select
                value={formData.student_single.student_id?.toString() || ""}
                onValueChange={(value) => updateFormData("student_single", { student_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("reports.selectStudent") || "Select a student..."} />
                </SelectTrigger>
                <SelectContent>
                  {loadingOptions ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">{t("common.loading") || "Loading..."}</div>
                  ) : (
                    students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.full_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("reports.dateFrom") || "Date From"}</Label>
                <Input
                  type="date"
                  value={formData.student_single.date_from || ""}
                  onChange={(e) => updateFormData("student_single", { date_from: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("reports.dateTo") || "Date To"}</Label>
                <Input
                  type="date"
                  value={formData.student_single.date_to || ""}
                  onChange={(e) => updateFormData("student_single", { date_to: e.target.value })}
                />
              </div>
            </div>
            <Button
              onClick={() => handleGenerateReport("student_single")}
              disabled={!formData.student_single.student_id || generatingTypes.has("student_single")}
              className="w-full"
            >
              {generatingTypes.has("student_single")
                ? t("common.loading") || "Generating..."
                : t("reports.generate") || "Generate"}
            </Button>
          </CardContent>
        </Card>

        {/* Multiple Students Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("reports.types.studentsMultiple") || "Multiple Students Report"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t("reports.selectStudents") || "Select Students"}</Label>
              <div className="border rounded p-3 max-h-48 overflow-y-auto">
                {loadingOptions ? (
                  <div className="text-center py-4">{t("common.loading") || "Loading..."}</div>
                ) : students.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">{t("reports.noStudents") || "No students found"}</div>
                ) : (
                  <div className="space-y-2">
                    {students.map((student) => (
                      <label key={student.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <Checkbox
                          checked={selectedStudentIds.students_multiple?.includes(student.id) || false}
                          onCheckedChange={() => handleStudentToggle("students_multiple", student.id)}
                        />
                        <span>{student.full_name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {selectedStudentIds.students_multiple && selectedStudentIds.students_multiple.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {t("reports.selectedCount") || "Selected"}: {selectedStudentIds.students_multiple.length}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("reports.dateFrom") || "Date From"}</Label>
                <Input
                  type="date"
                  value={formData.students_multiple.date_from || ""}
                  onChange={(e) => updateFormData("students_multiple", { date_from: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("reports.dateTo") || "Date To"}</Label>
                <Input
                  type="date"
                  value={formData.students_multiple.date_to || ""}
                  onChange={(e) => updateFormData("students_multiple", { date_to: e.target.value })}
                />
              </div>
            </div>
            <Button
              onClick={() => handleGenerateReport("students_multiple")}
              disabled={!selectedStudentIds.students_multiple?.length || generatingTypes.has("students_multiple")}
              className="w-full"
            >
              {generatingTypes.has("students_multiple")
                ? t("common.loading") || "Generating..."
                : t("reports.generate") || "Generate"}
            </Button>
          </CardContent>
        </Card>

        {/* Family Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("reports.types.studentsFamily") || "Family Report"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t("reports.selectFamily") || "Select Family"}</Label>
              <Select
                value={formData.students_family.family_id?.toString() || ""}
                onValueChange={(value) => updateFormData("students_family", { family_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("reports.selectFamily") || "Select a family..."} />
                </SelectTrigger>
                <SelectContent>
                  {loadingOptions ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">{t("common.loading") || "Loading..."}</div>
                  ) : (
                    families.map((family) => (
                      <SelectItem key={family.id} value={family.id.toString()}>
                        {family.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("reports.dateFrom") || "Date From"}</Label>
                <Input
                  type="date"
                  value={formData.students_family.date_from || ""}
                  onChange={(e) => updateFormData("students_family", { date_from: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("reports.dateTo") || "Date To"}</Label>
                <Input
                  type="date"
                  value={formData.students_family.date_to || ""}
                  onChange={(e) => updateFormData("students_family", { date_to: e.target.value })}
                />
              </div>
            </div>
            <Button
              onClick={() => handleGenerateReport("students_family")}
              disabled={!formData.students_family.family_id || generatingTypes.has("students_family")}
              className="w-full"
            >
              {generatingTypes.has("students_family")
                ? t("common.loading") || "Generating..."
                : t("reports.generate") || "Generate"}
            </Button>
          </CardContent>
        </Card>

        {/* All Students Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("reports.types.studentsAll") || "All Students Report"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("reports.dateFrom") || "Date From"}</Label>
                <Input
                  type="date"
                  value={formData.students_all.date_from || ""}
                  onChange={(e) => updateFormData("students_all", { date_from: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("reports.dateTo") || "Date To"}</Label>
                <Input
                  type="date"
                  value={formData.students_all.date_to || ""}
                  onChange={(e) => updateFormData("students_all", { date_to: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>{t("reports.currency") || "Currency (Optional)"}</Label>
              <Select
                value={formData.students_all.currency || "all"}
                onValueChange={(value) => updateFormData("students_all", { currency: value === "all" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("reports.allCurrencies") || "All Currencies"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("reports.allCurrencies") || "All Currencies"}</SelectItem>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => handleGenerateReport("students_all")}
              disabled={generatingTypes.has("students_all")}
              className="w-full"
            >
              {generatingTypes.has("students_all")
                ? t("common.loading") || "Generating..."
                : t("reports.generate") || "Generate"}
            </Button>
          </CardContent>
        </Card>

        {/* Teacher Performance Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              {t("reports.types.teacherPerformance") || "Teacher Performance Report"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t("reports.selectTeacher") || "Select Teacher"}</Label>
              <Select
                value={formData.teacher_performance.teacher_id?.toString() || ""}
                onValueChange={(value) => updateFormData("teacher_performance", { teacher_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("reports.selectTeacher") || "Select a teacher..."} />
                </SelectTrigger>
                <SelectContent>
                  {loadingOptions ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">{t("common.loading") || "Loading..."}</div>
                  ) : (
                    teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.user?.name || `Teacher #${teacher.id}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("reports.dateFrom") || "Date From"}</Label>
                <Input
                  type="date"
                  value={formData.teacher_performance.date_from || ""}
                  onChange={(e) => updateFormData("teacher_performance", { date_from: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("reports.dateTo") || "Date To"}</Label>
                <Input
                  type="date"
                  value={formData.teacher_performance.date_to || ""}
                  onChange={(e) => updateFormData("teacher_performance", { date_to: e.target.value })}
                />
              </div>
            </div>
            <Button
              onClick={() => handleGenerateReport("teacher_performance")}
              disabled={!formData.teacher_performance.teacher_id || generatingTypes.has("teacher_performance")}
              className="w-full"
            >
              {generatingTypes.has("teacher_performance")
                ? t("common.loading") || "Generating..."
                : t("reports.generate") || "Generate"}
            </Button>
          </CardContent>
        </Card>

        {/* Salaries Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t("reports.types.salaries") || "Salaries Report"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t("reports.selectTeacher") || "Select Teacher (Optional)"}</Label>
              <Select
                value={formData.salaries.teacher_id?.toString() || "all"}
                onValueChange={(value) => updateFormData("salaries", { teacher_id: value === "all" ? undefined : parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("reports.allTeachers") || "All Teachers"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("reports.allTeachers") || "All Teachers"}</SelectItem>
                  {loadingOptions ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">{t("common.loading") || "Loading..."}</div>
                  ) : (
                    teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.user?.name || `Teacher #${teacher.id}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("reports.dateFrom") || "Date From"}</Label>
                <Input
                  type="date"
                  value={formData.salaries.date_from || ""}
                  onChange={(e) => updateFormData("salaries", { date_from: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("reports.dateTo") || "Date To"}</Label>
                <Input
                  type="date"
                  value={formData.salaries.date_to || ""}
                  onChange={(e) => updateFormData("salaries", { date_to: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>{t("reports.currency") || "Currency (Optional)"}</Label>
              <Select
                value={formData.salaries.currency || "all"}
                onValueChange={(value) => updateFormData("salaries", { currency: value === "all" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("reports.allCurrencies") || "All Currencies"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("reports.allCurrencies") || "All Currencies"}</SelectItem>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => handleGenerateReport("salaries")}
              disabled={generatingTypes.has("salaries")}
              className="w-full"
            >
              {generatingTypes.has("salaries")
                ? t("common.loading") || "Generating..."
                : t("reports.generate") || "Generate"}
            </Button>
          </CardContent>
        </Card>

        {/* Income Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t("reports.types.income") || "Income Report"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("reports.dateFrom") || "Date From"}</Label>
                <Input
                  type="date"
                  value={formData.income.date_from || ""}
                  onChange={(e) => updateFormData("income", { date_from: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("reports.dateTo") || "Date To"}</Label>
                <Input
                  type="date"
                  value={formData.income.date_to || ""}
                  onChange={(e) => updateFormData("income", { date_to: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>{t("reports.currency") || "Currency (Optional)"}</Label>
              <Select
                value={formData.income.currency || "all"}
                onValueChange={(value) => updateFormData("income", { currency: value === "all" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("reports.allCurrencies") || "All Currencies"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("reports.allCurrencies") || "All Currencies"}</SelectItem>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => handleGenerateReport("income")}
              disabled={generatingTypes.has("income")}
              className="w-full"
            >
              {generatingTypes.has("income")
                ? t("common.loading") || "Generating..."
                : t("reports.generate") || "Generate"}
            </Button>
          </CardContent>
        </Card>

        {/* Package Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("reports.types.packageReport") || "Package Report"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t("reports.selectStudent") || "Select Student"}</Label>
              <Select
                value={formData.package_report.student_id?.toString() || ""}
                onValueChange={(value) => updateFormData("package_report", { student_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("reports.selectStudent") || "Select a student..."} />
                </SelectTrigger>
                <SelectContent>
                  {loadingOptions ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">{t("common.loading") || "Loading..."}</div>
                  ) : (
                    students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.full_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("reports.dateFrom") || "Date From"}</Label>
                <Input
                  type="date"
                  value={formData.package_report.date_from || ""}
                  onChange={(e) => updateFormData("package_report", { date_from: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("reports.dateTo") || "Date To"}</Label>
                <Input
                  type="date"
                  value={formData.package_report.date_to || ""}
                  onChange={(e) => updateFormData("package_report", { date_to: e.target.value })}
                />
              </div>
            </div>
            <Button
              onClick={() => handleGenerateReport("package_report")}
              disabled={!formData.package_report.student_id || generatingTypes.has("package_report")}
              className="w-full"
            >
              {generatingTypes.has("package_report")
                ? t("common.loading") || "Generating..."
                : t("reports.generate") || "Generate"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Generated Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t("reports.generatedReports") || "Generated Reports"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">
                {t("reports.noReports") || "No reports found. Generate your first report."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className={cn("p-3", direction === "rtl" ? "text-right" : "text-left")}>
                      {t("reports.type") || "Type"}
                    </th>
                    <th className={cn("p-3", direction === "rtl" ? "text-right" : "text-left")}>
                      {t("reports.student") || "Student"}
                    </th>
                    <th className={cn("p-3", direction === "rtl" ? "text-right" : "text-left")}>
                      {t("reports.teacher") || "Teacher"}
                    </th>
                    <th className={cn("p-3", direction === "rtl" ? "text-right" : "text-left")}>
                      {t("reports.createdAt") || "Created At"}
                    </th>
                    <th className={cn("p-3", direction === "rtl" ? "text-right" : "text-left")}>
                      {t("reports.actions") || "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{getReportTypeLabel(report.report_type)}</td>
                      <td className="p-3">{report.student?.full_name || "-"}</td>
                      <td className="p-3">
                        {report.teacher?.user?.name || "-"}
                      </td>
                      <td className="p-3">
                        {new Date(report.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadPdf(report.id)}
                            title={t("reports.download") || "Download PDF"}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {!report.sent_via_whatsapp && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendWhatsApp(report.id)}
                              title={t("reports.sendWhatsApp") || "Send via WhatsApp"}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(report.id)}
                            title={t("reports.delete") || "Delete"}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                {t("common.previous") || "Previous"}
              </Button>
              <span className="text-sm text-gray-600">
                {t("common.page") || "Page"} {currentPage} {t("common.of") || "of"} {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                {t("common.next") || "Next"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
