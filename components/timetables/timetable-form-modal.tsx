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
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { TimePicker } from "@/components/ui/time-picker";

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
  
  // Manual time difference (minutes) - positive means student is ahead, negative means behind
  const [timeDifference, setTimeDifference] = useState<number>(0);
  const [timeDifferenceInitialized, setTimeDifferenceInitialized] = useState<boolean>(false);
  const [allCourses, setAllCourses] = useState<Course[]>([]); // Store all courses, filter by teacher

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
        
        // Load time difference from stored value or calculate from timezones
        if (timetable.time_difference_minutes !== undefined && timetable.time_difference_minutes !== null) {
          // Use stored value if available
          setTimeDifference(timetable.time_difference_minutes);
          setTimeDifferenceInitialized(true);
        } else if (timetable.student_timezone && timetable.teacher_timezone && !timeDifferenceInitialized) {
          // Calculate from timezones only if not stored
          try {
            const now = new Date();
            const formatter1 = new Intl.DateTimeFormat('en-US', {
              timeZone: timetable.teacher_timezone,
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });
            const formatter2 = new Intl.DateTimeFormat('en-US', {
              timeZone: timetable.student_timezone,
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });
            
            const time1 = formatter1.format(now);
            const time2 = formatter2.format(now);
            
            const [h1, m1] = time1.split(':').map(Number);
            const [h2, m2] = time2.split(':').map(Number);
            
            const minutes1 = h1 * 60 + m1;
            const minutes2 = h2 * 60 + m2;
            
            let diff = minutes2 - minutes1;
            if (diff > 720) diff -= 1440;
            if (diff < -720) diff += 1440;
            
            setTimeDifference(diff); // Store in minutes
            setTimeDifferenceInitialized(true);
          } catch (err) {
            setTimeDifference(0);
            setTimeDifferenceInitialized(true);
          }
        }
        
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
        setTimeDifference(0);
        setTimeDifferenceInitialized(false);
      }
    }
  }, [open, timetable]);

  // Recalculate time difference when timezones change (only for new timetables, not when editing)
  useEffect(() => {
    // Only auto-calculate if creating new timetable and timeDifference hasn't been manually set
    if (!isEdit && !timeDifferenceInitialized && formData.student_timezone && formData.teacher_timezone && formData.student_timezone !== "UTC" && formData.teacher_timezone !== "UTC") {
      try {
        const now = new Date();
        const formatter1 = new Intl.DateTimeFormat('en-US', {
          timeZone: formData.teacher_timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        const formatter2 = new Intl.DateTimeFormat('en-US', {
          timeZone: formData.student_timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        
        const time1 = formatter1.format(now);
        const time2 = formatter2.format(now);
        
        const [h1, m1] = time1.split(':').map(Number);
        const [h2, m2] = time2.split(':').map(Number);
        
        const minutes1 = h1 * 60 + m1;
        const minutes2 = h2 * 60 + m2;
        
        let diff = minutes2 - minutes1;
        if (diff > 720) diff -= 1440;
        if (diff < -720) diff += 1440;
        
        setTimeDifference(diff);
        setTimeDifferenceInitialized(true);
      } catch (err) {
        // Keep current value on error
      }
    }
  }, [formData.student_timezone, formData.teacher_timezone, isEdit, timeDifferenceInitialized]);

  // Set selected student and teacher names after data is loaded
  useEffect(() => {
    if (timetable && students.length > 0) {
      const student = students.find(s => s.id === timetable.student_id);
      if (student) setSelectedStudentName(student.full_name);
    }
  }, [timetable, students]);

  // Set selected teacher name after teachers are loaded or from timetable data
  useEffect(() => {
    if (timetable) {
      // First try to get from loaded teachers array
      if (teachers.length > 0) {
        const teacher = teachers.find(t => t.id === timetable.teacher_id);
        if (teacher) {
          const teacherName = (teacher as any).user?.name || (teacher as any).full_name || `Teacher ${teacher.id}`;
          setSelectedTeacherName(teacherName);
          return;
        }
      }
      // Fallback: use teacher data from timetable if available
      if (timetable.teacher) {
        const teacherName = timetable.teacher?.user?.name || (timetable.teacher as any).full_name || `Teacher ${timetable.teacher_id}`;
        setSelectedTeacherName(teacherName);
      }
    }
  }, [timetable, teachers]);

  // Load teacher courses when teacher is selected
  useEffect(() => {
    if (formData.teacher_id) {
      loadTeacherCourses(parseInt(formData.teacher_id));
    } else {
      // If no teacher selected, show all courses
      setCourses(allCourses);
    }
  }, [formData.teacher_id]);

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
      setAllCourses(response.data);
      // If teacher is selected, filter courses; otherwise show all
      if (formData.teacher_id) {
        await loadTeacherCourses(parseInt(formData.teacher_id));
      } else {
        setCourses(response.data);
      }
    } catch (err) {
      console.error("Failed to load courses:", err);
      setAllCourses([]);
      setCourses([]);
    }
  };

  const loadTeacherCourses = async (teacherId: number) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.TEACHER(teacherId));
      if (response.status === "success" && response.data) {
        const teacher = (response.data as any).teacher || response.data;
        if (teacher.courses && teacher.courses.length > 0) {
          setCourses(teacher.courses);
        } else {
          // If teacher has no courses, show all courses
          setCourses(allCourses.length > 0 ? allCourses : []);
        }
      } else {
        setCourses(allCourses.length > 0 ? allCourses : []);
      }
    } catch (err) {
      console.error("Error loading teacher courses:", err);
      setCourses(allCourses.length > 0 ? allCourses : []);
    }
  };

  // Convert time using manual time difference
  // timeDifference: positive = student ahead, negative = student behind (in minutes)
  // Returns: { time, dateOffset: -1, 0, or 1 }
  const convertTimeToStudentTimezone = (time: string, timeDiffMinutes: number): { time: string; dateOffset: number } => {
    if (!time || timeDiffMinutes === 0) {
      return { time, dateOffset: 0 };
    }

    try {
      const [h, m] = time.split(':').map(Number);
      let totalMins = h * 60 + m + timeDiffMinutes;
      let dateOffset = 0;
      
      if (totalMins < 0) {
        // Time goes to previous day
        totalMins += 1440;
        dateOffset = -1;
      } else if (totalMins >= 1440) {
        // Time goes to next day
        totalMins -= 1440;
        dateOffset = 1;
      }
      
      const resultH = Math.floor(totalMins / 60);
      const resultM = totalMins % 60;
      
      return {
        time: `${String(resultH).padStart(2, '0')}:${String(resultM).padStart(2, '0')}`,
        dateOffset
      };
    } catch (err) {
      console.error("Error converting time:", err);
      return { time, dateOffset: 0 };
    }
  };

  // Get relative day text for preview
  const getRelativeDayText = (dateOffset: number): string => {
    if (dateOffset === 0) {
      return t("timetables.form.sameDay");
    } else if (dateOffset === 1) {
      return t("timetables.form.dayAfter");
    } else if (dateOffset === -1) {
      return t("timetables.form.dayBefore");
    }
    return "";
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
      
      // Ensure teacher_id is valid
      if (!formData.teacher_id || formData.teacher_id === "") {
        alert(t("timetables.form.fillAllRequiredFields"));
        setIsLoading(false);
        return;
      }
      
      const data = {
        student_id: parseInt(formData.student_id),
        teacher_id: parseInt(formData.teacher_id),
        course_id: parseInt(courseId),
        days_of_week: formData.days_of_week,
        time_slots: timeSlots,
        student_timezone: formData.student_timezone,
        teacher_timezone: formData.teacher_timezone,
        time_difference_minutes: timeDifference,
        status: formData.status,
      };

      // Validate required fields
      if (!data.teacher_id || isNaN(data.teacher_id)) {
        alert("Please select a teacher");
        setIsLoading(false);
        return;
      }

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
                            // Load teacher courses when teacher is selected
                            loadTeacherCourses(teacher.id);
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
                      <TimePicker
                        value={sameTimeSlot.start}
                        onChange={(value) => setSameTimeSlot({ ...sameTimeSlot, start: value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timetables.form.endTime")} *</Label>
                      <TimePicker
                        value={sameTimeSlot.end}
                        onChange={(value) => setSameTimeSlot({ ...sameTimeSlot, end: value })}
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
                  
                  {/* Preview: Student Local Time */}
                  {sameTimeSlot.start && sameTimeSlot.end && (
                    <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md border">
                      <Label className="text-sm font-semibold">{t("timetables.form.studentLocalTime")}</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">{t("timetables.form.startTime")}</Label>
                          {(() => {
                            const converted = convertTimeToStudentTimezone(sameTimeSlot.start, timeDifference);
                            const dayText = getRelativeDayText(converted.dateOffset);
                            return (
                              <Input
                                type="text"
                                value={`${dayText} ${formatTime12Hour(converted.time)}`}
                                disabled
                                className="bg-white dark:bg-gray-800"
                              />
                            );
                          })()}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">{t("timetables.form.endTime")}</Label>
                          {(() => {
                            const converted = convertTimeToStudentTimezone(sameTimeSlot.end, timeDifference);
                            const dayText = getRelativeDayText(converted.dateOffset);
                            return (
                              <Input
                                type="text"
                                value={`${dayText} ${formatTime12Hour(converted.time)}`}
                                disabled
                                className="bg-white dark:bg-gray-800"
                              />
                            );
                          })()}
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                        <p className="font-medium mb-1">{t("timetables.form.teacherTime")}:</p>
                        <p>{t("timetables.form.sameDay")} {formatTime12Hour(sameTimeSlot.start)} - {formatTime12Hour(sameTimeSlot.end)}</p>
                      </div>
                    </div>
                  )}
                  
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
                          <TimePicker
                            value={daySlot.start}
                            onChange={(value) =>
                              setDayTimeSlots({
                                ...dayTimeSlots,
                                [day]: { ...daySlot, start: value },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("timetables.form.endTime")} *</Label>
                          <TimePicker
                            value={daySlot.end}
                            onChange={(value) =>
                              setDayTimeSlots({
                                ...dayTimeSlots,
                                [day]: { ...daySlot, end: value },
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
                      
                      {/* Preview: Student Local Time */}
                      {daySlot.start && daySlot.end && (
                        <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md border mt-4">
                          <Label className="text-sm font-semibold">{t("timetables.form.studentLocalTime")}</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">{t("timetables.form.startTime")}</Label>
                              {(() => {
                                const converted = convertTimeToStudentTimezone(daySlot.start, timeDifference);
                                const dayText = getRelativeDayText(converted.dateOffset);
                                return (
                                  <Input
                                    type="text"
                                    value={`${dayText} ${formatTime12Hour(converted.time)}`}
                                    disabled
                                    className="bg-white dark:bg-gray-800"
                                  />
                                );
                              })()}
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">{t("timetables.form.endTime")}</Label>
                              {(() => {
                                const converted = convertTimeToStudentTimezone(daySlot.end, timeDifference);
                                const dayText = getRelativeDayText(converted.dateOffset);
                                return (
                                  <Input
                                    type="text"
                                    value={`${dayText} ${formatTime12Hour(converted.time)}`}
                                    disabled
                                    className="bg-white dark:bg-gray-800"
                                  />
                                );
                              })()}
                            </div>
                          </div>
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                            <p className="font-medium mb-1">{t("timetables.form.teacherTime")}:</p>
                            <p>{t("timetables.form.sameDay")} {formatTime12Hour(daySlot.start)} - {formatTime12Hour(daySlot.end)}</p>
                          </div>
                        </div>
                      )}
                      
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

          {/* Time Difference */}
          <div className="space-y-2">
            <Label>{t("timetables.form.timeDifference")} *</Label>
            <div className="flex items-center gap-2">
              <Select
                value={timeDifference >= 0 ? "plus" : "minus"}
                onValueChange={(value) => {
                  const sign = value === "plus" ? 1 : -1;
                  setTimeDifference(Math.abs(timeDifference) * sign);
                }}
              >
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plus">+</SelectItem>
                  <SelectItem value="minus">-</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={Math.abs(timeDifference)}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  const sign = timeDifference >= 0 ? 1 : -1;
                  // Clamp between 0 and 720
                  const clamped = Math.max(0, Math.min(720, val));
                  setTimeDifference(clamped * sign);
                }}
                placeholder="0"
                className="w-32"
                min="0"
                max="720"
                step="15"
              />
              <span className="text-sm text-muted-foreground">
                {t("timetables.form.minutes")}
                {timeDifference > 0 && ` (${t("timetables.form.studentAhead")})`}
                {timeDifference < 0 && ` (${t("timetables.form.studentBehind")})`}
                {timeDifference === 0 && ` (${t("timetables.form.sameTime")})`}
              </span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>{t("timetables.form.timeDifferenceHint")}</p>
              {timeDifference !== 0 && (
                <p className="font-medium">
                  {Math.abs(timeDifference)} {t("timetables.form.minutes")} = {Math.abs(Math.round(timeDifference / 60 * 10) / 10)} {t("timetables.form.hours")}
                </p>
              )}
            </div>
          </div>

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
