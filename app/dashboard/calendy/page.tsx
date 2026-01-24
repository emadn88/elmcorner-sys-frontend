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
    Users,
    GraduationCap,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ClassInstance } from "@/lib/api/types";
import { ClassService } from "@/lib/services/class.service";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format, startOfToday, parseISO, addDays, subDays } from "date-fns";
import { cn } from "@/lib/utils";

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
    const { t, direction } = useLanguage();
    const [selectedDate, setSelectedDate] = useState(startOfToday());
    const [classes, setClasses] = useState<ClassInstance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute
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
                return "Attended";
            case "pending":
                return "Pending";
            case "cancelled_by_student":
                return "Cancelled (Student)";
            case "cancelled_by_teacher":
                return "Cancelled (Teacher)";
            case "absent_student":
                return "Absent";
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

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl blur-3xl" />
                <Card className="relative p-5 border-2 border-purple-500/20 bg-white/80 backdrop-blur-sm overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="p-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50"
                                >
                                    <CalendarClock className="h-7 w-7 text-white" />
                                </motion.div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Calendy
                                    </h1>
                                    <p className="text-muted-foreground text-sm mt-0.5">
                                        Your daily schedule at a glance
                                    </p>
                                </div>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Sparkles className="h-7 w-7 text-purple-500 animate-pulse" />
                            </motion.div>
                        </div>

                        {/* Date Navigation */}
                        <div className="flex items-center gap-4 mt-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={goToPreviousDay}
                                className="rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>

                            <div className="flex-1 flex items-center justify-center gap-4">
                                <Input
                                    type="date"
                                    value={format(selectedDate, "yyyy-MM-dd")}
                                    onChange={(e) => setSelectedDate(parseISO(e.target.value))}
                                    className="max-w-xs text-center font-semibold border-2 border-purple-200 focus:border-purple-400 rounded-xl"
                                />
                                <Button
                                    variant="secondary"
                                    onClick={goToToday}
                                    className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30"
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Today
                                </Button>
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={goToNextDay}
                                className="rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Selected Date Display */}
                        <div className="mt-4 text-center">
                            <p className="text-xl font-bold text-gray-800">
                                {format(selectedDate, "EEEE, MMMM dd, yyyy")}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {classes.length} {classes.length === 1 ? "class" : "classes"}{" "}
                                scheduled
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
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.005 }}
                            >
                                <Card
                                    className={cn(
                                        "p-2 transition-all duration-300 hover:shadow-md",
                                        isCurrent &&
                                        "border-2 border-purple-500 bg-purple-50/50 shadow-md shadow-purple-500/20",
                                        hourClasses.length > 0 && "bg-gradient-to-r from-white to-purple-50/30"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Time Label */}
                                        <div className="w-20 flex-shrink-0">
                                            <div
                                                className={cn(
                                                    "text-center p-2 rounded-lg",
                                                    isCurrent
                                                        ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/50"
                                                        : "bg-gray-50 border border-gray-200"
                                                )}
                                            >
                                                <div className={cn("text-sm font-bold", isCurrent && "text-white")}>
                                                    {slot.label}
                                                </div>
                                                <div
                                                    className={cn(
                                                        "text-[10px] font-medium mt-0.5",
                                                        isCurrent ? "text-purple-100" : "text-muted-foreground"
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
                                                        No classes
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
                                                            <Card className="p-2.5 border hover:border-purple-300 transition-all bg-white shadow-sm hover:shadow-lg hover:shadow-purple-500/10 w-fit max-w-xs">
                                                                {/* Status Badge */}
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`${getStatusColor(classItem.status)} text-[10px] font-semibold px-1.5 py-0.5`}
                                                                    >
                                                                        {getStatusLabel(classItem.status)}
                                                                    </Badge>
                                                                    <div className="text-[10px] font-medium text-gray-500">
                                                                        {formatTime12Hour(classItem.start_time)} -{" "}
                                                                        {formatTime12Hour(classItem.end_time)}
                                                                    </div>
                                                                </div>

                                                                {/* Student Info */}
                                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                                    <div className="p-1 rounded bg-blue-500/10">
                                                                        <User className="h-3 w-3 text-blue-600" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-semibold text-gray-900 truncate">
                                                                            {classItem.student?.full_name || "Unknown Student"}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Course Info */}
                                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                                    <div className="p-1 rounded bg-green-500/10">
                                                                        <BookOpen className="h-3 w-3 text-green-600" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-[10px] text-gray-600 truncate">
                                                                            {classItem.course?.name || "No Course"}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Teacher Info */}
                                                                {classItem.teacher && (
                                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                                        <div className="p-1 rounded bg-purple-500/10">
                                                                            <GraduationCap className="h-3 w-3 text-purple-600" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-[10px] text-gray-500 truncate">
                                                                                {(classItem.teacher as any)?.user?.name ||
                                                                                    `Teacher ${classItem.teacher.id}`}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Duration */}
                                                                <div className="mt-2 pt-2 border-t border-gray-100">
                                                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                                                        <Clock className="h-2.5 w-2.5" />
                                                                        <span>{classItem.duration} min</span>
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
                    <Card className="p-12 border-2 border-dashed border-gray-300 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="inline-block mb-6"
                        >
                            <CalendarClock className="h-20 w-20 text-purple-300" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-gray-700 mb-2">
                            No Classes Scheduled
                        </h3>
                        <p className="text-muted-foreground">
                            There are no classes scheduled for{" "}
                            {format(selectedDate, "MMMM dd, yyyy")}
                        </p>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
