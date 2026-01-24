"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  TrendingUp,
  MoreVertical,
  Edit,
  Trash2,
  CalendarClock,
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
  DropdownMenuSeparator,
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
import { ClassInstance, ClassFilters, Student, Teacher } from "@/lib/api/types";
import { ClassService, UpdateClassStatusRequest, UpdateClassRequest } from "@/lib/services/class.service";
import { StudentService } from "@/lib/services/student.service";
import { TeacherService } from "@/lib/services/teacher.service";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format, startOfToday, parseISO } from "date-fns";
import { Search } from "lucide-react";

interface ClassStats {
  total: number;
  pending: number;
  attended: number;
  cancelled: number;
  absent: number;
}

export default function ClassesPage() {
  const { t, direction } = useLanguage();
  const [classes, setClasses] = useState<ClassInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ClassStats>({
    total: 0,
    pending: 0,
    attended: 0,
    cancelled: 0,
    absent: 0,
  });

  // Filters
  const [filters, setFilters] = useState<ClassFilters>({
    start_date: format(startOfToday(), "yyyy-MM-dd"),
    end_date: format(startOfToday(), "yyyy-MM-dd"),
    student_id: undefined,
    teacher_id: undefined,
    status: undefined,
  });

  // Options for filters
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  
  // Searchable dropdowns state
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedTeacherName, setSelectedTeacherName] = useState("");

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

  // Fetch classes
  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const response = await ClassService.getClasses({
        ...filters,
        per_page: 1000,
      });
      
      // Filter out classes from paused or stopped timetables
      const activeClasses = response.data.filter((classItem) => {
        // If class has a timetable, only show if timetable is active
        if (classItem.timetable) {
          return classItem.timetable.status === "active";
        }
        // If no timetable, show the class (might be manually created)
        return true;
      });
      
      setClasses(activeClasses);
      calculateStats(activeClasses);
    } catch (err: any) {
      console.error("Failed to fetch classes:", err);
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
      
      // Set selected names if filters are already set
      if (filters.student_id) {
        const student = studentsRes.data.find(s => s.id === filters.student_id);
        if (student) setSelectedStudentName(student.full_name);
      }
      if (filters.teacher_id) {
        const teacher = teachersRes.data.find(t => t.id === filters.teacher_id);
        if (teacher) {
          const teacherName = (teacher as any).user?.name || (teacher as any).full_name || `Teacher ${teacher.id}`;
          setSelectedTeacherName(teacherName);
        }
      }
    } catch (err) {
      console.error("Failed to load filter options:", err);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // Convert 24-hour time to 12-hour AM/PM format
  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.substring(0, 5).split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Filter students based on search
  const filteredStudents = students.filter((student) =>
    student.full_name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Filter teachers based on search
  const filteredTeachers = teachers.filter((teacher) => {
    const teacherName =
      (teacher as any).user?.name ||
      (teacher as any).full_name ||
      `Teacher ${teacher.id}`;
    return teacherName.toLowerCase().includes(teacherSearch.toLowerCase());
  });

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
        updateData.cancellation_reason = cancellationReason;
      }

      await ClassService.updateClassStatus(selectedClass.id, updateData);
      await fetchClasses();
      setIsStatusModalOpen(false);
      setSelectedClass(null);
      setCancellationReason("");
    } catch (err: any) {
      alert(err.message || "Failed to update class status");
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
    // Set initial values from the class
    setRescheduleDate(format(parseISO(classItem.class_date), "yyyy-MM-dd"));
    
    // Extract time from start_time and end_time (handle both HH:mm and HH:mm:ss formats)
    const startTime = classItem.start_time.substring(0, 5);
    const endTime = classItem.end_time.substring(0, 5);
    
    setRescheduleStartTime(startTime);
    setRescheduleEndTime(endTime);
    setIsRescheduleModalOpen(true);
  };

  const handleReschedule = async () => {
    if (!selectedClass || !rescheduleDate || !rescheduleStartTime || !rescheduleEndTime) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate that end time is after start time
    if (rescheduleStartTime >= rescheduleEndTime) {
      alert("End time must be after start time");
      return;
    }

    try {
      setIsRescheduling(true);
      const updateData: UpdateClassRequest = {
        class_date: rescheduleDate,
        start_time: rescheduleStartTime, // HH:mm format
        end_time: rescheduleEndTime, // HH:mm format
      };

      await ClassService.updateClass(selectedClass.id, updateData);
      await fetchClasses();
      setIsRescheduleModalOpen(false);
      setSelectedClass(null);
      setRescheduleDate("");
      setRescheduleStartTime("");
      setRescheduleEndTime("");
    } catch (err: any) {
      alert(err.message || "Failed to reschedule class");
    } finally {
      setIsRescheduling(false);
    }
  };

  const getStatusColor = (status: ClassInstance["status"]) => {
    switch (status) {
      case "attended":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
      case "cancelled_by_student":
      case "cancelled_by_teacher":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      case "absent_student":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: ClassInstance["status"]) => {
    switch (status) {
      case "attended":
        return <CheckCircle2 className="h-4 w-4" />;
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      case "cancelled_by_student":
      case "cancelled_by_teacher":
        return <XCircle className="h-4 w-4" />;
      case "absent_student":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
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
    setFilters({
      start_date: format(startOfToday(), "yyyy-MM-dd"),
      end_date: format(startOfToday(), "yyyy-MM-dd"),
      student_id: undefined,
      teacher_id: undefined,
      status: undefined,
    });
    setSelectedStudentName("");
    setSelectedTeacherName("");
    setStudentSearch("");
    setTeacherSearch("");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowStudentDropdown(false);
        setShowTeacherDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("calendar.classes") || "Classes"}
          </h1>
          <p className="text-muted-foreground mt-1.5">
            {t("calendar.description") || "View and manage all classes"}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("calendar.classes") || "Total Classes"}
              </p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10">
              <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("calendar.pending") || "Pending"}
              </p>
              <p className="text-2xl font-bold mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("calendar.attended") || "Attended"}
              </p>
              <p className="text-2xl font-bold mt-1">{stats.attended}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("calendar.cancelledByStudent") || "Cancelled"}
              </p>
              <p className="text-2xl font-bold mt-1">{stats.cancelled}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("calendar.absentStudent") || "Absent"}
              </p>
              <p className="text-2xl font-bold mt-1">{stats.absent}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-500/10">
              <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">
              {t("calendar.filters") || "Filters"}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            {t("calendar.filter.clearAll") || "Clear All"}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2">
            <Label>{t("timetables.fromDate") || "From Date"}</Label>
            <Input
              type="date"
              value={filters.start_date || ""}
              onChange={(e) =>
                setFilters({ ...filters, start_date: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>{t("timetables.toDate") || "To Date"}</Label>
            <Input
              type="date"
              value={filters.end_date || ""}
              onChange={(e) =>
                setFilters({ ...filters, end_date: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>{t("calendar.filter.student") || "Student"}</Label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("calendar.filter.allStudents") || "All Students"}
                  value={selectedStudentName || studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setShowStudentDropdown(true);
                    if (!e.target.value) {
                      setSelectedStudentName("");
                      setFilters({ ...filters, student_id: undefined });
                    }
                  }}
                  onFocus={() => setShowStudentDropdown(true)}
                  className="pl-9"
                />
                {selectedStudentName && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={() => {
                      setSelectedStudentName("");
                      setStudentSearch("");
                      setFilters({ ...filters, student_id: undefined });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {showStudentDropdown && (studentSearch || !selectedStudentName) && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                  <div
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b"
                    onClick={() => {
                      setSelectedStudentName("");
                      setStudentSearch("");
                      setFilters({ ...filters, student_id: undefined });
                      setShowStudentDropdown(false);
                    }}
                  >
                    {t("calendar.filter.allStudents") || "All Students"}
                  </div>
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        setSelectedStudentName(student.full_name);
                        setStudentSearch("");
                        setFilters({ ...filters, student_id: student.id });
                        setShowStudentDropdown(false);
                      }}
                    >
                      {student.full_name}
                    </div>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      No students found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("calendar.filter.teacher") || "Teacher"}</Label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("calendar.filter.allTeachers") || "All Teachers"}
                  value={selectedTeacherName || teacherSearch}
                  onChange={(e) => {
                    setTeacherSearch(e.target.value);
                    setShowTeacherDropdown(true);
                    if (!e.target.value) {
                      setSelectedTeacherName("");
                      setFilters({ ...filters, teacher_id: undefined });
                    }
                  }}
                  onFocus={() => setShowTeacherDropdown(true)}
                  className="pl-9"
                />
                {selectedTeacherName && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={() => {
                      setSelectedTeacherName("");
                      setTeacherSearch("");
                      setFilters({ ...filters, teacher_id: undefined });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {showTeacherDropdown && (teacherSearch || !selectedTeacherName) && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                  <div
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b"
                    onClick={() => {
                      setSelectedTeacherName("");
                      setTeacherSearch("");
                      setFilters({ ...filters, teacher_id: undefined });
                      setShowTeacherDropdown(false);
                    }}
                  >
                    {t("calendar.filter.allTeachers") || "All Teachers"}
                  </div>
                  {filteredTeachers.map((teacher) => {
                    const teacherName =
                      (teacher as any).user?.name ||
                      (teacher as any).full_name ||
                      `Teacher ${teacher.id}`;
                    return (
                      <div
                        key={teacher.id}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          setSelectedTeacherName(teacherName);
                          setTeacherSearch("");
                          setFilters({ ...filters, teacher_id: teacher.id });
                          setShowTeacherDropdown(false);
                        }}
                      >
                        {teacherName}
                      </div>
                    );
                  })}
                  {filteredTeachers.length === 0 && (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      No teachers found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("calendar.status") || "Status"}</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  status: value === "all" ? undefined : (value as any),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("calendar.allStatuses") || "All Statuses"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("calendar.allStatuses") || "All Statuses"}
                </SelectItem>
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
        </div>
      </Card>

      {/* Classes List */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classItem) => (
            <motion.div
              key={classItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary/20">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(classItem.status)} font-medium flex items-center gap-1`}
                      >
                        {getStatusIcon(classItem.status)}
                        {getStatusLabel(classItem.status)}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
                      {classItem.student?.full_name || "Student"}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {classItem.course?.name || "Course"}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openRescheduleModal(classItem)}>
                        <CalendarClock className="h-4 w-4 mr-2" />
                        {t("calendar.reschedule") || "Reschedule"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openStatusModal(classItem)}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t("calendar.updateStatus") || "Update Status"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  {/* Date & Time */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-md bg-blue-500/10">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">
                        {t("calendar.date") || "Date"}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {format(parseISO(classItem.class_date), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-md bg-purple-500/10">
                      <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">
                        {t("calendar.time") || "Time"}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {formatTime12Hour(classItem.start_time)} -{" "}
                        {formatTime12Hour(classItem.end_time)}
                      </p>
                    </div>
                  </div>

                  {/* Teacher */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-md bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">
                        {t("calendar.teacher") || "Teacher"}
                      </p>
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {classItem.teacher?.user?.name || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {classItem.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {t("calendar.notes") || "Notes"}
                      </p>
                      <p className="text-xs text-foreground line-clamp-2">
                        {classItem.notes}
                      </p>
                    </div>
                  )}

                  {/* Cancellation Reason */}
                  {classItem.cancellation_reason && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {t("calendar.cancellationReason") || "Cancellation Reason"}
                      </p>
                      <p className="text-xs text-foreground line-clamp-2">
                        {classItem.cancellation_reason}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}

          {classes.length === 0 && (
            <div className="col-span-full">
              <Card className="p-12 text-center border-dashed">
                <div className="flex flex-col items-center justify-center">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t("calendar.classes") || "No classes found"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No classes match your current filters
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Status Update Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent dir={direction}>
          <DialogHeader>
            <DialogTitle>
              {t("calendar.updateStatus") || "Update Class Status"}
            </DialogTitle>
            <DialogDescription>
              {t("calendar.viewAndManage") || "Update the status of this class"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("calendar.status") || "Status"}</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as ClassInstance["status"])}
              >
                <SelectTrigger>
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
                <Label>
                  {t("calendar.cancellationReason") || "Cancellation Reason"}
                </Label>
                <Textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder={
                    t("calendar.enterCancellationReason") ||
                    "Enter cancellation reason..."
                  }
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusModalOpen(false)}
            >
              {t("common.cancel") || "Cancel"}
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
          <DialogHeader>
            <DialogTitle>
              {t("calendar.reschedule") || "Reschedule Class"}
            </DialogTitle>
            <DialogDescription>
              {t("calendar.rescheduleDescription") || "Change the date and time for this class"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("calendar.date") || "Date"} *</Label>
              <Input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("calendar.time") || "Start Time"} *</Label>
                <Input
                  type="time"
                  value={rescheduleStartTime}
                  onChange={(e) => setRescheduleStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t("calendar.time") || "End Time"} *</Label>
                <Input
                  type="time"
                  value={rescheduleEndTime}
                  onChange={(e) => setRescheduleEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {selectedClass && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-1">
                  {t("calendar.classDetails") || "Current Schedule"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(selectedClass.class_date), "MMM dd, yyyy")} •{" "}
                  {formatTime12Hour(selectedClass.start_time)} -{" "}
                  {formatTime12Hour(selectedClass.end_time)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
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
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button onClick={handleReschedule} disabled={isRescheduling}>
              {isRescheduling
                ? t("common.updating") || "Rescheduling..."
                : t("calendar.reschedule") || "Reschedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
