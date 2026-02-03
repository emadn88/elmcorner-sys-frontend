"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Clock,
    User,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    CalendarClock,
    GraduationCap,
    Download,
    FileSpreadsheet,
    FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClassInstance } from "@/lib/api/types";
import { ClassService } from "@/lib/services/class.service";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format, startOfToday, parseISO, addDays, subDays, startOfWeek, endOfWeek } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

// Generate time slots for 24 hours in 1-hour intervals  
const generateTimeSlots = () => {
    const slots: { hour24: number; label: string; period: "AM" | "PM" }[] = [];
    for (let hour = 0; hour < 24; hour++) {
        const hour12 = hour % 12 || 12;
        const period = hour < 12 ? "AM" : "PM";
        slots.push({
            hour24: hour,
            label: `${hour12}:00`,
            period,
        });
    }
    return slots;
};

const TIME_SLOTS = generateTimeSlots();

export default function CalendyPage() {
    const { t, direction, language } = useLanguage();
    const [selectedDate, setSelectedDate] = useState(startOfToday());
    const [classes, setClasses] = useState<ClassInstance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isExporting, setIsExporting] = useState(false);
    const dateLocale = language === "ar" ? ar : enUS;

    // Update current time every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    // Fetch classes for selected date
    const fetchClasses = async () => {
        try {
            setIsLoading(true);
            const dateStr = format(selectedDate, "yyyy-MM-dd");
            const response = await ClassService.getClasses({
                start_date: dateStr,
                end_date: dateStr,
                per_page: 1000,
            });

            // Filter active classes only
            const activeClasses = response.data.filter((classItem) => {
                if (classItem.timetable) {
                    return classItem.timetable.status === "active";
                }
                return true;
            });

            setClasses(activeClasses);
        } catch (err) {
            console.error("Failed to fetch classes:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, [selectedDate]);

    // Fetch classes for week
    const fetchWeekClasses = async () => {
        try {
            const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
            const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
            const response = await ClassService.getClasses({
                start_date: format(weekStart, "yyyy-MM-dd"),
                end_date: format(weekEnd, "yyyy-MM-dd"),
                per_page: 1000,
            });

            return response.data.filter((classItem) => {
                if (classItem.timetable) {
                    return classItem.timetable.status === "active";
                }
                return true;
            });
        } catch (err) {
            console.error("Failed to fetch week classes:", err);
            return [];
        }
    };

    // Navigate to previous/next day
    const goToPreviousDay = () => setSelectedDate(subDays(selectedDate, 1));
    const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1));
    const goToToday = () => setSelectedDate(startOfToday());

    // Get classes for a specific hour
    const getClassesForHour = (hour: number) => {
        return classes.filter((classItem) => {
            const startHour = parseInt(classItem.start_time.split(":")[0]);
            return startHour === hour;
        });
    };

    // Format time to 12-hour format
    const formatTime12Hour = (time24: string): string => {
        const [hours, minutes] = time24.substring(0, 5).split(":");
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    // Get status color
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

    // Get status label
    const getStatusLabel = (status: ClassInstance["status"]) => {
        switch (status) {
            case "attended":
                return language === "ar" ? "حضر" : "Attended";
            case "pending":
                return language === "ar" ? "قيد الانتظار" : "Pending";
            case "cancelled_by_student":
                return language === "ar" ? "ألغى الطالب" : "Cancelled (Student)";
            case "cancelled_by_teacher":
                return language === "ar" ? "ألغى المعلم" : "Cancelled (Teacher)";
            case "absent_student":
                return language === "ar" ? "غائب" : "Absent";
            default:
                return status;
        }
    };

    // Check if the time slot is the current hour
    const isCurrentHour = (hour: number) => {
        const today = format(new Date(), "yyyy-MM-dd");
        const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
        return today === selectedDateStr && currentTime.getHours() === hour;
    };

    // Export to Excel
    const exportToExcel = async (classesToExport: ClassInstance[], filename: string) => {
        try {
            setIsExporting(true);
            const data = classesToExport.map((classItem) => ({
                [t("calendar.date")]: format(parseISO(classItem.class_date), "yyyy-MM-dd", { locale: dateLocale }),
                [t("calendar.time")]: `${formatTime12Hour(classItem.start_time)} - ${formatTime12Hour(classItem.end_time)}`,
                [t("calendar.student")]: classItem.student?.full_name || "N/A",
                [t("calendar.teacher")]: (classItem.teacher as any)?.user?.name || "N/A",
                [t("calendar.course")]: classItem.course?.name || "N/A",
                [t("calendar.status")]: getStatusLabel(classItem.status),
                [language === "ar" ? "المدة (دقيقة)" : "Duration (min)"]: classItem.duration,
            }));

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, language === "ar" ? "الحصص" : "Classes");
            
            // Set column widths
            const colWidths = [
                { wch: 12 }, // Date
                { wch: 20 }, // Time
                { wch: 25 }, // Student
                { wch: 25 }, // Teacher
                { wch: 20 }, // Course
                { wch: 15 }, // Status
                { wch: 12 }, // Duration
            ];
            ws["!cols"] = colWidths;

            XLSX.writeFile(wb, `${filename}.xlsx`);
        } catch (err) {
            console.error("Failed to export to Excel:", err);
            alert(t("calendy.exportFailedExcel"));
        } finally {
            setIsExporting(false);
        }
    };

    // Export to PDF using Laravel backend
    const exportToPDF = async (startDate: string, endDate: string, filename: string) => {
        try {
            setIsExporting(true);
            const blob = await ClassService.downloadPdf({
                start_date: startDate,
                end_date: endDate,
            });
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${filename}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Failed to export to PDF:", err);
            alert(t("calendy.exportFailedPdf"));
        } finally {
            setIsExporting(false);
        }
    };

    // Export today's classes
    const handleExportToday = async (exportFormat: "excel" | "pdf") => {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const filename = `classes-today-${dateStr}`;
        if (exportFormat === "excel") {
            await exportToExcel(classes, filename);
        } else {
            await exportToPDF(dateStr, dateStr, filename);
        }
    };

    // Export week's classes
    const handleExportWeek = async (exportFormat: "excel" | "pdf") => {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
        const startDateStr = format(weekStart, "yyyy-MM-dd");
        const endDateStr = format(weekEnd, "yyyy-MM-dd");
        const filename = `classes-week-${startDateStr}-to-${endDateStr}`;
        if (exportFormat === "excel") {
            const weekClasses = await fetchWeekClasses();
            await exportToExcel(weekClasses, filename);
        } else {
            await exportToPDF(startDateStr, endDateStr, filename);
        }
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl blur-3xl" />
                <Card className="relative p-6 border-2 border-primary/20 bg-white/90 backdrop-blur-sm overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg"
                                >
                                    <CalendarClock className="h-6 w-6 text-white" />
                                </motion.div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                        {t("calendy.title")}
                                    </h1>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        {t("calendy.subtitle")}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Export Buttons */}
                            <div className="flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="gap-2 border-primary/20 hover:bg-primary/10"
                                            disabled={isExporting}
                                        >
                                            <Download className="h-4 w-4" />
                                            {t("calendy.exportToday")}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => handleExportToday("excel")}
                                            disabled={isExporting || classes.length === 0}
                                        >
                                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                                            {language === "ar" ? "Excel" : "Excel"}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleExportToday("pdf")}
                                            disabled={isExporting || classes.length === 0}
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            {language === "ar" ? "PDF" : "PDF"}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="default"
                                            className="gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                                            disabled={isExporting}
                                        >
                                            <Download className="h-4 w-4" />
                                            {t("calendy.exportWeek")}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => handleExportWeek("excel")}
                                            disabled={isExporting}
                                        >
                                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                                            {language === "ar" ? "Excel" : "Excel"}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleExportWeek("pdf")}
                                            disabled={isExporting}
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            {language === "ar" ? "PDF" : "PDF"}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Date Navigation */}
                        <div className="flex items-center gap-4 mt-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={goToPreviousDay}
                                className="rounded-lg hover:bg-primary/10 hover:border-primary/30 transition-all"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>

                            <div className="flex-1 flex items-center justify-center gap-4">
                                <Input
                                    type="date"
                                    value={format(selectedDate, "yyyy-MM-dd")}
                                    onChange={(e) => setSelectedDate(parseISO(e.target.value))}
                                    className="max-w-xs text-center font-semibold border-2 border-primary/20 focus:border-primary rounded-lg"
                                />
                                <Button
                                    variant="secondary"
                                    onClick={goToToday}
                                    className="rounded-lg bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 shadow-md"
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {t("calendy.today")}
                                </Button>
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={goToNextDay}
                                className="rounded-lg hover:bg-primary/10 hover:border-primary/30 transition-all"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Selected Date Display */}
                        <div className="mt-4 text-center">
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                {format(selectedDate, "EEEE, MMMM dd, yyyy", { locale: dateLocale })}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {classes.length}{" "}
                                {classes.length === 1 ? t("calendar.class") : t("calendar.classes")}{" "}
                                {t("calendy.classesScheduled")}
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Time Slots Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <LoadingSpinner />
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-1"
                >
                    {TIME_SLOTS.map((slot, index) => {
                        const hourClasses = getClassesForHour(slot.hour24);
                        const isCurrent = isCurrentHour(slot.hour24);

                        return (
                            <motion.div
                                key={slot.hour24}
                                initial={{ opacity: 0, x: direction === "rtl" ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.005 }}
                            >
                                <Card
                                    className={cn(
                                        "p-3 transition-all duration-300 hover:shadow-md border",
                                        isCurrent &&
                                        "border-2 border-primary bg-primary/5 shadow-md shadow-primary/20",
                                        hourClasses.length > 0 && "bg-gradient-to-r from-white to-primary/5"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Time Label */}
                                        <div className="w-20 flex-shrink-0">
                                            <div
                                                className={cn(
                                                    "text-center p-2 rounded-lg transition-all",
                                                    isCurrent
                                                        ? "bg-gradient-to-br from-primary to-secondary text-white shadow-md"
                                                        : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                                )}
                                            >
                                                <div className={cn("text-sm font-bold", isCurrent && "text-white")}>
                                                    {slot.label}
                                                </div>
                                                <div
                                                    className={cn(
                                                        "text-[10px] font-medium mt-0.5",
                                                        isCurrent ? "text-white/90" : "text-muted-foreground"
                                                    )}
                                                >
                                                    {slot.period}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Classes Container */}
                                        <div className="flex-1 min-w-0">
                                            {hourClasses.length === 0 ? (
                                                <div className="flex items-center justify-center h-full py-2">
                                                    <p className="text-xs text-muted-foreground italic">
                                                        {t("calendy.noClasses")}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {hourClasses.map((classItem) => (
                                                        <motion.div
                                                            key={classItem.id}
                                                            whileHover={{ scale: 1.02, y: -2 }}
                                                            transition={{ type: "spring", stiffness: 300 }}
                                                            className="inline-block"
                                                        >
                                                            <Card className="p-3 border hover:border-primary/30 transition-all bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg hover:shadow-primary/10 w-fit max-w-xs">
                                                                {/* Status Badge and Time */}
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`${getStatusColor(classItem.status)} text-[10px] font-semibold px-2 py-0.5`}
                                                                    >
                                                                        {getStatusLabel(classItem.status)}
                                                                    </Badge>
                                                                </div>

                                                                {/* Time Display - Prominent */}
                                                                <div className="mb-3 p-2 rounded-lg bg-primary/5 border border-primary/20">
                                                                    <div className="flex items-center gap-1.5 mb-1">
                                                                        <Clock className="h-3.5 w-3.5 text-primary" />
                                                                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                                                            {formatTime12Hour(classItem.start_time)} - {formatTime12Hour(classItem.end_time)}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Student Info */}
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div className="p-1.5 rounded bg-primary/10">
                                                                        <User className="h-3.5 w-3.5 text-primary" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                                            {classItem.student?.full_name || (language === "ar" ? "طالب غير معروف" : "Unknown Student")}
                                                                        </p>
                                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                                            {formatTime12Hour(classItem.start_time)} - {formatTime12Hour(classItem.end_time)}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Teacher Info - More Prominent */}
                                                                {classItem.teacher && (
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <div className="p-1.5 rounded bg-accent/10">
                                                                            <GraduationCap className="h-3.5 w-3.5 text-accent" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                                                {(classItem.teacher as any)?.user?.name ||
                                                                                    (language === "ar" ? `المعلم ${classItem.teacher.id}` : `Teacher ${classItem.teacher.id}`)}
                                                                            </p>
                                                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                                                {formatTime12Hour(classItem.start_time)} - {formatTime12Hour(classItem.end_time)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Course Info */}
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div className="p-1.5 rounded bg-secondary/10">
                                                                        <BookOpen className="h-3.5 w-3.5 text-secondary" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-[10px] text-gray-600 dark:text-gray-300 truncate">
                                                                            {classItem.course?.name || (language === "ar" ? "لا توجد دورة" : "No Course")}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Duration */}
                                                                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                                                                        <Clock className="h-3 w-3" />
                                                                        <span>{classItem.duration} {language === "ar" ? "دقيقة" : "min"}</span>
                                                                    </div>
                                                                </div>
                                                            </Card>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && classes.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                >
                    <Card className="p-12 border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gradient-to-br from-primary/5 to-secondary/5">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="inline-block mb-6"
                        >
                            <CalendarClock className="h-20 w-20 text-primary/40" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">
                            {t("calendy.noClassesScheduled")}
                        </h3>
                        <p className="text-muted-foreground">
                            {t("calendy.noClassesScheduledFor")}{" "}
                            {format(selectedDate, "MMMM dd, yyyy", { locale: dateLocale })}
                        </p>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
