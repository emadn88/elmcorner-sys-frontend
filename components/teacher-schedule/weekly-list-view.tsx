"use client";

import { useState } from "react";
import { Plus, Clock, User, BookOpen, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context";
import { WeeklyScheduleResponse } from "@/lib/services/schedule.service";
import { format, parseISO, addDays } from "date-fns";
import { AddTrialFromSchedule } from "./add-trial-from-schedule";

interface WeeklyListViewProps {
  schedule: WeeklyScheduleResponse;
  weekStart: Date;
  onRefresh: () => void;
}

const DAYS = [
  { value: 1, label: "Sunday" },
  { value: 2, label: "Monday" },
  { value: 3, label: "Tuesday" },
  { value: 4, label: "Wednesday" },
  { value: 5, label: "Thursday" },
  { value: 6, label: "Friday" },
  { value: 7, label: "Saturday" },
];

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export function WeeklyListView({
  schedule,
  weekStart,
  onRefresh,
}: WeeklyListViewProps) {
  const { t, direction } = useLanguage();
  const [selectedSlot, setSelectedSlot] = useState<{
    day: number;
    date: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);

  const handleAddTrial = (day: number, date: string, startTime: string, endTime: string) => {
    setSelectedSlot({ day, date, startTime, endTime });
    setIsTrialModalOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {t("schedule.weeklyList") || "Weekly List"} - {schedule.teacher.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {DAYS.map((day) => {
              const dayData = schedule.schedule.find((d) => d.day_of_week === day.value);
              if (!dayData) return null;

              const date = parseISO(dayData.date);
              const hasContent =
                dayData.availability.length > 0 ||
                dayData.classes.length > 0 ||
                dayData.trials.length > 0;

              if (!hasContent) return null;

              return (
                <div key={day.value} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{day.label}</h3>
                      <p className="text-sm text-gray-500">{format(date, "MMMM d, yyyy")}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Availability Slots */}
                    {dayData.availability.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {t("schedule.availability") || "Availability"}
                        </h4>
                        <div className="space-y-2">
                          {dayData.availability.map((avail) => (
                            <div
                              key={avail.id}
                              className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-sm font-medium">
                                  {formatTime(avail.start_time)} - {formatTime(avail.end_time)}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleAddTrial(
                                    day.value,
                                    dayData.date,
                                    avail.start_time,
                                    avail.end_time
                                  )
                                }
                                className="flex items-center gap-1"
                              >
                                <Plus className="h-3 w-3" />
                                {t("schedule.addTrial") || "Add Trial"}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Classes */}
                    {dayData.classes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          {t("schedule.classes") || "Classes"}
                        </h4>
                        <div className="space-y-2">
                          {dayData.classes.map((cls) => (
                            <div
                              key={cls.id}
                              className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <User className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium">{cls.student?.full_name || "Student"}</span>
                                </div>
                                <div className="text-sm text-gray-600 ml-6">
                                  {cls.course?.name || "Course"} • {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                                </div>
                                {cls.status && (
                                  <Badge variant="outline" className="mt-1 ml-6">
                                    {cls.status}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trials */}
                    {dayData.trials.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {t("schedule.trials") || "Trials"}
                        </h4>
                        <div className="space-y-2">
                          {dayData.trials.map((trial) => (
                            <div
                              key={trial.id}
                              className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <User className="h-4 w-4 text-yellow-600" />
                                  <span className="font-medium">{trial.student?.full_name || "Student"}</span>
                                </div>
                                <div className="text-sm text-gray-600 ml-6">
                                  {trial.course?.name || "Course"} • {formatTime(trial.start_time)} - {formatTime(trial.end_time)}
                                </div>
                                {trial.status && (
                                  <Badge variant="outline" className="mt-1 ml-6">
                                    {trial.status}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedSlot && (
        <AddTrialFromSchedule
          open={isTrialModalOpen}
          onOpenChange={setIsTrialModalOpen}
          teacherId={schedule.teacher.id}
          date={selectedSlot.date}
          time={selectedSlot.startTime}
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
