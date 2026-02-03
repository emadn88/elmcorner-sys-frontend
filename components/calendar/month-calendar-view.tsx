"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from "date-fns";
import { ClassInstance } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";

interface MonthCalendarViewProps {
  currentDate: Date;
  classes: ClassInstance[];
  onDateClick?: (date: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  isLoading?: boolean;
}

const WEEK_DAYS_EN = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

const WEEK_DAYS_AR = [
  "أحد",
  "إثنين",
  "ثلاثاء",
  "أربعاء",
  "خميس",
  "جمعة",
  "سبت",
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "attended":
      return "bg-green-500";
    case "pending":
      return "bg-blue-500";
    case "cancelled_by_teacher":
    case "cancelled_by_student":
      return "bg-red-500";
    case "absent_student":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
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

export function MonthCalendarView({
  currentDate,
  classes,
  onDateClick,
  onPreviousMonth,
  onNextMonth,
  onToday,
  isLoading = false,
}: MonthCalendarViewProps) {
  const { language, t } = useLanguage();
  
  const WEEK_DAYS = language === "ar" ? WEEK_DAYS_AR : WEEK_DAYS_EN;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const classesByDate = useMemo(() => {
    const map = new Map<string, ClassInstance[]>();
    classes.forEach((classItem) => {
      const dateKey = format(new Date(classItem.class_date), "yyyy-MM-dd");
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(classItem);
    });
    return map;
  }, [classes]);


  const getClassesForDate = (date: Date): ClassInstance[] => {
    const dateKey = format(date, "yyyy-MM-dd");
    return classesByDate.get(dateKey) || [];
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {WEEK_DAYS.map((day, index) => (
            <div
              key={index}
              className="p-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0"
            >
              <span className="hidden md:inline">{day}</span>
              <span className="md:hidden">{day[0]}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, dayIdx) => {
            const dayClasses = getClassesForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            const hasClasses = dayClasses.length > 0;

            return (
              <motion.div
                key={day.toString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: dayIdx * 0.01 }}
                className={cn(
                  "min-h-[100px] md:min-h-[120px] border-r border-b border-gray-200 p-2 transition-colors",
                  !isCurrentMonth && "bg-gray-50/50",
                  isCurrentDay && "bg-blue-50/30",
                  dayIdx % 7 === 6 && "border-r-0"
                )}
              >
                <div className="flex flex-col h-full">
                  {/* Date Number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isCurrentDay
                          ? "bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center"
                          : isCurrentMonth
                          ? "text-gray-900"
                          : "text-gray-400"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {dayClasses.length > 3 && (
                      <span className="text-xs text-gray-500 font-medium">
                        +{dayClasses.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Classes List */}
                  <div className="flex-1 space-y-1 overflow-hidden">
                    {dayClasses.slice(0, 3).map((classItem) => (
                      <motion.div
                        key={classItem.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          "text-xs px-2 py-1 rounded-md truncate",
                          getStatusColor(classItem.status),
                          "text-white font-medium"
                        )}
                        title={`${classItem.student?.full_name || t("teacher.unknownStudent") || "Unknown"} - ${classItem.start_time?.substring(0, 5)}`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="truncate">
                            {classItem.start_time?.substring(0, 5)}
                          </span>
                          <span className="truncate">
                            {classItem.student?.full_name || t("teacher.unknownStudent") || "Unknown"}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

    </>
  );
}
