"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  Calendar, 
  Pause, 
  Play, 
  Trash2, 
  Edit, 
  RefreshCw, 
  Clock, 
  MoreVertical,
  CalendarDays,
  Search,
  X,
  Package,
  PackageCheck,
  PackageX,
  Globe,
  ArrowRightLeft,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Users,
  GraduationCap,
  BookOpen,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timetable, Package as PackageType } from "@/lib/api/types";
import { TimetableService } from "@/lib/services/timetable.service";
import { PackageService } from "@/lib/services/package.service";
import { TimetableFormModal } from "@/components/timetables/timetable-form-modal";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SortField = "student" | "teacher" | "course" | "status" | "created_at" | null;
type SortDirection = "asc" | "desc" | null;

export default function TimetablesPage() {
  const { t, direction, language } = useLanguage();
  const router = useRouter();
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generatingTimetable, setGeneratingTimetable] = useState<Timetable | null>(null);
  const [generateFromDate, setGenerateFromDate] = useState("");
  const [generateToDate, setGenerateToDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [studentPackages, setStudentPackages] = useState<Record<number, PackageType | null>>({});
  
  // Dialog states
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [studentFilter, setStudentFilter] = useState<string>("all");
  const [teacherFilter, setTeacherFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const isRTL = direction === "rtl";
  const dateLocale = language === "ar" ? ar : enUS;

  // Fetch timetables
  const fetchTimetables = async () => {
    try {
      setIsLoading(true);
      const response = await TimetableService.getTimetables({ per_page: 100 });
      setTimetables(response.data);
      
      const studentIds = [...new Set(response.data.map(t => t.student_id))];
      const packagesMap: Record<number, Package | null> = {};
      
      for (const studentId of studentIds) {
        try {
          // Get all packages for this student (don't filter by status on API level to avoid missing packages)
          const packagesResponse = await PackageService.getPackages({
            student_id: studentId,
            per_page: 100,
          });
          
          // Find active package with remaining classes OR remaining hours
          // A package is considered active if:
          // 1. status is "active" AND
          // 2. (remaining_classes > 0 OR remaining_hours > 0)
          const activePackage = packagesResponse.data.find(
            (p: PackageType) => {
              const isActive = p.status === "active";
              const hasRemainingClasses = (p.remaining_classes ?? 0) > 0;
              const hasRemainingHours = (p.remaining_hours ?? 0) > 0;
              return isActive && (hasRemainingClasses || hasRemainingHours);
            }
          );
          
          packagesMap[studentId] = activePackage || null;
        } catch (err) {
          console.error(`Failed to load packages for student ${studentId}:`, err);
          packagesMap[studentId] = null;
        }
      }
      
      setStudentPackages(packagesMap);
    } catch (err: any) {
      console.error("Failed to fetch timetables:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetables();
  }, []);

  // Get unique values for filters
  const uniqueStudents = useMemo(() => {
    const students = timetables.map(t => ({
      id: t.student_id,
      name: t.student?.full_name || "Unknown"
    }));
    return Array.from(new Map(students.map(s => [s.id, s])).values());
  }, [timetables]);

  const uniqueTeachers = useMemo(() => {
    const teachers = timetables.map(t => ({
      id: t.teacher_id,
      name: t.teacher?.user?.name || "Unknown"
    }));
    return Array.from(new Map(teachers.map(t => [t.id, t])).values());
  }, [timetables]);

  const uniqueCourses = useMemo(() => {
    const courses = timetables.map(t => ({
      id: t.course_id,
      name: t.course?.name || "Unknown"
    }));
    return Array.from(new Map(courses.map(c => [c.id, c])).values());
  }, [timetables]);

  // Filter and sort timetables
  const filteredAndSortedTimetables = useMemo(() => {
    let filtered = [...timetables];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((timetable) => {
        const studentName = timetable.student?.full_name?.toLowerCase() || "";
        const teacherName = timetable.teacher?.user?.name?.toLowerCase() || "";
        const courseName = timetable.course?.name?.toLowerCase() || "";
        return (
          studentName.includes(query) ||
          teacherName.includes(query) ||
          courseName.includes(query)
        );
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    if (studentFilter !== "all") {
      filtered = filtered.filter(t => t.student_id.toString() === studentFilter);
    }

    if (teacherFilter !== "all") {
      filtered = filtered.filter(t => t.teacher_id.toString() === teacherFilter);
    }

    if (courseFilter !== "all") {
      filtered = filtered.filter(t => t.course_id.toString() === courseFilter);
    }

    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
          case "student":
            aValue = a.student?.full_name || "";
            bValue = b.student?.full_name || "";
            break;
          case "teacher":
            aValue = a.teacher?.user?.name || "";
            bValue = b.teacher?.user?.name || "";
            break;
          case "course":
            aValue = a.course?.name || "";
            bValue = b.course?.name || "";
            break;
          case "status":
            aValue = a.status;
            bValue = b.status;
            break;
          case "created_at":
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [timetables, searchQuery, statusFilter, studentFilter, teacherFilter, courseFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className={cn("h-3.5 w-3.5 opacity-40", isRTL ? "mr-1.5" : "ml-1.5")} />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className={cn("h-3.5 w-3.5 text-primary", isRTL ? "mr-1.5" : "ml-1.5")} />;
    }
    return <ArrowDown className={cn("h-3.5 w-3.5 text-primary", isRTL ? "mr-1.5" : "ml-1.5")} />;
  };

  const handleCreate = () => {
    setEditingTimetable(null);
    setIsFormOpen(true);
  };

  const handleEdit = (timetable: Timetable) => {
    setEditingTimetable(timetable);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    await fetchTimetables();
    setIsFormOpen(false);
    setEditingTimetable(null);
  };

  const handlePause = async (id: number) => {
    try {
      await TimetableService.pauseTimetable(id);
      setSuccessMessage(t("timetables.paused") || "Timetable paused successfully");
      setSuccessDialogOpen(true);
      await fetchTimetables();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to pause timetable");
      setErrorDialogOpen(true);
    }
  };

  const handleResume = async (id: number) => {
    try {
      await TimetableService.resumeTimetable(id);
      setSuccessMessage(t("timetables.resume") || "Timetable resumed successfully");
      setSuccessDialogOpen(true);
      await fetchTimetables();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to resume timetable");
      setErrorDialogOpen(true);
    }
  };

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [timetableToDelete, setTimetableToDelete] = useState<number | null>(null);
  
  // Double confirmation for deleting pending classes
  const [deletePendingConfirm1Open, setDeletePendingConfirm1Open] = useState(false);
  const [deletePendingConfirm2Open, setDeletePendingConfirm2Open] = useState(false);
  const [timetableToDeletePending, setTimetableToDeletePending] = useState<number | null>(null);
  const [isDeletingPending, setIsDeletingPending] = useState(false);

  const handleDelete = (id: number) => {
    setTimetableToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!timetableToDelete) return;
    
    try {
      await TimetableService.deleteTimetable(timetableToDelete);
      setSuccessMessage(t("timetables.delete") || "Timetable deleted successfully");
      setSuccessDialogOpen(true);
      setDeleteConfirmOpen(false);
      setTimetableToDelete(null);
      await fetchTimetables();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete timetable");
      setErrorDialogOpen(true);
      setDeleteConfirmOpen(false);
    }
  };

  const handleDeletePendingClasses = (id: number) => {
    setTimetableToDeletePending(id);
    setDeletePendingConfirm1Open(true);
  };

  const confirmDeletePending1 = () => {
    setDeletePendingConfirm1Open(false);
    setDeletePendingConfirm2Open(true);
  };

  const confirmDeletePending2 = async () => {
    if (!timetableToDeletePending) return;
    
    try {
      setIsDeletingPending(true);
      const result = await TimetableService.deleteAllPendingClasses(timetableToDeletePending);
      setSuccessMessage(
        t("timetables.pendingClassesDeleted", { count: result.deleted }) || 
        `Deleted ${result.deleted} pending class(es) successfully`
      );
      setSuccessDialogOpen(true);
      setDeletePendingConfirm2Open(false);
      setTimetableToDeletePending(null);
      await fetchTimetables();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete pending classes");
      setErrorDialogOpen(true);
      setDeletePendingConfirm2Open(false);
    } finally {
      setIsDeletingPending(false);
    }
  };

  const handleGenerateClasses = async () => {
    if (!generatingTimetable || !generateFromDate || !generateToDate) return;

    try {
      setIsGenerating(true);
      await TimetableService.generateClasses(generatingTimetable.id, {
        from_date: generateFromDate,
        to_date: generateToDate,
      });
      setIsGenerateOpen(false);
      setGeneratingTimetable(null);
      setGenerateFromDate("");
      setGenerateToDate("");
      setSuccessMessage(t("timetables.classesGenerated") || "Classes generated successfully!");
      setSuccessDialogOpen(true);
      await fetchTimetables(); // Refresh to update package status
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate classes");
      setErrorDialogOpen(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const openGenerateDialog = async (timetable: Timetable) => {
    // Classes can be generated without a package
    // Package assignment happens when class status changes (attended, cancelled, etc.)
    // This allows classes to be scheduled in advance and assigned to the active package at completion time
    setGeneratingTimetable(timetable);
    setGenerateFromDate(format(new Date(), "yyyy-MM-dd"));
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    setGenerateToDate(format(threeMonthsLater, "yyyy-MM-dd"));
    setIsGenerateOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800";
      case "paused":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
      case "stopped":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return t("timetables.active");
      case "paused":
        return t("timetables.paused");
      case "stopped":
        return t("timetables.stopped");
      default:
        return status;
    }
  };

  const getDayName = (day: number, short: boolean = true) => {
    const daysAr = ["", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"];
    const daysArShort = ["", "إث", "ث", "أر", "خ", "ج", "س", "أح"];
    const daysEn = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const daysEnShort = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    
    if (isRTL) {
      return short ? daysArShort[day] : daysAr[day];
    }
    return short ? daysEnShort[day] : daysEn[day];
  };

  const formatTime12Hour = (time: string): string => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = isRTL ? (hour >= 12 ? "م" : "ص") : (hour >= 12 ? "PM" : "AM");
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const calculateStudentTime = (time: string, timeDiffMinutes: number): { time: string; dateOffset: number } => {
    if (!time) return { time: "", dateOffset: 0 };
    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + timeDiffMinutes;
    const newTotalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
    const newHours = Math.floor(newTotalMinutes / 60);
    const newMins = newTotalMinutes % 60;
    const dateOffset = Math.floor(totalMinutes / 1440);
    return {
      time: `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`,
      dateOffset
    };
  };

  const getTimeDifference = (timetable: Timetable): number => {
    // Use stored time_difference_minutes if available
    if (timetable.time_difference_minutes !== undefined && timetable.time_difference_minutes !== null) {
      return timetable.time_difference_minutes;
    }
    // Fallback to calculating from timezones if not stored
    if (timetable.student_timezone && timetable.teacher_timezone) {
      try {
        const now = new Date();
        const formatter1 = new Intl.DateTimeFormat('en-US', {
          timeZone: timetable.teacher_timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        const formatter2 = new Intl.DateTimeFormat('en-US', {
          timeZone: timetable.student_timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        const time1 = formatter1.format(now);
        const time2 = formatter2.format(now);
        const [h1, m1] = time1.split(':').map(Number);
        const [h2, m2] = time2.split(':').map(Number);
        const minutes1 = h1 * 60 + m1;
        const minutes2 = h2 * 60 + m2;
        let diff = minutes2 - minutes1;
        if (diff > 720) diff -= 1440;
        if (diff < -720) diff += 1440;
        return diff;
      } catch (err) {
        return 0;
      }
    }
    return 0;
  };

  const formatTimeDiff = (minutes: number): string => {
    if (minutes === 0) return isRTL ? "نفس التوقيت" : "Same";
    const sign = minutes > 0 ? "+" : "";
    const hours = Math.floor(Math.abs(minutes) / 60);
    const mins = Math.abs(minutes) % 60;
    if (hours > 0 && mins > 0) {
      return isRTL ? `${sign}${hours}س ${mins}د` : `${sign}${hours}h ${mins}m`;
    } else if (hours > 0) {
      return isRTL ? `${sign}${hours}س` : `${sign}${hours}h`;
    }
    return isRTL ? `${sign}${mins}د` : `${sign}${mins}m`;
  };

  // Calculate statistics
  const stats = {
    total: timetables.length,
    active: timetables.filter(t => t.status === "active").length,
    paused: timetables.filter(t => t.status === "paused").length,
    stopped: timetables.filter(t => t.status === "stopped").length,
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || studentFilter !== "all" || teacherFilter !== "all" || courseFilter !== "all";

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className={isRTL ? "text-right" : "text-left"}>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t("timetables.pageTitle")}
          </h1>
          <p className="text-muted-foreground mt-1.5">{t("timetables.pageDescription")}</p>
        </div>
        <Button onClick={handleCreate} className={cn("gap-2 shadow-lg shadow-primary/20", isRTL && "flex-row-reverse")}>
          <Plus className="h-4 w-4" />
          {t("timetables.createTimetable")}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200/50 dark:border-blue-800/50">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {t("common.total")}
              </p>
              <p className="text-3xl font-bold mt-1 text-blue-900 dark:text-blue-100">{stats.total}</p>
            </div>
            <div className={cn("p-3 rounded-xl bg-blue-500/10 dark:bg-blue-500/20", isRTL && "order-first")}>
              <CalendarDays className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30 border-emerald-200/50 dark:border-emerald-800/50">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {t("timetables.active")}
              </p>
              <p className="text-3xl font-bold mt-1 text-emerald-900 dark:text-emerald-100">{stats.active}</p>
            </div>
            <div className={cn("p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20", isRTL && "order-first")}>
              <Play className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/30 border-amber-200/50 dark:border-amber-800/50">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                {t("timetables.paused")}
              </p>
              <p className="text-3xl font-bold mt-1 text-amber-900 dark:text-amber-100">{stats.paused}</p>
            </div>
            <div className={cn("p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/20", isRTL && "order-first")}>
              <Pause className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/50 dark:to-rose-900/30 border-rose-200/50 dark:border-rose-800/50">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                {t("timetables.stopped")}
              </p>
              <p className="text-3xl font-bold mt-1 text-rose-900 dark:text-rose-100">{stats.stopped}</p>
            </div>
            <div className={cn("p-3 rounded-xl bg-rose-500/10 dark:bg-rose-500/20", isRTL && "order-first")}>
              <X className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-gradient-to-r from-background to-muted/30">
        <div className={cn("flex flex-wrap items-center gap-3", isRTL && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{t("common.filters")}:</span>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className={cn("absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input
                type="text"
                placeholder={t("timetables.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("bg-background/80 backdrop-blur-sm", isRTL ? "pr-9 text-right" : "pl-9")}
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className={cn("w-[130px] bg-background/80", isRTL && "flex-row-reverse")}>
              <SelectValue placeholder={t("timetables.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="active">{t("timetables.active")}</SelectItem>
              <SelectItem value="paused">{t("timetables.paused")}</SelectItem>
              <SelectItem value="stopped">{t("timetables.stopped")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={studentFilter} onValueChange={setStudentFilter}>
            <SelectTrigger className={cn("w-[150px] bg-background/80", isRTL && "flex-row-reverse")}>
              <SelectValue placeholder={t("timetables.student") || t("calendar.student")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {uniqueStudents.map((student) => (
                <SelectItem key={student.id} value={student.id.toString()}>
                  {student.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={teacherFilter} onValueChange={setTeacherFilter}>
            <SelectTrigger className={cn("w-[150px] bg-background/80", isRTL && "flex-row-reverse")}>
              <SelectValue placeholder={t("timetables.teacher") || t("calendar.teacher")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {uniqueTeachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className={cn("w-[150px] bg-background/80", isRTL && "flex-row-reverse")}>
              <SelectValue placeholder={t("timetables.course")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {uniqueCourses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setStudentFilter("all");
                setTeacherFilter("all");
                setCourseFilter("all");
              }}
              className={cn("gap-1.5 text-muted-foreground hover:text-foreground", isRTL && "flex-row-reverse")}
            >
              <X className="h-3.5 w-3.5" />
              {t("common.clear")}
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden border-0 shadow-xl">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-background to-muted/20">
            <LoadingSpinner />
          </div>
        ) : filteredAndSortedTimetables.length === 0 ? (
          <div className="p-12 text-center bg-gradient-to-br from-background to-muted/20">
            <div className="flex flex-col items-center justify-center">
              <div className="p-5 rounded-2xl bg-primary/10 mb-5">
                <Calendar className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("timetables.noTimetables")}</h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-md">
                {isRTL ? "ابدأ بإنشاء جدولك الزمني الأول" : "Get started by creating your first timetable"}
              </p>
              <Button onClick={handleCreate} className={cn("gap-2", isRTL && "flex-row-reverse")}>
                <Plus className="h-4 w-4" />
                {t("timetables.createTimetable")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className={cn("font-bold", isRTL && "text-right")}>
                    <button
                      onClick={() => handleSort("student")}
                      className={cn("flex items-center hover:text-primary transition-colors", isRTL && "flex-row-reverse")}
                    >
                      <Users className={cn("h-4 w-4 text-muted-foreground", isRTL ? "ml-2" : "mr-2")} />
                      {t("timetables.student") || t("calendar.student")}
                      <SortIcon field="student" />
                    </button>
                  </TableHead>
                  <TableHead className={cn("font-bold", isRTL && "text-right")}>
                    <button
                      onClick={() => handleSort("teacher")}
                      className={cn("flex items-center hover:text-primary transition-colors", isRTL && "flex-row-reverse")}
                    >
                      <GraduationCap className={cn("h-4 w-4 text-muted-foreground", isRTL ? "ml-2" : "mr-2")} />
                      {t("timetables.teacher") || t("calendar.teacher")}
                      <SortIcon field="teacher" />
                    </button>
                  </TableHead>
                  <TableHead className={cn("font-bold", isRTL && "text-right")}>
                    <button
                      onClick={() => handleSort("course")}
                      className={cn("flex items-center hover:text-primary transition-colors", isRTL && "flex-row-reverse")}
                    >
                      <BookOpen className={cn("h-4 w-4 text-muted-foreground", isRTL ? "ml-2" : "mr-2")} />
                      {t("timetables.course")}
                      <SortIcon field="course" />
                    </button>
                  </TableHead>
                  <TableHead className={cn("font-bold", isRTL && "text-right")}>
                    {t("timetables.days")}
                  </TableHead>
                  <TableHead className={cn("font-bold", isRTL && "text-right")}>
                    {t("timetables.timeSlots")}
                  </TableHead>
                  <TableHead className={cn("font-bold", isRTL && "text-right")}>
                    {t("timetables.timezones")}
                  </TableHead>
                  <TableHead className={cn("font-bold", isRTL && "text-right")}>
                    <button
                      onClick={() => handleSort("status")}
                      className={cn("flex items-center hover:text-primary transition-colors", isRTL && "flex-row-reverse")}
                    >
                      {t("timetables.status")}
                      <SortIcon field="status" />
                    </button>
                  </TableHead>
                  <TableHead className={cn("font-bold", isRTL && "text-right")}>
                    {t("timetables.package")}
                  </TableHead>
                  <TableHead className={cn("font-bold", isRTL && "text-right")}>
                    <button
                      onClick={() => handleSort("created_at")}
                      className={cn("flex items-center hover:text-primary transition-colors", isRTL && "flex-row-reverse")}
                    >
                      {t("timetables.createdAt") || t("common.createdAt")}
                      <SortIcon field="created_at" />
                    </button>
                  </TableHead>
                  <TableHead className={cn("font-bold", isRTL ? "text-left" : "text-right")}>
                    {t("common.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTimetables.map((timetable, index) => {
                  const timeDiffMinutes = getTimeDifference(timetable);
                  return (
                    <TableRow 
                      key={timetable.id} 
                      className={cn(
                        "transition-colors",
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      )}
                    >
                      <TableCell className={cn("font-medium", isRTL && "text-right")}>
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse justify-end")}>
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                            {(timetable.student?.full_name || "?")[0]}
                          </div>
                          <span>{timetable.student?.full_name || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? "text-right" : ""}>
                        {timetable.teacher?.user?.name || "N/A"}
                      </TableCell>
                      <TableCell className={isRTL ? "text-right" : ""}>
                        <Badge variant="outline" className="font-normal">
                          {timetable.course?.name || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className={isRTL ? "text-right" : ""}>
                        <div className={cn("flex flex-wrap gap-1", isRTL && "justify-end")}>
                          {timetable.days_of_week.map((day) => (
                            <TooltipProvider key={day}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium">
                                    {getDayName(day, true)}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {getDayName(day, false)}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? "text-right" : ""}>
                        <div className="space-y-1.5">
                          {timetable.time_slots.map((slot, idx) => {
                            const studentStart = calculateStudentTime(slot.start, timeDiffMinutes);
                            return (
                              <div key={idx} className={cn("flex items-center gap-2 text-xs", isRTL && "flex-row-reverse justify-end")}>
                                <Badge variant="outline" className="font-mono text-[11px] bg-background">
                                  {formatTime12Hour(slot.start)} - {formatTime12Hour(slot.end)}
                                </Badge>
                                {timeDiffMinutes !== 0 && (
                                  <>
                                    <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground font-mono">
                                      {formatTime12Hour(studentStart.time)}
                                    </span>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? "text-right" : ""}>
                        <div className={cn("space-y-1 text-xs", isRTL && "text-right")}>
                          <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse justify-end")}>
                            <span className="text-muted-foreground">{isRTL ? "ط:" : "S:"}</span>
                            <span className="font-medium">{timetable.student_timezone?.split("/").pop() || "UTC"}</span>
                          </div>
                          <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse justify-end")}>
                            <span className="text-muted-foreground">{isRTL ? "م:" : "T:"}</span>
                            <span className="font-medium">{timetable.teacher_timezone?.split("/").pop() || "UTC"}</span>
                          </div>
                          {timeDiffMinutes !== 0 && (
                            <Badge variant="outline" className={cn("text-[10px]", timeDiffMinutes > 0 ? "text-blue-600" : "text-orange-600")}>
                              {formatTimeDiff(timeDiffMinutes)}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? "text-right" : ""}>
                        <Badge 
                          variant="outline" 
                          className={cn(getStatusColor(timetable.status), "font-medium")}
                        >
                          {getStatusLabel(timetable.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className={isRTL ? "text-right" : ""}>
                        {(() => {
                          const packageData = studentPackages[timetable.student_id];
                          const hasPackage = packageData && (
                            packageData.status === "active" && 
                            ((packageData.remaining_classes ?? 0) > 0 || (packageData.remaining_hours ?? 0) > 0)
                          );
                          
                          return hasPackage ? (
                            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-500/20">
                              <PackageCheck className={cn("h-3.5 w-3.5", isRTL ? "ml-1" : "mr-1")} />
                              {t("timetables.hasPackage")}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700">
                              <PackageX className={cn("h-3.5 w-3.5", isRTL ? "ml-1" : "mr-1")} />
                              {t("timetables.noPackage")}
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell className={isRTL ? "text-right" : ""}>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(timetable.created_at), "dd MMM yyyy", { locale: dateLocale })}
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? "text-left" : "text-right"}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-48">
                            {timetable.status === "active" ? (
                              <DropdownMenuItem onClick={() => handlePause(timetable.id)} className={cn(isRTL && "flex-row-reverse")}>
                                <Pause className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                                {t("timetables.pause")}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleResume(timetable.id)} className={cn(isRTL && "flex-row-reverse")}>
                                <Play className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                                {t("timetables.resume")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => openGenerateDialog(timetable)} className={cn(isRTL && "flex-row-reverse")}>
                              <RefreshCw className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                              {t("timetables.generateClasses")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(timetable)} className={cn(isRTL && "flex-row-reverse")}>
                              <Edit className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                              {t("timetables.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeletePendingClasses(timetable.id)}
                              className={cn("text-destructive focus:text-destructive", isRTL && "flex-row-reverse")}
                            >
                              <Trash2 className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                              {t("timetables.removePendingClasses")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(timetable.id)}
                              className={cn("text-destructive focus:text-destructive", isRTL && "flex-row-reverse")}
                            >
                              <Trash2 className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                              {t("timetables.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Results count */}
        {!isLoading && filteredAndSortedTimetables.length > 0 && (
          <div className={cn("px-4 py-3 border-t bg-muted/30 text-sm text-muted-foreground", isRTL ? "text-right" : "text-left")}>
            {isRTL 
              ? `عرض ${filteredAndSortedTimetables.length} من ${timetables.length} جدول`
              : `Showing ${filteredAndSortedTimetables.length} of ${timetables.length} timetables`
            }
          </div>
        )}
      </Card>

      <TimetableFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        timetable={editingTimetable}
        onSave={handleSave}
      />

      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent dir={direction}>
          <DialogHeader className={isRTL ? "text-right" : "text-left"}>
            <DialogTitle>{t("timetables.generateClasses")}</DialogTitle>
            <DialogDescription>
              {t("timetables.generateClassesDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={isRTL ? "text-right block" : ""}>{t("timetables.fromDate")}</Label>
              <Input
                type="date"
                value={generateFromDate}
                onChange={(e) => setGenerateFromDate(e.target.value)}
                className={isRTL ? "text-right" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label className={isRTL ? "text-right block" : ""}>{t("timetables.toDate")}</Label>
              <Input
                type="date"
                value={generateToDate}
                onChange={(e) => setGenerateToDate(e.target.value)}
                className={isRTL ? "text-right" : ""}
              />
            </div>
          </div>
          <DialogFooter className={isRTL ? "flex-row-reverse" : ""}>
            <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleGenerateClasses} disabled={isGenerating}>
              {isGenerating ? t("timetables.generating") : t("timetables.generateClasses")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent dir={direction} className={cn("max-w-md", isRTL && "text-right")}>
          <DialogHeader className={isRTL ? "text-right" : "text-left"}>
            <DialogTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse justify-end")}>
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className={isRTL ? "text-right" : "text-left"}>{isRTL ? "خطأ" : "Error"}</span>
            </DialogTitle>
            <DialogDescription className={cn(isRTL ? "text-right" : "text-left", isRTL && "text-right")}>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className={isRTL ? "flex-row-reverse" : ""}>
            <Button onClick={() => setErrorDialogOpen(false)}>
              {t("common.close") || (isRTL ? "إغلاق" : "Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Pending Classes - First Confirmation */}
      <Dialog open={deletePendingConfirm1Open} onOpenChange={setDeletePendingConfirm1Open}>
        <DialogContent dir={direction} className={cn("max-w-md", isRTL && "text-right")}>
          <DialogHeader className={isRTL ? "text-right" : "text-left"}>
            <DialogTitle className={cn("flex items-center gap-2 text-destructive", isRTL && "flex-row-reverse justify-end")}>
              <AlertCircle className="h-5 w-5" />
              <span className={isRTL ? "text-right" : "text-left"}>{t("timetables.removePendingClasses") || "Remove Pending Classes"}</span>
            </DialogTitle>
            <DialogDescription className={cn(isRTL ? "text-right" : "text-left", isRTL && "text-right")}>
              {t("timetables.removePendingClassesWarning1") || 
                "This will delete ALL pending and waiting list classes for this timetable. This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className={isRTL ? "flex-row-reverse" : ""}>
            <Button variant="outline" onClick={() => {
              setDeletePendingConfirm1Open(false);
              setTimetableToDeletePending(null);
            }}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDeletePending1}>
              {t("common.continue") || "Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Pending Classes - Second Confirmation */}
      <Dialog open={deletePendingConfirm2Open} onOpenChange={setDeletePendingConfirm2Open}>
        <DialogContent dir={direction} className={cn("max-w-md", isRTL && "text-right")}>
          <DialogHeader className={isRTL ? "text-right" : "text-left"}>
            <DialogTitle className={cn("flex items-center gap-2 text-destructive", isRTL && "flex-row-reverse justify-end")}>
              <AlertCircle className="h-5 w-5" />
              <span className={isRTL ? "text-right" : "text-left"}>{t("timetables.finalConfirmation") || "Final Confirmation"}</span>
            </DialogTitle>
            <DialogDescription className={cn(isRTL ? "text-right" : "text-left", isRTL && "text-right")}>
              {t("timetables.removePendingClassesWarning2") || 
                "Are you absolutely sure? This will permanently delete all pending classes. Attended and cancelled classes will NOT be affected."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className={isRTL ? "flex-row-reverse" : ""}>
            <Button variant="outline" onClick={() => {
              setDeletePendingConfirm2Open(false);
              setTimetableToDeletePending(null);
            }} disabled={isDeletingPending}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDeletePending2} disabled={isDeletingPending}>
              {isDeletingPending 
                ? (t("common.deleting") || "Deleting...") 
                : (t("timetables.confirmDelete") || "Yes, Delete All Pending Classes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent dir={direction} className={cn("max-w-md", isRTL && "text-right")}>
          <DialogHeader className={isRTL ? "text-right" : "text-left"}>
            <DialogTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse justify-end")}>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span className={isRTL ? "text-right" : "text-left"}>{isRTL ? "نجح" : "Success"}</span>
            </DialogTitle>
            <DialogDescription className={cn(isRTL ? "text-right" : "text-left", isRTL && "text-right")}>
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className={isRTL ? "flex-row-reverse" : ""}>
            <Button onClick={() => setSuccessDialogOpen(false)}>
              {t("common.close") || (isRTL ? "إغلاق" : "Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent dir={direction} className={cn("max-w-md", isRTL && "text-right")}>
          <DialogHeader className={isRTL ? "text-right" : "text-left"}>
            <DialogTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse justify-end")}>
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className={isRTL ? "text-right" : "text-left"}>{t("timetables.delete")}</span>
            </DialogTitle>
            <DialogDescription className={cn(isRTL ? "text-right" : "text-left", isRTL && "text-right")}>
              {t("timetables.deleteConfirmation")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className={isRTL ? "flex-row-reverse" : ""}>
            <Button variant="outline" onClick={() => {
              setDeleteConfirmOpen(false);
              setTimetableToDelete(null);
            }}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t("timetables.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
