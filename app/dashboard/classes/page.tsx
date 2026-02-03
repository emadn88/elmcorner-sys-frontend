"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  Filter,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarDays,
  Users,
  MoreVertical,
  Edit,
  CalendarClock,
  GraduationCap,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClassInstance, ClassFilters, Student, Teacher } from "@/lib/api/types";
import { ClassService, UpdateClassStatusRequest, UpdateClassRequest } from "@/lib/services/class.service";
import { StudentService } from "@/lib/services/student.service";
import { TeacherService } from "@/lib/services/teacher.service";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format, startOfToday, parseISO } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ClassStats {
  total: number;
  pending: number;
  attended: number;
  cancelled: number;
  absent: number;
}

type SortField = "student" | "teacher" | "course" | "date" | "time" | "status" | null;
type SortDirection = "asc" | "desc" | null;

export default function ClassesPage() {
  const { t, direction, language } = useLanguage();
  const [classes, setClasses] = useState<ClassInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ClassStats>({
    total: 0,
    pending: 0,
    attended: 0,
    cancelled: 0,
    absent: 0,
  });

  // Filters - Default to today's date
  const today = format(startOfToday(), "yyyy-MM-dd");
  const [filters, setFilters] = useState<ClassFilters>({
    start_date: today, // Default to today
    end_date: today, // Default to today
    student_id: undefined,
    teacher_id: undefined,
    status: undefined,
  });

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Options for filters
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Status update modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassInstance | null>(null);
  const [newStatus, setNewStatus] = useState<ClassInstance["status"]>("pending");
  const [cancellationReason, setCancellationReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Reschedule modal
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStartTime, setRescheduleStartTime] = useState("");
  const [rescheduleEndTime, setRescheduleEndTime] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Dialog states
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const isRTL = direction === "rtl";
  const dateLocale = language === "ar" ? ar : enUS;

  // Fetch classes
  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const response = await ClassService.getClasses({
        ...filters,
        per_page: 1000,
      });
      
      // Filter out classes from paused or stopped timetables
      // Also filter out classes from paid packages (archived classes)
      const activeClasses = response.data.filter((classItem) => {
        // Filter out paused/stopped timetables
        if (classItem.timetable && classItem.timetable.status !== "active") {
          return false;
        }
        // Filter out classes from paid packages (archived, already paid for)
        // Keep classes from active and finished (pending payment) packages
        if (classItem.package && classItem.package.status === "paid") {
          return false;
        }
        return true;
      });
      
      setClasses(activeClasses);
      calculateStats(activeClasses);
    } catch (err: any) {
      console.error("Failed to fetch classes:", err);
      setErrorMessage(err.message || "Failed to fetch classes");
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (classesData: ClassInstance[]) => {
    const statsData: ClassStats = {
      total: classesData.length,
      pending: 0,
      attended: 0,
      cancelled: 0,
      absent: 0,
    };

    classesData.forEach((classItem) => {
      switch (classItem.status) {
        case "pending":
          statsData.pending++;
          break;
        case "attended":
          statsData.attended++;
          break;
        case "cancelled_by_student":
        case "cancelled_by_teacher":
          statsData.cancelled++;
          break;
        case "absent_student":
          statsData.absent++;
          break;
      }
    });

    setStats(statsData);
  };

  // Load filter options
  const loadFilterOptions = async () => {
    try {
      setIsLoadingOptions(true);
      const [studentsRes, teachersRes] = await Promise.all([
        StudentService.getStudents({ per_page: 100 }),
        TeacherService.getTeachers({ per_page: 100 }),
      ]);
      setStudents(studentsRes.data);
      setTeachers(teachersRes.data);
    } catch (err) {
      console.error("Failed to load filter options:", err);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // Get unique values for filters
  const uniqueStudents = useMemo(() => {
    const studentList = classes.map(c => ({
      id: c.student_id,
      name: c.student?.full_name || "Unknown"
    }));
    return Array.from(new Map(studentList.map(s => [s.id, s])).values());
  }, [classes]);

  const uniqueTeachers = useMemo(() => {
    const teacherList = classes.map(c => ({
      id: c.teacher_id,
      name: c.teacher?.user?.name || "Unknown"
    }));
    return Array.from(new Map(teacherList.map(t => [t.id, t])).values());
  }, [classes]);

  const uniqueCourses = useMemo(() => {
    const courseList = classes.map(c => ({
      id: c.course_id,
      name: c.course?.name || "Unknown"
    }));
    return Array.from(new Map(courseList.map(c => [c.id, c])).values());
  }, [classes]);

  // Filter and sort classes
  const filteredAndSortedClasses = useMemo(() => {
    let filtered = [...classes];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((classItem) => {
        const studentName = classItem.student?.full_name?.toLowerCase() || "";
        const teacherName = classItem.teacher?.user?.name?.toLowerCase() || "";
        const courseName = classItem.course?.name?.toLowerCase() || "";
        return (
          studentName.includes(query) ||
          teacherName.includes(query) ||
          courseName.includes(query)
        );
      });
    }

    // Apply student filter
    if (filters.student_id) {
      filtered = filtered.filter(c => c.student_id === filters.student_id);
    }

    // Apply teacher filter
    if (filters.teacher_id) {
      filtered = filtered.filter(c => c.teacher_id === filters.teacher_id);
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    // Apply sorting
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
          case "date":
            aValue = new Date(a.class_date).getTime();
            bValue = new Date(b.class_date).getTime();
            break;
          case "time":
            aValue = a.start_time;
            bValue = b.start_time;
            break;
          case "status":
            aValue = a.status;
            bValue = b.status;
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
  }, [classes, searchQuery, filters.student_id, filters.teacher_id, filters.status, sortField, sortDirection]);

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

  // Convert 24-hour time to 12-hour AM/PM format
  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.substring(0, 5).split(':');
    const hour = parseInt(hours, 10);
    const ampm = isRTL ? (hour >= 12 ? "م" : "ص") : (hour >= 12 ? "PM" : "AM");
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    fetchClasses();
  }, [filters]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedClass) return;

    try {
      setIsUpdating(true);
      const updateData: UpdateClassStatusRequest = {
        status: newStatus,
      };

      if (
        newStatus === "cancelled_by_student" ||
        newStatus === "cancelled_by_teacher"
      ) {
        if (!cancellationReason.trim()) {
          setErrorMessage(t("calendar.cancellationReasonRequired") || "Cancellation reason is required");
          setErrorDialogOpen(true);
          setIsUpdating(false);
          return;
        }
        updateData.cancellation_reason = cancellationReason;
      }

      await ClassService.updateClassStatus(selectedClass.id, updateData);
      setSuccessMessage(t("calendar.statusUpdated") || "Class status updated successfully");
      setSuccessDialogOpen(true);
      await fetchClasses();
      setIsStatusModalOpen(false);
      setSelectedClass(null);
      setCancellationReason("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update class status");
      setErrorDialogOpen(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const openStatusModal = (classItem: ClassInstance) => {
    setSelectedClass(classItem);
    setNewStatus(classItem.status);
    setCancellationReason(classItem.cancellation_reason || "");
    setIsStatusModalOpen(true);
  };

  const openRescheduleModal = (classItem: ClassInstance) => {
    setSelectedClass(classItem);
    setRescheduleDate(format(parseISO(classItem.class_date), "yyyy-MM-dd"));
    const startTime = classItem.start_time.substring(0, 5);
    const endTime = classItem.end_time.substring(0, 5);
    setRescheduleStartTime(startTime);
    setRescheduleEndTime(endTime);
    setIsRescheduleModalOpen(true);
  };

  const handleReschedule = async () => {
    if (!selectedClass || !rescheduleDate || !rescheduleStartTime || !rescheduleEndTime) {
      setErrorMessage(t("calendar.fillAllFields") || "Please fill in all required fields");
      setErrorDialogOpen(true);
      return;
    }

    if (rescheduleStartTime >= rescheduleEndTime) {
      setErrorMessage(t("calendar.endTimeAfterStart") || "End time must be after start time");
      setErrorDialogOpen(true);
      return;
    }

    try {
      setIsRescheduling(true);
      const updateData: UpdateClassRequest = {
        class_date: rescheduleDate,
        start_time: rescheduleStartTime,
        end_time: rescheduleEndTime,
      };

      await ClassService.updateClass(selectedClass.id, updateData);
      setSuccessMessage(t("calendar.classRescheduled") || "Class rescheduled successfully");
      setSuccessDialogOpen(true);
      await fetchClasses();
      setIsRescheduleModalOpen(false);
      setSelectedClass(null);
      setRescheduleDate("");
      setRescheduleStartTime("");
      setRescheduleEndTime("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to reschedule class");
      setErrorDialogOpen(true);
    } finally {
      setIsRescheduling(false);
    }
  };

  const getStatusColor = (status: ClassInstance["status"]) => {
    switch (status) {
      case "attended":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
      case "cancelled_by_student":
      case "cancelled_by_teacher":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800";
      case "absent_student":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
    }
  };

  const getStatusRowColor = (status: ClassInstance["status"]) => {
    switch (status) {
      case "attended":
        return "bg-emerald-200 dark:bg-emerald-900/40 hover:bg-emerald-300 dark:hover:bg-emerald-800/50";
      case "pending":
        return "bg-background hover:bg-muted/20";
      case "cancelled_by_student":
      case "cancelled_by_teacher":
        return "bg-rose-200 dark:bg-rose-900/40 hover:bg-rose-300 dark:hover:bg-rose-800/50";
      case "absent_student":
        return "bg-orange-200 dark:bg-orange-900/40 hover:bg-orange-300 dark:hover:bg-orange-800/50";
      default:
        return "bg-background hover:bg-muted/20";
    }
  };

  const getStatusIcon = (status: ClassInstance["status"]) => {
    switch (status) {
      case "attended":
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "pending":
        return <AlertCircle className="h-3.5 w-3.5" />;
      case "cancelled_by_student":
      case "cancelled_by_teacher":
        return <XCircle className="h-3.5 w-3.5" />;
      case "absent_student":
        return <AlertTriangle className="h-3.5 w-3.5" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5" />;
    }
  };

  const getStatusLabel = (status: ClassInstance["status"]) => {
    switch (status) {
      case "attended":
        return t("calendar.attended");
      case "pending":
        return t("calendar.pending");
      case "cancelled_by_student":
        return t("calendar.cancelledByStudent");
      case "cancelled_by_teacher":
        return t("calendar.cancelledByTeacher");
      case "absent_student":
        return t("calendar.absentStudent");
      default:
        return status;
    }
  };

  const clearFilters = () => {
    const today = format(startOfToday(), "yyyy-MM-dd");
    setFilters({
      start_date: today, // Reset to today
      end_date: today, // Reset to today
      student_id: undefined,
      teacher_id: undefined,
      status: undefined,
    });
    setSearchQuery("");
  };

  const hasActiveFilters = searchQuery || filters.student_id || filters.teacher_id || filters.status;

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className={isRTL ? "text-right" : "text-left"}>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t("calendar.classes") || "Classes"}
          </h1>
          <p className="text-muted-foreground mt-1.5">
            {t("calendar.description") || "View and manage all classes"}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200/50 dark:border-blue-800/50">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {t("common.total") || (isRTL ? "الإجمالي" : "Total")}
              </p>
              <p className="text-3xl font-bold mt-1 text-blue-900 dark:text-blue-100">{stats.total}</p>
            </div>
            <div className={cn("p-3 rounded-xl bg-blue-500/10 dark:bg-blue-500/20", isRTL && "order-first")}>
              <CalendarDays className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/30 border-amber-200/50 dark:border-amber-800/50">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                {t("calendar.pending")}
              </p>
              <p className="text-3xl font-bold mt-1 text-amber-900 dark:text-amber-100">{stats.pending}</p>
            </div>
            <div className={cn("p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/20", isRTL && "order-first")}>
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30 border-emerald-200/50 dark:border-emerald-800/50">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {t("calendar.attended")}
              </p>
              <p className="text-3xl font-bold mt-1 text-emerald-900 dark:text-emerald-100">{stats.attended}</p>
            </div>
            <div className={cn("p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20", isRTL && "order-first")}>
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/50 dark:to-rose-900/30 border-rose-200/50 dark:border-rose-800/50">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                {t("calendar.cancelledByStudent") || (isRTL ? "ملغي" : "Cancelled")}
              </p>
              <p className="text-3xl font-bold mt-1 text-rose-900 dark:text-rose-100">{stats.cancelled}</p>
            </div>
            <div className={cn("p-3 rounded-xl bg-rose-500/10 dark:bg-rose-500/20", isRTL && "order-first")}>
              <XCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200/50 dark:border-orange-800/50">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                {t("calendar.absentStudent")}
              </p>
              <p className="text-3xl font-bold mt-1 text-orange-900 dark:text-orange-100">{stats.absent}</p>
            </div>
            <div className={cn("p-3 rounded-xl bg-orange-500/10 dark:bg-orange-500/20", isRTL && "order-first")}>
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-gradient-to-r from-background to-muted/30">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label className={cn("text-xs mb-1.5 block", isRTL && "text-right")}>
              {t("common.search") || (isRTL ? "البحث" : "Search")}
            </Label>
            <div className="relative">
              <Search className={cn("absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input
                type="text"
                placeholder={t("calendar.searchPlaceholder") || (isRTL ? "البحث..." : "Search...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("bg-background/80 backdrop-blur-sm", isRTL ? "pr-9 text-right" : "pl-9")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className={cn("text-xs mb-1.5 block", isRTL && "text-right")}>
              {t("timetables.fromDate") || (isRTL ? "من تاريخ" : "From Date")}
            </Label>
            <Input
              type="date"
              value={filters.start_date || ""}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value || undefined })}
              className={cn("w-[140px] bg-background/80", isRTL && "text-right")}
            />
          </div>

          <div className="space-y-2">
            <Label className={cn("text-xs mb-1.5 block", isRTL && "text-right")}>
              {t("timetables.toDate") || (isRTL ? "إلى تاريخ" : "To Date")}
            </Label>
            <Input
              type="date"
              value={filters.end_date || ""}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value || undefined })}
              className={cn("w-[140px] bg-background/80", isRTL && "text-right")}
            />
          </div>

          <div className="space-y-2">
            <Label className={cn("text-xs mb-1.5 block", isRTL && "text-right")}>
              {t("calendar.student") || (isRTL ? "الطالب" : "Student")}
            </Label>
            <Select 
              value={filters.student_id?.toString() || "all"} 
              onValueChange={(value) => setFilters({ ...filters, student_id: value === "all" ? undefined : parseInt(value) })}
            >
              <SelectTrigger className={cn("w-[150px] bg-background/80", isRTL && "flex-row-reverse")}>
                <SelectValue placeholder={t("common.all")} />
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
          </div>

          <div className="space-y-2">
            <Label className={cn("text-xs mb-1.5 block", isRTL && "text-right")}>
              {t("calendar.teacher") || (isRTL ? "المعلم" : "Teacher")}
            </Label>
            <Select 
              value={filters.teacher_id?.toString() || "all"} 
              onValueChange={(value) => setFilters({ ...filters, teacher_id: value === "all" ? undefined : parseInt(value) })}
            >
              <SelectTrigger className={cn("w-[150px] bg-background/80", isRTL && "flex-row-reverse")}>
                <SelectValue placeholder={t("common.all")} />
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
          </div>

          <div className="space-y-2">
            <Label className={cn("text-xs mb-1.5 block", isRTL && "text-right")}>
              {t("calendar.status") || (isRTL ? "الحالة" : "Status")}
            </Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? undefined : (value as any) })}
            >
              <SelectTrigger className={cn("w-[140px] bg-background/80", isRTL && "flex-row-reverse")}>
                <SelectValue placeholder={t("common.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="pending">{t("calendar.pending")}</SelectItem>
                <SelectItem value="attended">{t("calendar.attended")}</SelectItem>
                <SelectItem value="cancelled_by_student">{t("calendar.cancelledByStudent")}</SelectItem>
                <SelectItem value="cancelled_by_teacher">{t("calendar.cancelledByTeacher")}</SelectItem>
                <SelectItem value="absent_student">{t("calendar.absentStudent")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
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
        ) : filteredAndSortedClasses.length === 0 ? (
          <div className="p-12 text-center bg-gradient-to-br from-background to-muted/20">
            <div className="flex flex-col items-center justify-center">
              <div className="p-5 rounded-2xl bg-primary/10 mb-5">
                <Calendar className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("calendar.noClasses") || (isRTL ? "لا توجد حصص" : "No classes found")}
              </h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-md">
                {isRTL ? "لا توجد حصص تطابق الفلاتر الحالية" : "No classes match your current filters"}
              </p>
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
                      {t("calendar.student") || "Student"}
                      <SortIcon field="student" />
                    </button>
                  </TableHead>
                  <TableHead className={cn("font-bold", isRTL && "text-right")}>
                    <button
                      onClick={() => handleSort("teacher")}
                      className={cn("flex items-center hover:text-primary transition-colors", isRTL && "flex-row-reverse")}
                    >
                      <GraduationCap className={cn("h-4 w-4 text-muted-foreground", isRTL ? "ml-2" : "mr-2")} />
                      {t("calendar.teacher") || "Teacher"}
                      <SortIcon field="teacher" />
                    </button>
                  </TableHead>
                  <TableHead className={cn("font-bold", isRTL && "text-right")}>
                    {t("students.country") || t("common.country") || (isRTL ? "الدولة" : "Country")}
                  </TableHead>
                  <TableHead className={cn("font-bold", isRTL && "text-right")}>
                    <button
                      onClick={() => handleSort("course")}
                      className={cn("flex items-center hover:text-primary transition-colors", isRTL && "flex-row-reverse")}
                    >
                      <BookOpen className={cn("h-4 w-4 text-muted-foreground", isRTL ? "ml-2" : "mr-2")} />
                      {t("calendar.course") || "Course"}
                      <SortIcon field="course" />
                    </button>
                  </TableHead>
                  <TableHead className={cn("font-bold", isRTL && "text-right")}>
                    <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                      <GraduationCap className={cn("h-4 w-4 text-muted-foreground", isRTL ? "ml-1" : "mr-1")} />
                      {t("calendar.teacher") || "Teacher"} {t("calendar.date") || "Date"} & {t("calendar.time") || "Time"}
                    </div>
                  </TableHead>
                  <TableHead className={cn("font-bold", isRTL && "text-right")}>
                    <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                      <Users className={cn("h-4 w-4 text-muted-foreground", isRTL ? "ml-1" : "mr-1")} />
                      {t("calendar.student") || "Student"} {t("calendar.date") || "Date"} & {t("calendar.time") || "Time"}
                    </div>
                  </TableHead>
                  <TableHead className={cn("font-bold", isRTL && "text-right")}>
                    <button
                      onClick={() => handleSort("status")}
                      className={cn("flex items-center hover:text-primary transition-colors", isRTL && "flex-row-reverse")}
                    >
                      {t("calendar.status") || "Status"}
                      <SortIcon field="status" />
                    </button>
                  </TableHead>
                  <TableHead className={cn("font-bold w-[200px]", isRTL && "text-right")}>
                    {t("calendar.notes") || "Notes"}
                  </TableHead>
                  <TableHead className={cn("font-bold", isRTL ? "text-left" : "text-right")}>
                    {t("common.actions") || "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedClasses.map((classItem, index) => (
                  <TableRow 
                    key={classItem.id} 
                    className={cn(
                      "transition-colors",
                      getStatusRowColor(classItem.status)
                    )}
                  >
                    <TableCell className={cn("font-medium", isRTL && "text-right")}>
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse justify-end")}>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {(classItem.student?.full_name || "?")[0]}
                        </div>
                        <span>{classItem.student?.full_name || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell className={isRTL ? "text-right" : ""}>
                      {classItem.teacher?.user?.name || "N/A"}
                    </TableCell>
                    <TableCell className={isRTL ? "text-right" : ""}>
                      <Badge variant="outline" className="font-normal text-xs">
                        {classItem.student?.country || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className={isRTL ? "text-right" : ""}>
                      <Badge variant="outline" className="font-normal">
                        {classItem.course?.name || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className={isRTL ? "text-right" : ""}>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground">
                          {format(parseISO(classItem.class_date), "EEEE, dd MMM yyyy", { locale: dateLocale })}
                        </div>
                        <div className="text-xs font-mono text-foreground">
                          {formatTime12Hour(classItem.start_time)} - {formatTime12Hour(classItem.end_time)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={isRTL ? "text-right" : ""}>
                      {classItem.student_date && classItem.student_start_time && classItem.student_end_time ? (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-muted-foreground">
                            {format(parseISO(classItem.student_date), "EEEE, dd MMM yyyy", { locale: dateLocale })}
                          </div>
                          <div className="text-xs font-mono text-foreground">
                            {formatTime12Hour(classItem.student_start_time)} - {formatTime12Hour(classItem.student_end_time)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          {isRTL ? "غير متوفر" : "N/A"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className={isRTL ? "text-right" : ""}>
                      <Badge 
                        variant="outline" 
                        className={cn(getStatusColor(classItem.status), "font-medium flex items-center gap-1 w-fit", isRTL && "flex-row-reverse")}
                      >
                        {getStatusIcon(classItem.status)}
                        {getStatusLabel(classItem.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className={isRTL ? "text-right" : ""}>
                      {classItem.notes ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="text-xs text-muted-foreground line-clamp-1 max-w-[180px]">
                                {classItem.notes}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{classItem.notes}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                      {classItem.cancellation_reason && (
                        <div className="mt-1 text-xs text-rose-600 dark:text-rose-400 line-clamp-1 max-w-[180px]">
                          {isRTL ? "سبب الإلغاء: " : "Cancel: "}{classItem.cancellation_reason}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className={isRTL ? "text-left" : "text-right"}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-48">
                          <DropdownMenuItem onClick={() => openRescheduleModal(classItem)} className={cn(isRTL && "flex-row-reverse")}>
                            <CalendarClock className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                            {t("calendar.reschedule") || "Reschedule"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openStatusModal(classItem)} className={cn(isRTL && "flex-row-reverse")}>
                            <Edit className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                            {t("calendar.updateStatus") || "Update Status"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Results count */}
        {!isLoading && filteredAndSortedClasses.length > 0 && (
          <div className={cn("px-4 py-3 border-t bg-muted/30 text-sm text-muted-foreground", isRTL ? "text-right" : "text-left")}>
            {isRTL 
              ? `عرض ${filteredAndSortedClasses.length} من ${classes.length} حصة`
              : `Showing ${filteredAndSortedClasses.length} of ${classes.length} classes`
            }
          </div>
        )}
      </Card>

      {/* Status Update Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent dir={direction}>
          <DialogHeader className={isRTL ? "text-right" : "text-left"}>
            <DialogTitle>
              {t("calendar.updateStatus") || "Update Class Status"}
            </DialogTitle>
            <DialogDescription>
              {t("calendar.viewAndManage") || "Update the status of this class"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={isRTL ? "text-right block" : ""}>{t("calendar.status") || "Status"}</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as ClassInstance["status"])}
              >
                <SelectTrigger className={isRTL ? "flex-row-reverse" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    {t("calendar.pending") || "Pending"}
                  </SelectItem>
                  <SelectItem value="attended">
                    {t("calendar.attended") || "Attended"}
                  </SelectItem>
                  <SelectItem value="cancelled_by_student">
                    {t("calendar.cancelledByStudent") || "Cancelled by Student"}
                  </SelectItem>
                  <SelectItem value="cancelled_by_teacher">
                    {t("calendar.cancelledByTeacher") || "Cancelled by Teacher"}
                  </SelectItem>
                  <SelectItem value="absent_student">
                    {t("calendar.absentStudent") || "Absent"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(newStatus === "cancelled_by_student" ||
              newStatus === "cancelled_by_teacher") && (
              <div className="space-y-2">
                <Label className={isRTL ? "text-right block" : ""}>
                  {t("calendar.cancellationReason") || "Cancellation Reason"} *
                </Label>
                <Textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder={
                    t("calendar.enterCancellationReason") ||
                    "Enter cancellation reason..."
                  }
                  rows={3}
                  className={isRTL ? "text-right" : ""}
                  dir={direction}
                />
              </div>
            )}
          </div>
          <DialogFooter className={isRTL ? "flex-row-reverse" : ""}>
            <Button
              variant="outline"
              onClick={() => {
                setIsStatusModalOpen(false);
                setSelectedClass(null);
                setCancellationReason("");
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdating}>
              {isUpdating
                ? t("common.updating") || "Updating..."
                : t("calendar.updateStatusButton") || "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal */}
      <Dialog open={isRescheduleModalOpen} onOpenChange={setIsRescheduleModalOpen}>
        <DialogContent dir={direction}>
          <DialogHeader className={isRTL ? "text-right" : "text-left"}>
            <DialogTitle>
              {t("calendar.reschedule") || "Reschedule Class"}
            </DialogTitle>
            <DialogDescription>
              {t("calendar.rescheduleDescription") || "Change the date and time for this class"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={isRTL ? "text-right block" : ""}>{t("calendar.date") || "Date"} *</Label>
              <Input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                required
                className={isRTL ? "text-right" : ""}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={isRTL ? "text-right block" : ""}>{t("calendar.startTime") || "Start Time"} *</Label>
                <Input
                  type="time"
                  value={rescheduleStartTime}
                  onChange={(e) => setRescheduleStartTime(e.target.value)}
                  required
                  className={isRTL ? "text-right" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label className={isRTL ? "text-right block" : ""}>{t("calendar.endTime") || "End Time"} *</Label>
                <Input
                  type="time"
                  value={rescheduleEndTime}
                  onChange={(e) => setRescheduleEndTime(e.target.value)}
                  required
                  className={isRTL ? "text-right" : ""}
                />
              </div>
            </div>

            {selectedClass && (
              <div className="p-3 bg-muted rounded-md">
                <p className={cn("text-sm font-medium mb-1", isRTL && "text-right")}>
                  {t("calendar.classDetails") || "Current Schedule"}
                </p>
                <p className={cn("text-xs text-muted-foreground", isRTL && "text-right")}>
                  {format(parseISO(selectedClass.class_date), "dd MMM yyyy", { locale: dateLocale })} •{" "}
                  {formatTime12Hour(selectedClass.start_time)} -{" "}
                  {formatTime12Hour(selectedClass.end_time)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className={isRTL ? "flex-row-reverse" : ""}>
            <Button
              variant="outline"
              onClick={() => {
                setIsRescheduleModalOpen(false);
                setSelectedClass(null);
                setRescheduleDate("");
                setRescheduleStartTime("");
                setRescheduleEndTime("");
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleReschedule} disabled={isRescheduling}>
              {isRescheduling
                ? t("common.updating") || "Rescheduling..."
                : t("calendar.reschedule") || "Reschedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent dir={direction} className="max-w-md">
          <DialogHeader className={isRTL ? "text-right" : "text-left"}>
            <DialogTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <AlertCircle className="h-5 w-5 text-destructive" />
              {isRTL ? "خطأ" : "Error"}
            </DialogTitle>
            <DialogDescription className={isRTL ? "text-right" : "text-left"}>
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

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent dir={direction} className="max-w-md">
          <DialogHeader className={isRTL ? "text-right" : "text-left"}>
            <DialogTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              {isRTL ? "نجح" : "Success"}
            </DialogTitle>
            <DialogDescription className={isRTL ? "text-right" : "text-left"}>
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
    </div>
  );
}
