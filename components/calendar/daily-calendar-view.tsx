"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  User, 
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon
} from "lucide-react";
import { format, isToday, isSameDay, parseISO } from "date-fns";
import { ClassInstance } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";

interface DailyCalendarViewProps {
  currentDate: Date;
  classes: ClassInstance[];
  onDateChange?: (date: Date) => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  isLoading?: boolean;
}

// Generate time slots from 6 AM to 11 PM in 30-minute intervals
const generateTimeSlots = () => {
  const slots: { hour24: number; minute: number; label: string }[] = [];
  for (let hour = 6; hour <= 23; hour++) {
    slots.push({ hour24: hour, minute: 0, label: `${hour.toString().padStart(2, "0")}:00` });
    if (hour < 23) {
      slots.push({ hour24: hour, minute: 30, label: `${hour.toString().padStart(2, "0")}:30` });
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const getStatusColor = (status: string) => {
  switch (status) {
    case "attended":
      return "bg-green-500 border-green-600";
    case "pending":
      return "bg-blue-500 border-blue-600";
    case "cancelled_by_teacher":
    case "cancelled_by_student":
      return "bg-red-500 border-red-600";
    case "absent_student":
      return "bg-orange-500 border-orange-600";
    default:
      return "bg-gray-500 border-gray-600";
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "attended":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "cancelled_by_teacher":
    case "cancelled_by_student":
      return "bg-red-100 text-red-800 border-red-200";
    case "absent_student":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const parseTime = (timeString: string): { hour: number; minute: number } => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hour: hours, minute: minutes || 0 };
};

const timeToPosition = (timeString: string): number => {
  const { hour, minute } = parseTime(timeString);
  const totalMinutes = hour * 60 + minute;
  const startMinutes = 6 * 60; // 6 AM
  const minutesFromStart = totalMinutes - startMinutes;
  return (minutesFromStart / 30) * 60; // 60px per 30-minute slot
};

const getDurationInSlots = (startTime: string, endTime: string): number => {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const startMinutes = start.hour * 60 + start.minute;
  const endMinutes = end.hour * 60 + end.minute;
  const duration = endMinutes - startMinutes;
  return Math.max((duration / 30) * 60, 60); // Minimum 60px height
};

export function DailyCalendarView({
  currentDate,
  classes,
  onDateChange,
  onPreviousDay,
  onNextDay,
  onToday,
  isLoading = false,
}: DailyCalendarViewProps) {
  const { language, t } = useLanguage();

  const dayClasses = useMemo(() => {
    return classes.filter((classItem) => {
      const classDate = parseISO(classItem.class_date);
      return isSameDay(classDate, currentDate);
    }).sort((a, b) => {
      const timeA = parseTime(a.start_time || "00:00");
      const timeB = parseTime(b.start_time || "00:00");
      return timeA.hour * 60 + timeA.minute - (timeB.hour * 60 + timeB.minute);
    });
  }, [classes, currentDate]);

  const formatTime = (timeString: string) => {
    const { hour, minute } = parseTime(timeString);
    const hour12 = hour % 12 || 12;
    const ampm = hour >= 12 ? (language === "ar" ? "م" : "PM") : (language === "ar" ? "ص" : "AM");
    return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  const formatTimeLabel = (slot: { hour24: number; minute: number; label: string }) => {
    const hour12 = slot.hour24 % 12 || 12;
    const ampm = slot.hour24 >= 12 ? (language === "ar" ? "م" : "PM") : (language === "ar" ? "ص" : "AM");
    return `${hour12}:${slot.minute === 0 ? "00" : "30"} ${ampm}`;
  };

  const isCurrentTimeSlot = (slot: { hour24: number; minute: number }) => {
    if (!isToday(currentDate)) return false;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    return slot.hour24 === currentHour && Math.floor(currentMinute / 30) === Math.floor(slot.minute / 30);
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Day Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  {format(currentDate, language === "ar" ? "EEEE، d MMMM yyyy" : "EEEE, MMMM d, yyyy")}
                </h2>
                {isToday(currentDate) && (
                  <Badge className="bg-blue-500 text-white">
                    {t("common.today") || "Today"}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPreviousDay}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("common.previous") || "Previous"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onToday}
              >
                {t("common.today") || "Today"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onNextDay}
                className="flex items-center gap-1"
              >
                {t("common.next") || "Next"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="relative">
          {/* Time Column and Grid */}
          <div className="flex">
            {/* Time Labels */}
            <div className="w-20 flex-shrink-0 border-r border-gray-200">
              {TIME_SLOTS.map((slot, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-[60px] border-b border-gray-100 flex items-start justify-end pr-2 pt-1",
                    slot.minute === 0 && "border-b-gray-300"
                  )}
                >
                  {slot.minute === 0 && (
                    <span className="text-xs font-medium text-gray-600">
                      {formatTimeLabel(slot)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Calendar Content */}
            <div className="flex-1 relative">
              {/* Time Grid Lines */}
              {TIME_SLOTS.map((slot, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-[60px] border-b border-gray-100",
                    slot.minute === 0 && "border-b-gray-300",
                    isCurrentTimeSlot(slot) && "border-b-blue-500 border-b-2"
                  )}
                />
              ))}

              {/* Current Time Indicator */}
              {isToday(currentDate) && (() => {
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                const position = timeToPosition(`${currentHour}:${currentMinute}`);
                if (position >= 0 && position <= TIME_SLOTS.length * 60) {
                  return (
                    <div
                      className="absolute left-0 right-0 z-10"
                      style={{ top: `${position}px` }}
                    >
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full -ml-1.5 border-2 border-white shadow-lg"></div>
                        <div className="h-0.5 bg-blue-500 flex-1"></div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Classes */}
              {dayClasses.map((classItem) => {
                const top = timeToPosition(classItem.start_time || "00:00");
                const height = getDurationInSlots(
                  classItem.start_time || "00:00",
                  classItem.end_time || "00:00"
                );

                return (
                  <motion.div
                    key={classItem.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "absolute left-2 right-2 rounded-lg border-2 shadow-md z-20",
                      getStatusColor(classItem.status)
                    )}
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      minHeight: "60px",
                    }}
                  >
                    <div className="p-3 h-full flex flex-col justify-between text-white">
                      <div>
                        <div className="font-semibold text-sm mb-1 truncate">
                          {classItem.student?.full_name || t("teacher.unknownStudent") || "Unknown Student"}
                        </div>
                        <div className="text-xs opacity-90 flex items-center gap-1 truncate">
                          <BookOpen className="h-3 w-3" />
                          {classItem.course?.name || t("teacher.unknownCourse") || "Unknown Course"}
                        </div>
                      </div>
                      <div className="text-xs opacity-80 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(classItem.start_time || "00:00")} - {formatTime(classItem.end_time || "00:00")}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Empty State */}
              {dayClasses.length === 0 && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      {t("teacher.noClassesScheduled") || "No classes scheduled for this day"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
