"use client";

import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Timetable, TimeSlot, Student, Teacher, Course } from "@/lib/api/types";
import { TimetableService } from "@/lib/services/timetable.service";
import { StudentService } from "@/lib/services/student.service";
import { TeacherService } from "@/lib/services/teacher.service";
import { CourseService } from "@/lib/services/course.service";
import { useLanguage } from "@/contexts/language-context";
import { Card } from "@/components/ui/card";
import { Plus, X, Search } from "lucide-react";
import { COUNTRIES, Country } from "@/lib/countries-timezones";

interface TimetableFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timetable?: Timetable | null;
  onSave: () => Promise<void>;
}

// DAYS_OF_WEEK will be created inside the component to use translations

// Convert 24-hour time to 12-hour AM/PM format
const formatTime12Hour = (time24: string): string => {
  const [hours, minutes] = time24.substring(0, 5).split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// HTML time input returns 24-hour format, so we just use it directly
// The formatTime12Hour is only for display purposes

export function TimetableFormModal({
  open,
  onOpenChange,
  timetable,
  onSave,
}: TimetableFormModalProps) {
  const { t, direction } = useLanguage();
  const isEdit = !!timetable;

  // Create days of week with translations
  const DAYS_OF_WEEK = [
    { value: 1, label: t("common.monday") },
    { value: 2, label: t("common.tuesday") },
    { value: 3, label: t("common.wednesday") },
    { value: 4, label: t("common.thursday") },
    { value: 5, label: t("common.friday") },
    { value: 6, label: t("common.saturday") },
    { value: 7, label: t("common.sunday") },
  ];

  const [formData, setFormData] = useState({
    student_id: "",
    teacher_id: "",
    course_id: "",
    days_of_week: [] as number[],
    time_slots: [] as TimeSlot[],
    student_timezone: "UTC",
    teacher_timezone: "UTC",
    status: "active" as "active" | "paused" | "stopped",
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Searchable dropdowns
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentTimezoneSearch, setStudentTimezoneSearch] = useState("");
  const [teacherTimezoneSearch, setTeacherTimezoneSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [showStudentTimezoneDropdown, setShowStudentTimezoneDropdown] = useState(false);
  const [showTeacherTimezoneDropdown, setShowTeacherTimezoneDropdown] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedTeacherName, setSelectedTeacherName] = useState("");
  const [selectedStudentTimezone, setSelectedStudentTimezone] = useState("");
  const [selectedTeacherTimezone, setSelectedTeacherTimezone] = useState("");
  const [teacherAvailability, setTeacherAvailability] = useState<any[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // Time slot mode: "same" or "different"
  const [timeSlotMode, setTimeSlotMode] = useState<"same" | "different">("same");
  
  // Same time slot for all days
  const [sameTimeSlot, setSameTimeSlot] = useState({ start: "", end: "", course_id: "" });
  
  // Different time slots per day
  const [dayTimeSlots, setDayTimeSlots] = useState<Record<number, { start: string; end: string; course_id: string }>>({});

  const studentDropdownRef = useRef<HTMLDivElement>(null);
  const teacherDropdownRef = useRef<HTMLDivElement>(null);
  const studentTimezoneRef = useRef<HTMLDivElement>(null);
  const teacherTimezoneRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    if (open) {
      loadStudents();
      loadTeachers();
      loadCourses();

      if (timetable) {
        setFormData({
          student_id: timetable.student_id.toString(),
          teacher_id: timetable.teacher_id.toString(),
          course_id: timetable.course_id.toString(),
          days_of_week: timetable.days_of_week || [],
          time_slots: timetable.time_slots || [],
          student_timezone: timetable.student_timezone,
          teacher_timezone: timetable.teacher_timezone,
          status: timetable.status,
        });
        
        // Set timezone selections
        const studentCountry = COUNTRIES.find(c => c.timezone === timetable.student_timezone);
        if (studentCountry) setSelectedStudentTimezone(`${studentCountry.name} (${studentCountry.timezone})`);
        
        const teacherCountry = COUNTRIES.find(c => c.timezone === timetable.teacher_timezone);
        if (teacherCountry) setSelectedTeacherTimezone(`${teacherCountry.name} (${teacherCountry.timezone})`);
        
        // Determine if same or different mode
        if (timetable.time_slots.length > 0) {
          const firstCourse = timetable.time_slots[0];
          const allSame = timetable.time_slots.every(slot => 
            slot.start === firstCourse.start && 
            slot.end === firstCourse.end
          );
          
          if (allSame) {
            setTimeSlotMode("same");
            setSameTimeSlot({
              start: firstCourse.start,
              end: firstCourse.end,
              course_id: timetable.course_id.toString(),
            });
          } else {
            setTimeSlotMode("different");
            const slots: Record<number, { start: string; end: string; course_id: string }> = {};
            timetable.time_slots.forEach(slot => {
              slots[slot.day] = {
                start: slot.start,
                end: slot.end,
                course_id: timetable.course_id.toString(),
              };
            });
            setDayTimeSlots(slots);
          }
        }
      } else {
        setFormData({
          student_id: "",
          teacher_id: "",
          course_id: "",
          days_of_week: [],
          time_slots: [],
          student_timezone: "UTC",
          teacher_timezone: "UTC",
          status: "active",
        });
        setTimeSlotMode("same");
        setSameTimeSlot({ start: "", end: "", course_id: "" });
        setDayTimeSlots({});
        setSelectedStudentName("");
        setSelectedTeacherName("");
        setSelectedStudentTimezone("");
        setSelectedTeacherTimezone("");
      }
    }
  }, [open, timetable]);

  // Set selected student name after students are loaded
  useEffect(() => {
    if (timetable && students.length > 0) {
      const student = students.find(s => s.id === timetable.student_id);
      if (student) setSelectedStudentName(student.full_name);
    }
  }, [timetable, students]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target as Node)) {
        setShowStudentDropdown(false);
      }
      if (teacherDropdownRef.current && !teacherDropdownRef.current.contains(event.target as Node)) {
        setShowTeacherDropdown(false);
      }
      if (studentTimezoneRef.current && !studentTimezoneRef.current.contains(event.target as Node)) {
        setShowStudentTimezoneDropdown(false);
      }
      if (teacherTimezoneRef.current && !teacherTimezoneRef.current.contains(event.target as Node)) {
        setShowTeacherTimezoneDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadStudents = async () => {
    try {
      const response = await StudentService.getStudents({ per_page: 100 });
      setStudents(response.data);
    } catch (err) {
      console.error("Failed to load students:", err);
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await TeacherService.getTeachers({ per_page: 100 });
      setTeachers(response.data);
    } catch (err) {
      console.error("Failed to load teachers:", err);
      setTeachers([]);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await CourseService.getCourses({ per_page: 100 });
      setCourses(response.data);
    } catch (err) {
      console.error("Failed to load courses:", err);
      setCourses([]);
    }
  };

  const loadTeacherAvailability = async (teacherId: number) => {
    setIsLoadingAvailability(true);
    try {
      const response = await TeacherService.getTeacherWeeklySchedule(teacherId);
      // Get availability from the schedule data
      const availability: any[] = [];
      response.schedule.forEach((day) => {
        day.availability.forEach((avail) => {
          availability.push({
            ...avail,
            day_of_week: day.day_of_week,
          });
        });
      });
      setTeacherAvailability(availability);
    } catch (err) {
      console.error("Error loading teacher availability:", err);
      setTeacherAvailability([]);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const handleDayToggle = (day: number) => {
    setFormData((prev) => {
      const newDays = prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day];
      return { ...prev, days_of_week: newDays };
    });
  };

  // Check for conflicts
  const checkConflicts = async (timeSlots: TimeSlot[], studentId: number, teacherId: number): Promise<string | null> => {
    try {
      // Get all existing timetables for this student and teacher
      const [studentTimetables, teacherTimetables] = await Promise.all([
        TimetableService.getTimetables({ student_id: studentId, status: "active", per_page: 100 }),
        TimetableService.getTimetables({ teacher_id: teacherId, status: "active", per_page: 100 }),
      ]);

      // Check for overlapping time slots
      for (const newSlot of timeSlots) {
        // Check student conflicts
        for (const existingTimetable of studentTimetables.data) {
          if (isEdit && existingTimetable.id === timetable?.id) continue;
          
          for (const existingSlot of existingTimetable.time_slots || []) {
            if (existingSlot.day === newSlot.day && timesOverlap(newSlot, existingSlot)) {
              const dayLabel = DAYS_OF_WEEK.find(d => d.value === newSlot.day)?.label || `Day ${newSlot.day}`;
              return t("timetables.form.studentHasConflict", { day: dayLabel, time: `${existingSlot.start}-${existingSlot.end}` });
            }
          }
        }

        // Check teacher conflicts
        for (const existingTimetable of teacherTimetables.data) {
          if (isEdit && existingTimetable.id === timetable?.id) continue;
          
          for (const existingSlot of existingTimetable.time_slots || []) {
            if (existingSlot.day === newSlot.day && timesOverlap(newSlot, existingSlot)) {
              const dayLabel = DAYS_OF_WEEK.find(d => d.value === newSlot.day)?.label || `Day ${newSlot.day}`;
              return t("timetables.form.teacherHasConflict", { day: dayLabel, time: `${existingSlot.start}-${existingSlot.end}` });
            }
          }
        }
      }

      return null;
    } catch (err) {
      console.error("Error checking conflicts:", err);
      return null; // Don't block on error, but log it
    }
  };

  // Check if two time slots overlap
  const timesOverlap = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
    const [start1Hour, start1Min] = slot1.start.split(':').map(Number);
    const [end1Hour, end1Min] = slot1.end.split(':').map(Number);
    const [start2Hour, start2Min] = slot2.start.split(':').map(Number);
    const [end2Hour, end2Min] = slot2.end.split(':').map(Number);

    const start1 = start1Hour * 60 + start1Min;
    const end1 = end1Hour * 60 + end1Min;
    const start2 = start2Hour * 60 + start2Min;
    const end2 = end2Hour * 60 + end2Min;

    return start1 < end2 && start2 < end1;
  };

  const handleSubmit = async () => {
    if (!formData.student_id || !formData.teacher_id) {
      alert(t("timetables.form.fillAllRequiredFields"));
      return;
    }

    if (formData.days_of_week.length === 0) {
      alert(t("timetables.form.selectAtLeastOneDay"));
      return;
    }

    // Build time slots based on mode
    let timeSlots: TimeSlot[] = [];
    let courseId = "";
    
    if (timeSlotMode === "same") {
      if (!sameTimeSlot.start || !sameTimeSlot.end || !sameTimeSlot.course_id) {
        alert(t("timetables.form.fillTimeSlotAndCourse"));
        return;
      }
      // HTML time input already returns 24-hour format (HH:mm)
      const startTime = sameTimeSlot.start;
      const endTime = sameTimeSlot.end;
      
      timeSlots = formData.days_of_week.map(day => ({
        day,
        start: startTime,
        end: endTime,
      }));
      
      courseId = sameTimeSlot.course_id;
    } else {
      // Different mode
      for (const day of formData.days_of_week) {
        const daySlot = dayTimeSlots[day];
        if (!daySlot || !daySlot.start || !daySlot.end || !daySlot.course_id) {
          const dayLabel = DAYS_OF_WEEK.find(d => d.value === day)?.label || `Day ${day}`;
          alert(t("timetables.form.fillTimeSlotForDay", { day: dayLabel }));
          return;
        }
        
        // HTML time input already returns 24-hour format (HH:mm)
        const startTime = daySlot.start;
        const endTime = daySlot.end;
        
        timeSlots.push({
          day,
          start: startTime,
          end: endTime,
        });
      }
      
      // For different mode, use the first day's course (or we could make it per-day)
      if (formData.days_of_week.length > 0) {
        courseId = dayTimeSlots[formData.days_of_week[0]]?.course_id || "";
      }
    }

    if (timeSlots.length === 0) {
      alert(t("timetables.form.addAtLeastOneTimeSlot"));
      return;
    }

    if (!courseId) {
      alert(t("timetables.form.selectCourse"));
      return;
    }

    // Check for conflicts
    const conflictError = await checkConflicts(
      timeSlots,
      parseInt(formData.student_id),
      parseInt(formData.teacher_id)
    );
    
    if (conflictError) {
      alert(conflictError);
      return;
    }

    try {
      setIsLoading(true);
      const data = {
        ...formData,
        student_id: parseInt(formData.student_id),
        teacher_id: parseInt(formData.teacher_id),
        course_id: parseInt(courseId),
        time_slots: timeSlots,
      };

      if (isEdit && timetable) {
        await TimetableService.updateTimetable(timetable.id, data);
      } else {
        await TimetableService.createTimetable(data);
      }

      await onSave();
      onOpenChange(false);
    } catch (err: any) {
      alert(err.message || t("timetables.form.failedToSave"));
    } finally {
      setIsLoading(false);
    }
  };

  // Filter functions
  const filteredStudents = students.filter((student) => {
    return student.full_name.toLowerCase().includes(studentSearch.toLowerCase());
  });

  const filteredTeachers = teachers.filter((teacher) => {
    const teacherName =
      (teacher as any).user?.name ||
      (teacher as any).full_name ||
      `Teacher ${teacher.id}`;
    return teacherName.toLowerCase().includes(teacherSearch.toLowerCase());
  });

  const filteredCountries = (search: string) => {
    const searchLower = search.toLowerCase();
    return COUNTRIES.filter((country) => {
      return country.name.toLowerCase().includes(searchLower) ||
        country.timezone.toLowerCase().includes(searchLower);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={direction}>
        <DialogHeader>
          <DialogTitle>{isEdit ? t("timetables.editTimetable") : t("timetables.createTimetable")}</DialogTitle>
          <DialogDescription>
            {isEdit ? t("timetables.form.editDescription") : t("timetables.form.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative" ref={studentDropdownRef}>
                  <Label>{t("timetables.form.student")} *</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={t("timetables.form.studentPlaceholder")}
                      value={selectedStudentName || studentSearch}
                      onChange={(e) => {
                        setStudentSearch(e.target.value);
                        setShowStudentDropdown(true);
                        if (!e.target.value) {
                          setSelectedStudentName("");
                          setFormData({ ...formData, student_id: "" });
                        }
                      }}
                      onFocus={() => setShowStudentDropdown(true)}
                      className={`pl-9 ${selectedStudentName ? "pr-9" : ""}`}
                    />
                    {selectedStudentName && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                        onClick={() => {
                          setSelectedStudentName("");
                          setStudentSearch("");
                          setFormData({ ...formData, student_id: "" });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {showStudentDropdown && (studentSearch || !selectedStudentName) && (
                    <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredStudents.map((student) => (
                        <div
                          key={student.id}
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => {
                            setSelectedStudentName(student.full_name);
                            setStudentSearch("");
                            setFormData({ ...formData, student_id: student.id.toString() });
                            setShowStudentDropdown(false);
                          }}
                        >
                          {student.full_name}
                        </div>
                      ))}
                      {filteredStudents.length === 0 && (
                        <div className="px-4 py-2 text-sm text-muted-foreground">
                          {t("timetables.form.noStudentsFound")}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2 relative" ref={teacherDropdownRef}>
                  <Label>{t("timetables.form.teacher")} *</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={t("timetables.form.teacherPlaceholder")}
                      value={selectedTeacherName || teacherSearch}
                      onChange={(e) => {
                        setTeacherSearch(e.target.value);
                        setShowTeacherDropdown(true);
                        if (!e.target.value) {
                          setSelectedTeacherName("");
                          setFormData({ ...formData, teacher_id: "" });
                        }
                      }}
                      onFocus={() => setShowTeacherDropdown(true)}
                      className={`pl-9 ${selectedTeacherName ? "pr-9" : ""}`}
                    />
                    {selectedTeacherName && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                        onClick={() => {
                          setSelectedTeacherName("");
                          setTeacherSearch("");
                          setFormData({ ...formData, teacher_id: "" });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {showTeacherDropdown && (teacherSearch || !selectedTeacherName) && (
                    <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
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
                              setFormData({ ...formData, teacher_id: teacher.id.toString() });
                              setShowTeacherDropdown(false);
                              loadTeacherAvailability(teacher.id);
                            }}
                          >
                            {teacherName}
                          </div>
                        );
                      })}
                      {filteredTeachers.length === 0 && (
                        <div className="px-4 py-2 text-sm text-muted-foreground">
                          {t("timetables.form.noTeachersFound")}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t("timetables.form.status")}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t("timetables.active")}</SelectItem>
                      <SelectItem value="paused">{t("timetables.paused")}</SelectItem>
                      <SelectItem value="stopped">{t("timetables.stopped")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
          </div>

          {/* Teacher Availability */}
          {formData.teacher_id && (
            <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label>{t("timetables.form.teacherAvailableTimes")}</Label>
              {isLoadingAvailability ? (
                <p className="text-sm text-gray-600">{t("timetables.form.loadingAvailability")}</p>
              ) : teacherAvailability.length === 0 ? (
                <p className="text-sm text-yellow-600">
                  {t("timetables.form.noAvailabilitySet")}
                </p>
              ) : (
                <div className="space-y-3">
                  {DAYS_OF_WEEK.map((day) => {
                    const dayAvailability = teacherAvailability.filter(
                      (avail) => avail.day_of_week === day.value
                    );
                    if (dayAvailability.length === 0) return null;
                    return (
                      <div key={day.value} className="space-y-1">
                        <div className="font-medium text-sm">{day.label}</div>
                        <div className="flex flex-wrap gap-2">
                          {dayAvailability.map((avail) => (
                            <Button
                              key={avail.id}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (timeSlotMode === "same") {
                                  setSameTimeSlot({
                                    ...sameTimeSlot,
                                    start: avail.start_time.substring(0, 5),
                                    end: avail.end_time.substring(0, 5),
                                  });
                                } else {
                                  // Add to selected days
                                  if (!formData.days_of_week.includes(day.value)) {
                                    handleDayToggle(day.value);
                                  }
                                  setDayTimeSlots({
                                    ...dayTimeSlots,
                                    [day.value]: {
                                      start: avail.start_time.substring(0, 5),
                                      end: avail.end_time.substring(0, 5),
                                      course_id: formData.course_id || "",
                                    },
                                  });
                                }
                              }}
                            >
                              {avail.start_time.substring(0, 5)} - {avail.end_time.substring(0, 5)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Days of Week */}
          <div className="space-y-3">
            <Label>{t("timetables.form.daysOfWeek")} *</Label>
            <div className="flex flex-wrap gap-4">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={formData.days_of_week.includes(day.value)}
                    onCheckedChange={() => handleDayToggle(day.value)}
                  />
                  <Label htmlFor={`day-${day.value}`} className="cursor-pointer">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Time Slot Mode Selection */}
          <div className="space-y-4">
            <Label>{t("timetables.form.timeSlotConfiguration")} *</Label>
            <RadioGroup
              value={timeSlotMode}
              onValueChange={(value) => setTimeSlotMode(value as "same" | "different")}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="same" id="same" />
                <Label htmlFor="same" className="cursor-pointer">
                  {t("timetables.form.sameTimeForAllDays")}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="different" id="different" />
                <Label htmlFor="different" className="cursor-pointer">
                  {t("timetables.form.differentTimesPerDay")}
                </Label>
              </div>
            </RadioGroup>
              </div>

            {/* Same Time Slot Mode */}
            {timeSlotMode === "same" && formData.days_of_week.length > 0 && (
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t("timetables.form.startTime")} *</Label>
                      <Input
                        type="time"
                        value={sameTimeSlot.start}
                        onChange={(e) => setSameTimeSlot({ ...sameTimeSlot, start: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timetables.form.endTime")} *</Label>
                      <Input
                        type="time"
                        value={sameTimeSlot.end}
                        onChange={(e) => setSameTimeSlot({ ...sameTimeSlot, end: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timetables.form.course")} *</Label>
                      <Select
                        value={sameTimeSlot.course_id}
                        onValueChange={(value) => setSameTimeSlot({ ...sameTimeSlot, course_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("timetables.form.selectCourse")} />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {sameTimeSlot.start && sameTimeSlot.end && (
                    <p className="text-sm text-muted-foreground">
                      {t("timetables.form.time")}: {formatTime12Hour(sameTimeSlot.start)} - {formatTime12Hour(sameTimeSlot.end)}
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* Different Time Slots Mode */}
            {timeSlotMode === "different" && formData.days_of_week.length > 0 && (
              <div className="space-y-4">
                {formData.days_of_week.map((day) => {
                  const dayLabel = DAYS_OF_WEEK.find((d) => d.value === day)?.label || `Day ${day}`;
                  const daySlot = dayTimeSlots[day] || { start: "", end: "", course_id: "" };
                  
                  return (
                    <Card key={day} className="p-4">
                      <h4 className="font-semibold mb-4">{dayLabel}</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>{t("timetables.form.startTime")} *</Label>
                          <Input
                            type="time"
                            value={daySlot.start}
                            onChange={(e) =>
                              setDayTimeSlots({
                                ...dayTimeSlots,
                                [day]: { ...daySlot, start: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("timetables.form.endTime")} *</Label>
                          <Input
                            type="time"
                            value={daySlot.end}
                            onChange={(e) =>
                              setDayTimeSlots({
                                ...dayTimeSlots,
                                [day]: { ...daySlot, end: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("timetables.form.course")} *</Label>
                          <Select
                            value={daySlot.course_id}
                            onValueChange={(value) =>
                              setDayTimeSlots({
                                ...dayTimeSlots,
                                [day]: { ...daySlot, course_id: value },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t("timetables.form.selectCourse")} />
                            </SelectTrigger>
                            <SelectContent>
                              {courses.map((course) => (
                                <SelectItem key={course.id} value={course.id.toString()}>
                                  {course.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {daySlot.start && daySlot.end && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {t("timetables.form.time")}: {formatTime12Hour(daySlot.start)} - {formatTime12Hour(daySlot.end)}
                        </p>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}

          {/* Timezones */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 relative" ref={studentTimezoneRef}>
              <Label>{t("timetables.form.studentTimezone")} *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("timetables.form.searchCountryOrTimezone")}
                  value={selectedStudentTimezone || studentTimezoneSearch}
                  onChange={(e) => {
                    setStudentTimezoneSearch(e.target.value);
                    setShowStudentTimezoneDropdown(true);
                    if (!e.target.value) {
                      setSelectedStudentTimezone("");
                      setFormData({ ...formData, student_timezone: "UTC" });
                    }
                  }}
                  onFocus={() => setShowStudentTimezoneDropdown(true)}
                  className={`pl-9 ${selectedStudentTimezone ? "pr-9" : ""}`}
                />
                {selectedStudentTimezone && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={() => {
                      setSelectedStudentTimezone("");
                      setStudentTimezoneSearch("");
                      setFormData({ ...formData, student_timezone: "UTC" });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {showStudentTimezoneDropdown && (studentTimezoneSearch || !selectedStudentTimezone) && (
                <div className="absolute z-[100] w-full bottom-full mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredCountries(studentTimezoneSearch).map((country) => (
                    <div
                      key={country.code}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        setSelectedStudentTimezone(`${country.name} (${country.timezone})`);
                        setStudentTimezoneSearch("");
                        setFormData({ ...formData, student_timezone: country.timezone });
                        setShowStudentTimezoneDropdown(false);
                      }}
                    >
                      <div className="font-medium">{country.name}</div>
                      <div className="text-xs text-muted-foreground">{country.timezone}</div>
                    </div>
                  ))}
                  {filteredCountries(studentTimezoneSearch).length === 0 && (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      {t("timetables.form.noCountriesFound")}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2 relative" ref={teacherTimezoneRef}>
              <Label>{t("timetables.form.teacherTimezone")} *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("timetables.form.searchCountryOrTimezone")}
                  value={selectedTeacherTimezone || teacherTimezoneSearch}
                  onChange={(e) => {
                    setTeacherTimezoneSearch(e.target.value);
                    setShowTeacherTimezoneDropdown(true);
                    if (!e.target.value) {
                      setSelectedTeacherTimezone("");
                      setFormData({ ...formData, teacher_timezone: "UTC" });
                    }
                  }}
                  onFocus={() => setShowTeacherTimezoneDropdown(true)}
                  className={`pl-9 ${selectedTeacherTimezone ? "pr-9" : ""}`}
                />
                {selectedTeacherTimezone && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={() => {
                      setSelectedTeacherTimezone("");
                      setTeacherTimezoneSearch("");
                      setFormData({ ...formData, teacher_timezone: "UTC" });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {showTeacherTimezoneDropdown && (teacherTimezoneSearch || !selectedTeacherTimezone) && (
                <div className="absolute z-[100] w-full bottom-full mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredCountries(teacherTimezoneSearch).map((country) => (
                    <div
                      key={country.code}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        setSelectedTeacherTimezone(`${country.name} (${country.timezone})`);
                        setTeacherTimezoneSearch("");
                        setFormData({ ...formData, teacher_timezone: country.timezone });
                        setShowTeacherTimezoneDropdown(false);
                      }}
                    >
                      <div className="font-medium">{country.name}</div>
                      <div className="text-xs text-muted-foreground">{country.timezone}</div>
                    </div>
                  ))}
                  {filteredCountries(teacherTimezoneSearch).length === 0 && (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      {t("timetables.form.noCountriesFound")}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("timetables.form.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? t("timetables.form.saving") : isEdit ? t("timetables.form.update") : t("timetables.form.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
