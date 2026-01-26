"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, List, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useLanguage } from "@/contexts/language-context";
import { TeacherService } from "@/lib/services/teacher.service";
import { ScheduleService, WeeklyScheduleResponse } from "@/lib/services/schedule.service";
import { Teacher } from "@/types/teachers";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, parseISO } from "date-fns";
import { WeeklyCalendarView } from "@/components/teacher-schedule/weekly-calendar-view";
import { WeeklyListView } from "@/components/teacher-schedule/weekly-list-view";

type ViewMode = "calendar" | "list";

export default function TeacherSchedulePage() {
  const { t, direction } = useLanguage();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [schedule, setSchedule] = useState<WeeklyScheduleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [teacherSearch, setTeacherSearch] = useState("");
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setIsLoadingTeachers(true);
        const response = await TeacherService.getTeachers({ per_page: 100 });
        setTeachers(response.data);
      } catch (err) {
        console.error("Failed to fetch teachers:", err);
      } finally {
        setIsLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, []);

  // Fetch schedule when teacher or week changes
  useEffect(() => {
    if (selectedTeacherId) {
      fetchSchedule();
    }
  }, [selectedTeacherId, weekStart]);

  const fetchSchedule = async () => {
    if (!selectedTeacherId) return;

    try {
      setIsLoading(true);
      const weekStartStr = format(weekStart, "yyyy-MM-dd");
      const data = await ScheduleService.getTeacherWeeklySchedule(
        selectedTeacherId,
        weekStartStr
      );
      setSchedule(data);
      
      // Update selected teacher info
      const teacher = teachers.find((t) => t.id === selectedTeacherId);
      if (teacher) {
        setSelectedTeacher(teacher);
      }
    } catch (err) {
      console.error("Failed to fetch schedule:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    setWeekStart(subWeeks(weekStart, 1));
  };

  const handleNextWeek = () => {
    setWeekStart(addWeeks(weekStart, 1));
  };

  const handleCurrentWeek = () => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
  };

  const handleTeacherSelect = (teacherId: number) => {
    setSelectedTeacherId(teacherId);
    setTeacherSearch("");
    setShowTeacherDropdown(false);
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const searchLower = teacherSearch.toLowerCase();
    const name = teacher.user?.name?.toLowerCase() || "";
    const email = teacher.user?.email?.toLowerCase() || "";
    return name.includes(searchLower) || email.includes(searchLower);
  });

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
  const weekRange = `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;

  return (
    <div className={`flex flex-col gap-6 ${direction === "rtl" ? "text-right" : "text-left"}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("schedule.title") || "Teacher Schedule"}
          </h1>
          <p className="text-gray-600 mt-2">
            {t("schedule.description") || "View teacher availability and scheduled classes"}
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Teacher Selector */}
            <div className="flex-1 relative w-full md:w-auto">
              <Label className="text-sm font-medium mb-2 block">
                {t("schedule.selectTeacher") || "Select Teacher"}
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("schedule.searchTeacher") || "Search teacher..."}
                  value={teacherSearch}
                  onChange={(e) => {
                    setTeacherSearch(e.target.value);
                    setShowTeacherDropdown(true);
                  }}
                  onFocus={() => setShowTeacherDropdown(true)}
                  className="pl-9"
                />
                {selectedTeacher && (
                  <div className="mt-2 text-sm text-gray-600">
                    {t("schedule.selectedTeacher") || "Selected"}: {selectedTeacher.user?.name}
                  </div>
                )}
                {showTeacherDropdown && filteredTeachers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredTeachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        onClick={() => handleTeacherSelect(teacher.id)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        <span>{teacher.user?.name}</span>
                        {teacher.user?.email && (
                          <span className="text-sm text-gray-500">({teacher.user.email})</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Week Navigation */}
            {selectedTeacherId && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousWeek}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("common.previous") || "Previous"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCurrentWeek}
                >
                  {t("schedule.currentWeek") || "Current Week"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextWeek}
                  className="flex items-center gap-1"
                >
                  {t("common.next") || "Next"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="px-4 py-2 text-sm font-medium">
                  {weekRange}
                </div>
              </div>
            )}

            {/* View Mode Toggle */}
            {selectedTeacherId && (
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "calendar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className="flex items-center gap-1"
                >
                  <Calendar className="h-4 w-4" />
                  {t("schedule.calendarView") || "Calendar"}
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="flex items-center gap-1"
                >
                  <List className="h-4 w-4" />
                  {t("schedule.listView") || "List"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Display */}
      {isLoadingTeachers ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      ) : !selectedTeacherId ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {t("schedule.selectTeacherPrompt") || "Please select a teacher to view their schedule"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      ) : schedule ? (
        <>
          {viewMode === "calendar" ? (
            <WeeklyCalendarView
              schedule={schedule}
              weekStart={weekStart}
              onRefresh={fetchSchedule}
            />
          ) : (
            <WeeklyListView
              schedule={schedule}
              weekStart={weekStart}
              onRefresh={fetchSchedule}
            />
          )}
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-gray-600">
                {t("schedule.noSchedule") || "No schedule data available"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
