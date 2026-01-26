"use client";

import { useState } from "react";
import { Plus, Clock, User, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context";
import { WeeklyScheduleResponse } from "@/lib/services/schedule.service";
import { format, parseISO, addDays } from "date-fns";
import { AddTrialFromSchedule } from "./add-trial-from-schedule";

interface WeeklyCalendarViewProps {
  schedule: WeeklyScheduleResponse;
  weekStart: Date;
  onRefresh: () => void;
}

const DAYS = [
  { value: 1, label: "Sun", fullLabel: "Sunday" },
  { value: 2, label: "Mon", fullLabel: "Monday" },
  { value: 3, label: "Tue", fullLabel: "Tuesday" },
  { value: 4, label: "Wed", fullLabel: "Wednesday" },
  { value: 5, label: "Thu", fullLabel: "Thursday" },
  { value: 6, label: "Fri", fullLabel: "Friday" },
  { value: 7, label: "Sat", fullLabel: "Saturday" },
];

// Generate time slots from 8 AM to 10 PM
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 22; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour < 22) {
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const isTimeInRange = (time: string, start: string, end: string) => {
  const [timeH, timeM] = time.split(":").map(Number);
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  
  const timeMinutes = timeH * 60 + timeM;
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  
  return timeMinutes >= startMinutes && timeMinutes < endMinutes;
};

export function WeeklyCalendarView({
  schedule,
  weekStart,
  onRefresh,
}: WeeklyCalendarViewProps) {
  const { t, direction } = useLanguage();
  const [selectedSlot, setSelectedSlot] = useState<{
    day: number;
    date: string;
    time: string;
  } | null>(null);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);

  const handleSlotClick = (day: number, date: string, time: string) => {
    const dayData = schedule.schedule.find((d) => d.day_of_week === day);
    if (!dayData) return;

    // Check if time is in an availability slot
    const isAvailable = dayData.availability.some((avail) =>
      isTimeInRange(time, avail.start_time, avail.end_time)
    );

    // Check if time is already booked
    const isBooked =
      dayData.classes.some((cls) => isTimeInRange(time, cls.start_time, cls.end_time)) ||
      dayData.trials.some((trial) => isTimeInRange(time, trial.start_time, trial.end_time));

    if (isAvailable && !isBooked) {
      setSelectedSlot({ day, date, time });
      setIsTrialModalOpen(true);
    }
  };

  const getSlotStatus = (day: number, time: string) => {
    const dayData = schedule.schedule.find((d) => d.day_of_week === day);
    if (!dayData) return "empty";

    // Check if booked
    const isBooked =
      dayData.classes.some((cls) => isTimeInRange(time, cls.start_time, cls.end_time)) ||
      dayData.trials.some((trial) => isTimeInRange(time, trial.start_time, trial.end_time));

    if (isBooked) return "booked";

    // Check if available
    const isAvailable = dayData.availability.some((avail) =>
      isTimeInRange(time, avail.start_time, avail.end_time)
    );

    if (isAvailable) return "available";

    return "empty";
  };

  const getSlotContent = (day: number, time: string) => {
    const dayData = schedule.schedule.find((d) => d.day_of_week === day);
    if (!dayData) return null;

    // Find class at this time
    const classAtTime = dayData.classes.find((cls) =>
      isTimeInRange(time, cls.start_time, cls.end_time)
    );

    if (classAtTime) {
      return (
        <div className="text-xs p-1 bg-blue-100 text-blue-800 rounded">
          <div className="font-medium">{classAtTime.student?.full_name || "Class"}</div>
          <div className="text-[10px]">{classAtTime.course?.name || ""}</div>
        </div>
      );
    }

    // Find trial at this time
    const trialAtTime = dayData.trials.find((trial) =>
      isTimeInRange(time, trial.start_time, trial.end_time)
    );

    if (trialAtTime) {
      return (
        <div className="text-xs p-1 bg-yellow-100 text-yellow-800 rounded">
          <div className="font-medium">{trialAtTime.student?.full_name || "Trial"}</div>
          <div className="text-[10px]">{trialAtTime.course?.name || ""}</div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {t("schedule.weeklyCalendar") || "Weekly Calendar"} - {schedule.teacher.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Day Headers */}
              <div className="grid grid-cols-8 border-b">
                <div className="p-2 font-medium text-sm text-gray-600"></div>
                {DAYS.map((day) => {
                  const dayData = schedule.schedule.find((d) => d.day_of_week === day.value);
                  const date = dayData ? parseISO(dayData.date) : addDays(weekStart, day.value - 1);
                  return (
                    <div key={day.value} className="p-2 text-center border-l">
                      <div className="font-medium text-sm">{day.label}</div>
                      <div className="text-xs text-gray-500">{format(date, "MMM d")}</div>
                    </div>
                  );
                })}
              </div>

              {/* Time Slots */}
              <div className="max-h-[600px] overflow-y-auto">
                {TIME_SLOTS.map((time) => (
                  <div key={time} className="grid grid-cols-8 border-b">
                    <div className="p-2 text-xs text-gray-500 border-r">
                      {formatTime(time)}
                    </div>
                    {DAYS.map((day) => {
                      const status = getSlotStatus(day.value, time);
                      const content = getSlotContent(day.value, time);
                      const dayData = schedule.schedule.find((d) => d.day_of_week === day.value);
                      const date = dayData?.date || "";

                      return (
                        <div
                          key={`${day.value}-${time}`}
                          className={`p-1 border-l min-h-[40px] cursor-pointer transition-colors ${
                            status === "available"
                              ? "bg-green-50 hover:bg-green-100"
                              : status === "booked"
                              ? "bg-gray-100"
                              : "bg-white"
                          }`}
                          onClick={() => handleSlotClick(day.value, date, time)}
                          title={
                            status === "available"
                              ? t("schedule.clickToAddTrial") || "Click to add trial"
                              : status === "booked"
                              ? t("schedule.timeBooked") || "Time is booked"
                              : ""
                          }
                        >
                          {content}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
              <span>{t("schedule.available") || "Available"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 rounded"></div>
              <span>{t("schedule.class") || "Class"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 rounded"></div>
              <span>{t("schedule.trial") || "Trial"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 rounded"></div>
              <span>{t("schedule.booked") || "Booked"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedSlot && (
        <AddTrialFromSchedule
          open={isTrialModalOpen}
          onOpenChange={setIsTrialModalOpen}
          teacherId={schedule.teacher.id}
          date={selectedSlot.date}
          time={selectedSlot.time}
          onSuccess={() => {
            setIsTrialModalOpen(false);
            setSelectedSlot(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
