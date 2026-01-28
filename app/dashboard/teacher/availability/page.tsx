"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Plus, Search, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TeacherService } from "@/lib/services/teacher.service";
import { TeacherAvailability, ClassInstance, TrialClass } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const DAYS = [
  { value: 1, label: "Sunday", labelAr: "الأحد" },
  { value: 2, label: "Monday", labelAr: "الإثنين" },
  { value: 3, label: "Tuesday", labelAr: "الثلاثاء" },
  { value: 4, label: "Wednesday", labelAr: "الأربعاء" },
  { value: 5, label: "Thursday", labelAr: "الخميس" },
  { value: 6, label: "Friday", labelAr: "الجمعة" },
  { value: 7, label: "Saturday", labelAr: "السبت" },
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour24 = i;
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? "م" : "ص"; // PM = م, AM = ص
  return `${hour12}:00 ${ampm}`;
});

interface CalendarEvent {
  id: number;
  type: "class" | "trial";
  title: string;
  studentName: string;
  courseName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  data: ClassInstance | TrialClass;
}

export default function TeacherAvailabilityPage() {
  const { t, language } = useLanguage();
  const direction = "rtl"; // Force RTL
  
  // Direct Arabic translations as fallback
  const getText = (key: string): string => {
    const translation = t(key);
    // If translation returns the key itself, use direct Arabic mapping
    if (translation === key || !translation) {
      const arabicMap: Record<string, string> = {
        "teacher.availability": "التوفر",
        "teacher.availabilityDescription": "إدارة توفرك وعرض الأحداث المجدولة",
        "teacher.searchEvents": "البحث عن الأحداث بالطالب أو الدورة...",
        "teacher.weekView": "عرض الأسبوع",
        "teacher.today": "اليوم",
        "teacher.setAvailability": "تعيين التوفر",
        "teacher.dateFrom": "من تاريخ",
        "teacher.dateTo": "إلى تاريخ",
        "teacher.addTimeSlot": "إضافة وقت",
        "teacher.noAvailabilitySet": "لم يتم تعيين التوفر",
        "teacher.to": "إلى",
        "teacher.saveAvailability": "حفظ التوفر",
        "teacher.saving": "جاري الحفظ...",
        "teacher.classDetails": "تفاصيل الحصة",
        "teacher.trialDetails": "تفاصيل الحصة التجريبية",
        "teacher.status": "الحالة",
        "teacher.pending": "قيد الانتظار",
        "teacher.attended": "حضر",
        "teacher.absentStudent": "غائب الطالب",
        "teacher.apologyReason": "سبب الاعتذار (اختياري)",
        "teacher.apologyReasonPlaceholder": "أدخل سبب الإلغاء...",
        "teacher.sendApology": "إرسال اعتذار",
        "teacher.updateStatus": "تحديث الحالة",
        "teacher.cancel": "إلغاء",
        "teacher.student": "طالب",
        "teacher.course": "دورة",
        "teacher.failedToLoadData": "فشل تحميل البيانات",
        "teacher.failedToUpdateStatus": "فشل تحديث الحالة",
        "teacher.failedToSendApology": "فشل إرسال الاعتذار",
        "teacher.failedToUpdateAvailability": "فشل تحديث التوفر",
        "teacher.time": "الوقت",
        "teacher.fromTime": "من",
        "teacher.toTime": "إلى",
      };
      return arabicMap[key] || key;
    }
    return translation;
  };
  const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
  const [classes, setClasses] = useState<ClassInstance[]>([]);
  const [trials, setTrials] = useState<TrialClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [apologyReason, setApologyReason] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [isAvailabilityCollapsed, setIsAvailabilityCollapsed] = useState(false);
  
  // Date range for availability
  const [dateFrom, setDateFrom] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().split("T")[0];
  });
  
  // Current week view
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    const weekStart = new Date(today.setDate(diff));
    return weekStart;
  });

  useEffect(() => {
    fetchData();
  }, [currentWeekStart]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [availabilityData, classesResponse, trialsResponse] = await Promise.all([
        TeacherService.getAvailability(),
        TeacherService.getClasses({
          date_from: getWeekStartDate(),
          date_to: getWeekEndDate(),
        }),
        TeacherService.getTrials({
          date_from: getWeekStartDate(),
          date_to: getWeekEndDate(),
        }),
      ]);
      
      setAvailability(availabilityData);
      setClasses(classesResponse.classes || []);
      setTrials(trialsResponse.trials || []);
    } catch (err: any) {
      setError(err.message || getText("teacher.failedToLoadData"));
    } finally {
      setIsLoading(false);
    }
  };

  const getWeekStartDate = () => {
    return currentWeekStart.toISOString().split("T")[0];
  };

  const getWeekEndDate = () => {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return weekEnd.toISOString().split("T")[0];
  };

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = date.toISOString().split("T")[0];
    const events: CalendarEvent[] = [];

    // Add classes
    classes.forEach((cls) => {
      if (cls.class_date === dateStr) {
        events.push({
          id: cls.id,
          type: "class",
          title: `${cls.student?.full_name || getText("teacher.student")} - ${cls.course?.name || getText("teacher.course")}`,
          studentName: cls.student?.full_name || "",
          courseName: cls.course?.name || "",
          date: dateStr,
          startTime: cls.start_time,
          endTime: cls.end_time,
          status: cls.status,
          data: cls,
        });
      }
    });

    // Add trials
    trials.forEach((trial) => {
      if (trial.trial_date === dateStr) {
        events.push({
          id: trial.id,
          type: "trial",
          title: `${trial.student?.full_name || getText("teacher.student")} - ${trial.course?.name || getText("teacher.course")}`,
          studentName: trial.student?.full_name || "",
          courseName: trial.course?.name || "",
          date: dateStr,
          startTime: trial.start_time,
          endTime: trial.end_time,
          status: trial.status,
          data: trial,
        });
      }
    });

    return events.filter((event) =>
      searchTerm === "" ||
      event.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.courseName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const isTimeInAvailability = (dayOfWeek: number, time: string) => {
    return availability.some(
      (avail) =>
        avail.day_of_week === dayOfWeek &&
        avail.is_available &&
        time >= avail.start_time &&
        time < avail.end_time
    );
  };

  const getTimeSlotStatus = (dayOfWeek: number, date: Date, time: string) => {
    const events = getEventsForDate(date);
    const hasEvent = events.some(
      (event) => time >= event.startTime && time < event.endTime
    );
    
    if (hasEvent) return "booked";
    if (isTimeInAvailability(dayOfWeek, time)) return "available";
    return "empty";
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setNewStatus(event.status);
    setIsEventModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedEvent) return;
    
    try {
      setIsSaving(true);
      if (selectedEvent.type === "class") {
        await TeacherService.updateClassStatus(
          selectedEvent.id,
          newStatus as any
        );
      }
      // For trials, you might need a different endpoint
      await fetchData();
      setIsEventModalOpen(false);
      setSelectedEvent(null);
    } catch (err: any) {
      setError(err.message || getText("teacher.failedToUpdateStatus"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleApologize = async () => {
    if (!selectedEvent || !apologyReason) return;
    
    try {
      setIsSaving(true);
      if (selectedEvent.type === "class") {
        await TeacherService.cancelClass(selectedEvent.id, apologyReason);
      }
      await fetchData();
      setIsEventModalOpen(false);
      setSelectedEvent(null);
      setApologyReason("");
    } catch (err: any) {
      setError(err.message || getText("teacher.failedToSendApology"));
    } finally {
      setIsSaving(false);
    }
  };

  const addAvailabilitySlot = (dayOfWeek: number) => {
    setAvailability([
      ...availability,
      {
        id: Date.now(),
        teacher_id: 0,
        day_of_week: dayOfWeek,
        start_time: "09:00",
        end_time: "10:00",
        timezone: "UTC",
        is_available: true,
        created_at: "",
        updated_at: "",
      } as TeacherAvailability,
    ]);
  };

  const removeAvailabilitySlot = (id: number) => {
    setAvailability(availability.filter((slot) => slot.id !== id));
  };

  const updateAvailabilitySlot = (id: number, field: string, value: any) => {
    setAvailability(
      availability.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    );
  };

  const handleSaveAvailability = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await TeacherService.updateAvailability(
        availability.map((slot) => ({
          day_of_week: slot.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time,
          timezone: slot.timezone,
          is_available: slot.is_available,
        }))
      );
      await fetchData();
    } catch (err: any) {
      setError(err.message || getText("teacher.failedToUpdateAvailability"));
    } finally {
      setIsSaving(false);
    }
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeekStart);
    newWeek.setDate(newWeek.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeekStart(newWeek);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const weekDates = getWeekDates();

  return (
    <div className="space-y-6 rtl w-full" dir="rtl" style={{ textAlign: 'right', direction: 'rtl', width: '100%' }}>
      <div className="flex items-center justify-between flex-row-reverse w-full">
        <div className="text-right w-full" style={{ textAlign: 'right', width: '100%' }}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-right w-full" style={{ textAlign: 'right', width: '100%' }}>
            {getText("teacher.availability")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-right w-full" style={{ textAlign: 'right', width: '100%' }}>
            {getText("teacher.availabilityDescription")}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-right" style={{ textAlign: 'right' }}>
          <p className="font-medium" style={{ textAlign: 'right' }}>{error}</p>
        </div>
      )}

      {/* Availability Settings - Collapsible */}
      <Card className="text-right rtl" dir="rtl" style={{ textAlign: 'right', direction: 'rtl' }}>
        <CardHeader 
          className="text-right rtl cursor-pointer" 
          dir="rtl" 
          style={{ textAlign: 'right', direction: 'rtl', width: '100%' }}
          onClick={() => setIsAvailabilityCollapsed(!isAvailabilityCollapsed)}
        >
          <div className="flex items-center justify-between flex-row-reverse w-full">
            <CardTitle className="flex items-center gap-2 flex-row-reverse text-right w-full rtl" dir="rtl" style={{ textAlign: 'right', direction: 'rtl', justifyContent: 'flex-end', width: '100%' }}>
              <Clock className="h-5 w-5" />
              <span className="w-full text-right" style={{ textAlign: 'right', direction: 'rtl', width: '100%' }}>{getText("teacher.setAvailability")}</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsAvailabilityCollapsed(!isAvailabilityCollapsed);
              }}
              className="flex items-center justify-center flex-shrink-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              style={{ flexShrink: 0 }}
            >
              {isAvailabilityCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {!isAvailabilityCollapsed && (
          <CardContent className="text-right rtl" dir="rtl" style={{ textAlign: 'right', direction: 'rtl' }}>
            <div className="space-y-4 rtl" dir="rtl" style={{ direction: 'rtl', textAlign: 'right' }}>
              <div className="grid grid-cols-2 gap-4 rtl" dir="rtl" style={{ direction: 'rtl' }}>
                <div className="text-right rtl" dir="rtl" style={{ textAlign: 'right', direction: 'rtl', width: '100%' }}>
                  <Label 
                    className="block mb-2 text-right w-full rtl" 
                    dir="rtl"
                    style={{ textAlign: 'right', direction: 'rtl', display: 'block', width: '100%' }}
                  >
                    {getText("teacher.dateFrom")}
                  </Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full text-right rtl"
                    dir="rtl"
                    style={{ textAlign: 'right', direction: 'rtl', width: '100%' }}
                  />
                </div>
                <div className="text-right rtl" dir="rtl" style={{ textAlign: 'right', direction: 'rtl', width: '100%' }}>
                  <Label 
                    className="block mb-2 text-right w-full rtl" 
                    dir="rtl"
                    style={{ textAlign: 'right', direction: 'rtl', display: 'block', width: '100%' }}
                  >
                    {getText("teacher.dateTo")}
                  </Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full text-right rtl"
                    dir="rtl"
                    style={{ textAlign: 'right', direction: 'rtl', width: '100%' }}
                  />
                </div>
              </div>

              {DAYS.map((day) => {
                const daySlots = availability.filter((slot) => slot.day_of_week === day.value);
                return (
                  <div key={day.value} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 text-right rtl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200" dir="rtl" style={{ textAlign: 'right', direction: 'rtl', width: '100%' }}>
                    <div className="flex items-center justify-between mb-3 flex-row-reverse w-full gap-3" style={{ direction: 'rtl', width: '100%' }}>
                      <h3 className="font-medium text-right flex-1" style={{ textAlign: 'right', direction: 'rtl' }}>
                        {day.labelAr}
                      </h3>
                      <Button
                        size="sm"
                        onClick={() => addAvailabilitySlot(day.value)}
                        className="flex-row-reverse flex-shrink-0 bg-green-500 hover:bg-green-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
                        style={{ direction: 'rtl', flexShrink: 0 }}
                      >
                        <Plus className="h-4 w-4 ml-2" />
                        <span style={{ textAlign: 'right' }}>{getText("teacher.addTimeSlot")}</span>
                      </Button>
                    </div>
                    {daySlots.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm text-right w-full" style={{ textAlign: 'right', direction: 'rtl', width: '100%' }}>
                        {getText("teacher.noAvailabilitySet")}
                      </p>
                    ) : (
                      <div className="space-y-2 w-full" style={{ direction: 'rtl', width: '100%' }}>
                        {daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex flex-col gap-2 p-3 border-2 border-blue-200 dark:border-blue-800 rounded-lg w-full bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                            style={{ direction: 'rtl', width: '100%' }}
                          >
                            <div className="flex items-center gap-3 flex-row-reverse w-full" style={{ direction: 'rtl' }}>
                              {/* From Time */}
                              <div className="flex flex-col gap-1 flex-1">
                                <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 text-right" style={{ textAlign: 'right', direction: 'rtl' }}>
                                  {getText("teacher.fromTime")}
                                </Label>
                                <input
                                  type="time"
                                  value={slot.start_time}
                                  onChange={(e) =>
                                    updateAvailabilitySlot(slot.id, "start_time", e.target.value)
                                  }
                                  className="px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 w-full"
                                  dir="ltr"
                                  style={{ textAlign: 'left', direction: 'ltr' }}
                                />
                              </div>
                              
                              {/* To Time */}
                              <div className="flex flex-col gap-1 flex-1">
                                <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 text-right" style={{ textAlign: 'right', direction: 'rtl' }}>
                                  {getText("teacher.toTime")}
                                </Label>
                                <input
                                  type="time"
                                  value={slot.end_time}
                                  onChange={(e) =>
                                    updateAvailabilitySlot(slot.id, "end_time", e.target.value)
                                  }
                                  className="px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 w-full"
                                  dir="ltr"
                                  style={{ textAlign: 'left', direction: 'ltr' }}
                                />
                              </div>
                              
                              {/* Remove Button */}
                              <div className="flex items-end pb-0.5">
                                <Button
                                  size="sm"
                                  onClick={() => removeAvailabilitySlot(slot.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 rounded-md h-10"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end flex-row-reverse pt-4" style={{ direction: 'rtl', justifyContent: 'flex-start' }}>
              <Button 
                onClick={handleSaveAvailability} 
                disabled={isSaving} 
                size="lg" 
                className="flex-row-reverse bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed" 
                style={{ direction: 'rtl' }}
              >
                <span style={{ textAlign: 'right' }}>
                  {isSaving
                    ? getText("teacher.saving")
                    : getText("teacher.saveAvailability")}
                </span>
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Search */}
      <Card className="text-right" style={{ textAlign: 'right' }}>
        <CardContent className="pt-6 text-right" style={{ textAlign: 'right' }}>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={getText("teacher.searchEvents")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-right"
              dir="rtl"
              style={{ textAlign: 'right', direction: 'rtl' }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Week Navigation */}
      <Card className="text-right" style={{ textAlign: 'right' }}>
        <CardHeader className="text-right" style={{ textAlign: 'right' }}>
          <div className="flex items-center justify-between flex-row-reverse">
            <CardTitle className="flex items-center gap-2 flex-row-reverse text-right w-full" style={{ textAlign: 'right', justifyContent: 'flex-start' }}>
              <Calendar className="h-5 w-5" />
              <span style={{ textAlign: 'right' }}>{getText("teacher.weekView")}</span>
            </CardTitle>
            <div className="flex items-center gap-2 flex-row-reverse">
              {/* Previous week button - shows right arrow in RTL (goes to earlier week) */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek("prev")}
                className="flex items-center justify-center"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {/* Week date range - right aligned */}
              <span className="text-sm font-medium min-w-[200px] text-right px-2" style={{ textAlign: 'right', direction: 'rtl', display: 'block', width: '100%' }}>
                {weekDates[0].toLocaleDateString("ar-SA", { 
                  month: "short", 
                  day: "numeric" 
                })} - {weekDates[6].toLocaleDateString("ar-SA", { 
                  month: "short", 
                  day: "numeric" 
                })}
              </span>
              {/* Next week button - shows left arrow in RTL (goes to later week) */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek("next")}
                className="flex items-center justify-center"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeekStart(new Date())}
                className="flex items-center justify-center"
              >
                {getText("teacher.today")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-right" style={{ textAlign: 'right' }}>
          <div className="overflow-x-auto" dir="rtl" style={{ direction: 'rtl' }}>
            <div className="min-w-full">
              <div className="grid grid-cols-8 gap-2" style={{ direction: 'rtl' }}>
                {/* Time column - First in code, appears on right in RTL */}
                <div className="sticky right-0 bg-white dark:bg-gray-800 z-10 border-l border-r-0 text-right min-w-[80px]" style={{ textAlign: 'right', direction: 'rtl', paddingRight: '8px', paddingLeft: '4px', paddingTop: '8px', paddingBottom: '8px' }}>
                  {/* Time column header */}
                  <div className="h-12 border-b p-2 bg-gray-50 dark:bg-gray-900 text-right flex items-center justify-end" style={{ textAlign: 'right', direction: 'rtl', paddingRight: '4px', paddingLeft: '2px' }}>
                    <div className="font-semibold text-sm text-right" style={{ textAlign: 'right' }}>
                      {getText("teacher.time")}
                    </div>
                  </div>
                  {TIME_SLOTS.map((time) => (
                    <div
                      key={time}
                      className="h-16 border-b text-xs text-gray-500 dark:text-gray-400 flex items-center justify-end text-right"
                      style={{ textAlign: 'right', justifyContent: 'flex-end', direction: 'rtl', paddingRight: '4px' }}
                    >
                      {time}
                    </div>
                  ))}
                </div>

                {/* Days - rendered after time column, appear left of time column in RTL */}
                {weekDates.map((date, idx) => {
                  const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
                  const dayInfo = DAYS.find((d) => d.value === dayOfWeek);
                  const dayEvents = getEventsForDate(date);
                  
                  return (
                    <div key={idx} className="border-l border-r-0 first:border-l-0 text-right" style={{ textAlign: 'right', direction: 'rtl' }}>
                      {/* Day header */}
                      <div className="h-12 border-b p-2 bg-gray-50 dark:bg-gray-900 text-right" style={{ textAlign: 'right', direction: 'rtl', paddingRight: '8px', paddingLeft: '8px' }}>
                        <div className="font-semibold text-sm text-right" style={{ textAlign: 'right' }}>
                          {dayInfo?.labelAr}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-right" style={{ textAlign: 'right' }}>
                          {date.toLocaleDateString("ar-SA", { 
                            month: "short", 
                            day: "numeric" 
                          })}
                        </div>
                      </div>

                      {/* Time slots */}
                      <div className="relative">
                        {TIME_SLOTS.map((time) => {
                          const status = getTimeSlotStatus(dayOfWeek, date, time);
                          const eventAtTime = dayEvents.find(
                            (e) => time >= e.startTime && time < e.endTime
                          );

                          return (
                            <div
                              key={time}
                              className={cn(
                                "h-16 border-b relative",
                                status === "available" && "bg-green-50 dark:bg-green-900/20",
                                status === "booked" && "bg-blue-50 dark:bg-blue-900/20",
                                eventAtTime && "cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800/30"
                              )}
                              onClick={() => eventAtTime && handleEventClick(eventAtTime)}
                            >
                              {eventAtTime && (
                                <div className="absolute inset-0 p-1 text-xs text-right">
                                  <div className={cn(
                                    "rounded px-1 py-0.5 truncate text-right",
                                    eventAtTime.type === "class" 
                                      ? "bg-blue-500 text-white" 
                                      : "bg-yellow-500 text-white"
                                  )}>
                                    {eventAtTime.studentName}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="rtl" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">
              {selectedEvent?.type === "class"
                ? getText("teacher.classDetails")
                : getText("teacher.trialDetails")}
            </DialogTitle>
            <DialogDescription className="text-right">
              {selectedEvent?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-right">
            <div>
              <Label className="text-right">{getText("teacher.status")}</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="text-right" dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-right" dir="rtl">
                  <SelectItem value="pending" className="text-right">
                    {getText("teacher.pending")}
                  </SelectItem>
                  <SelectItem value="attended" className="text-right">
                    {getText("teacher.attended")}
                  </SelectItem>
                  <SelectItem value="absent_student" className="text-right">
                    {getText("teacher.absentStudent")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-right">{getText("teacher.apologyReason")}</Label>
              <Textarea
                value={apologyReason}
                onChange={(e) => setApologyReason(e.target.value)}
                placeholder={getText("teacher.apologyReasonPlaceholder")}
                className="text-right"
                dir="rtl"
              />
            </div>
          </div>
          <DialogFooter className="flex-row-reverse">
            <Button
              variant="outline"
              onClick={() => setIsEventModalOpen(false)}
            >
              {getText("teacher.cancel")}
            </Button>
            {apologyReason && (
              <Button
                variant="destructive"
                onClick={handleApologize}
                disabled={isSaving}
              >
                {getText("teacher.sendApology")}
              </Button>
            )}
            <Button onClick={handleSaveStatus} disabled={isSaving}>
              {getText("teacher.updateStatus")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
