"use client";

import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { TrialClass, TeacherAvailability } from "@/lib/api/types";
import { StudentService } from "@/lib/services/student.service";
import { TeacherService } from "@/lib/services/teacher.service";
import { CourseService } from "@/lib/services/course.service";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { Student, Teacher, Course } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { COUNTRIES, getTimezoneForCountry, getCurrencyForCountry } from "@/lib/countries-timezones";
import { cn } from "@/lib/utils";
import { ModernSpinner } from "@/components/ui/loading-spinner";
import { Calendar, Clock, User, GraduationCap } from "lucide-react";

interface TrialFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trial?: TrialClass | null;
  onSave: (trial: Partial<TrialClass> & { new_student?: Partial<Student> }) => Promise<void>;
  isLoading?: boolean;
}

interface TeacherAvailabilitySlot {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
  day_name?: string;
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Sunday" },
  { value: 2, label: "Monday" },
  { value: 3, label: "Tuesday" },
  { value: 4, label: "Wednesday" },
  { value: 5, label: "Thursday" },
  { value: 6, label: "Friday" },
  { value: 7, label: "Saturday" },
];

export function TrialFormModal({
  open,
  onOpenChange,
  trial,
  onSave,
  isLoading = false,
}: TrialFormModalProps) {
  const { t, direction } = useLanguage();
  const isEdit = !!trial;

  // Form state
  const [formData, setFormData] = useState({
    student_id: "",
    teacher_id: "",
    course_id: "",
    trial_date: "",
    start_time: "",
    end_time: "",
    student_date: "",
    student_start_time: "",
    student_end_time: "",
    teacher_date: "",
    teacher_start_time: "",
    teacher_end_time: "",
    notes: "",
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]); // Store all courses
  const [teacherAvailability, setTeacherAvailability] = useState<TeacherAvailabilitySlot[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedTeacherCourses, setSelectedTeacherCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // Load teacher with courses when teacher is selected
  const loadTeacherCourses = async (teacherId: number) => {
    try {
      // Get teacher profile which includes courses
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.TEACHER(teacherId));
      if (response.status === "success" && response.data) {
        // The response might be a profile object with teacher inside, or just the teacher
        const teacher = (response.data as any).teacher || response.data;
        if (teacher.courses && teacher.courses.length > 0) {
          setSelectedTeacherCourses(teacher.courses);
          setCourses(teacher.courses); // Filter courses to only show teacher's courses
        } else {
          // If teacher has no courses assigned, show all courses (or empty if not loaded yet)
          setSelectedTeacherCourses([]);
          setCourses(allCourses.length > 0 ? allCourses : []);
        }
      } else {
        setSelectedTeacherCourses([]);
        setCourses(allCourses.length > 0 ? allCourses : []);
      }
    } catch (err) {
      console.error("Error loading teacher courses:", err);
      // On error, show all courses (or empty if not loaded yet)
      setSelectedTeacherCourses([]);
      setCourses(allCourses.length > 0 ? allCourses : []);
    }
  };

  // Load initial data
  useEffect(() => {
    if (open) {
      loadTeachers();
      loadCourses();
      if (trial) {
        setFormData({
          student_id: trial.student_id.toString(),
          teacher_id: trial.teacher_id.toString(),
          course_id: trial.course_id.toString(),
          trial_date: trial.trial_date.split('T')[0],
          start_time: trial.start_time.substring(0, 5),
          end_time: trial.end_time.substring(0, 5),
          student_date: (trial as any).student_date ? (trial as any).student_date.split('T')[0] : "",
          student_start_time: (trial as any).student_start_time ? (trial as any).student_start_time.substring(0, 5) : "",
          student_end_time: (trial as any).student_end_time ? (trial as any).student_end_time.substring(0, 5) : "",
          teacher_date: (trial as any).teacher_date ? (trial as any).teacher_date.split('T')[0] : "",
          teacher_start_time: (trial as any).teacher_start_time ? (trial as any).teacher_start_time.substring(0, 5) : "",
          teacher_end_time: (trial as any).teacher_end_time ? (trial as any).teacher_end_time.substring(0, 5) : "",
          notes: trial.notes || "",
        });
        if (trial.student) {
          setStudentSearch(trial.student.full_name);
        }
        if (trial.teacher_id) {
          // Load teacher courses after a short delay to ensure allCourses is loaded
          setTimeout(() => {
            loadTeacherCourses(trial.teacher_id);
          }, 100);
        }
      } else {
        setFormData({
          student_id: "",
          teacher_id: "",
          course_id: "",
          trial_date: new Date().toISOString().split('T')[0],
          start_time: "",
          end_time: "",
          student_date: "",
          student_start_time: "",
          student_end_time: "",
          teacher_date: "",
          teacher_start_time: "",
          teacher_end_time: "",
          notes: "",
        });
        setStudentSearch("");
        setShowStudentDropdown(false);
        setTeacherAvailability([]);
      }
      setError(null);
    }
  }, [open, trial]);

  // Load all students function
  const loadAllStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const response = await StudentService.getStudents({ per_page: 1000 });
      setStudents(response.data);
    } catch (err) {
      console.error("Error loading students:", err);
      setStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Load students when modal opens
  useEffect(() => {
    if (open) {
      loadAllStudents();
    }
  }, [open]);

  // Filter students based on search in real-time
  useEffect(() => {
    if (!open || !showStudentDropdown) return;
    
    const searchTimeout = setTimeout(() => {
      if (studentSearch.trim()) {
        setIsLoadingStudents(true);
        StudentService.getStudents({ search: studentSearch, per_page: 100 })
          .then((response) => {
            setStudents(response.data);
          })
          .catch(() => {
            // Keep existing students
          })
          .finally(() => setIsLoadingStudents(false));
      } else {
        // If search is empty, reload all students
        if (students.length === 0) {
          loadAllStudents();
        }
      }
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(searchTimeout);
  }, [studentSearch, open, showStudentDropdown]);


  // Close student dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.student-dropdown-container')) {
        setShowStudentDropdown(false);
      }
    };

    if (showStudentDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showStudentDropdown]);

  // Load teacher courses when teacher is selected
  useEffect(() => {
    if (formData.teacher_id) {
      // Load teacher's courses
      loadTeacherCourses(parseInt(formData.teacher_id));
    } else {
      // If no teacher selected, show all courses
      setCourses(allCourses);
      setSelectedTeacherCourses([]);
    }
  }, [formData.teacher_id, allCourses]);


  const loadTeachers = async () => {
    setIsLoadingTeachers(true);
    try {
      const response = await TeacherService.getTeachers({ per_page: 100 });
      setTeachers(response.data);
    } catch (err) {
      console.error("Error loading teachers:", err);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const loadCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const response = await CourseService.getCourses({ per_page: 100 });
      setAllCourses(response.data);
      setCourses(response.data); // Initially show all courses
    } catch (err) {
      console.error("Error loading courses:", err);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const loadTeacherAvailability = async (teacherId: number) => {
    setIsLoadingAvailability(true);
    try {
      const response = await apiClient.get<TeacherAvailabilitySlot[]>(
        API_ENDPOINTS.ADMIN.TEACHER_AVAILABILITY(teacherId)
      );
      if (response.status === "success" && response.data) {
        const availability = response.data.map((slot) => ({
          ...slot,
          day_name: DAYS_OF_WEEK.find((d) => d.value === slot.day_of_week)?.label || "",
        }));
        setTeacherAvailability(availability);
      }
    } catch (err) {
      console.error("Error loading teacher availability:", err);
      setTeacherAvailability([]);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const loadAvailableTimeSlots = async (teacherId: number, date: string) => {
    setIsLoadingAvailability(true);
    try {
      const response = await apiClient.get<TeacherAvailabilitySlot[]>(
        API_ENDPOINTS.ADMIN.TEACHER_AVAILABLE_TIME_SLOTS(teacherId),
        { params: { date } }
      );
      if (response.status === "success" && response.data) {
        const availability = response.data.map((slot) => ({
          ...slot,
          day_name: DAYS_OF_WEEK.find((d) => d.value === slot.day_of_week)?.label || "",
        }));
        setTeacherAvailability(availability);
      }
    } catch (err) {
      console.error("Error loading available time slots:", err);
      setTeacherAvailability([]);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate student selection
    if (!formData.student_id || formData.student_id.trim() === "") {
      setError(t("trials.validation.studentRequired") || "Please select a student");
      return;
    }

    // More explicit validation with better error messages
    if (!formData.teacher_id || formData.teacher_id.trim() === "") {
      setError(t("trials.validation.teacherRequired") || "Please select a teacher");
      return;
    }

    if (!formData.course_id || formData.course_id.trim() === "") {
      setError(t("trials.validation.courseRequired") || "Please select a course");
      return;
    }

    // Validate student times
    if (!formData.student_date || formData.student_date.trim() === "") {
      setError(t("trials.validation.studentDateRequired") || "Please select a student date");
      return;
    }

    if (!formData.student_start_time || formData.student_start_time.trim() === "") {
      setError(t("trials.validation.studentStartTimeRequired") || "Please enter a student start time");
      return;
    }

    if (!formData.student_end_time || formData.student_end_time.trim() === "") {
      setError(t("trials.validation.studentEndTimeRequired") || "Please enter a student end time");
      return;
    }

    if (formData.student_end_time <= formData.student_start_time) {
      setError(t("trials.validation.studentEndTimeAfterStart") || "Student end time must be after start time");
      return;
    }

    // Validate teacher times
    if (!formData.teacher_date || formData.teacher_date.trim() === "") {
      setError(t("trials.validation.teacherDateRequired") || "Please select a teacher date");
      return;
    }

    if (!formData.teacher_start_time || formData.teacher_start_time.trim() === "") {
      setError(t("trials.validation.teacherStartTimeRequired") || "Please enter a teacher start time");
      return;
    }

    if (!formData.teacher_end_time || formData.teacher_end_time.trim() === "") {
      setError(t("trials.validation.teacherEndTimeRequired") || "Please enter a teacher end time");
      return;
    }

    if (formData.teacher_end_time <= formData.teacher_start_time) {
      setError(t("trials.validation.teacherEndTimeAfterStart") || "Teacher end time must be after start time");
      return;
    }

    try {
      const trialData: Partial<TrialClass> & { new_student?: Partial<Student> } = {
        teacher_id: parseInt(formData.teacher_id),
        course_id: parseInt(formData.course_id),
        trial_date: formData.trial_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        student_date: formData.student_date,
        student_start_time: formData.student_start_time,
        student_end_time: formData.student_end_time,
        teacher_date: formData.teacher_date,
        teacher_start_time: formData.teacher_start_time,
        teacher_end_time: formData.teacher_end_time,
        notes: formData.notes || undefined,
      };

      trialData.student_id = parseInt(formData.student_id);

      await onSave(trialData);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || t("trials.error.save") || "Failed to save trial");
    }
  };

  const selectedStudent = students.find((s) => s.id.toString() === formData.student_id) ||
    (trial?.student && trial.student.id.toString() === formData.student_id ? trial.student : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-3xl max-h-[90vh] overflow-y-auto ${direction === "rtl" ? "text-right" : "text-left"}`}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("trials.edit") || "Edit Trial Class" : t("trials.create") || "Create Trial Class"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("trials.editDescription") || "Update trial class information"
              : t("trials.createDescription") || "Create a new trial class for a student"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Student Selector */}
          <div className="space-y-2">
            <Label htmlFor="student">{t("trials.student") || "Student"} *</Label>
            <div className="relative student-dropdown-container">
              <Input
                id="student"
                placeholder={t("trials.searchStudent") || "Search student..."}
                value={studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  setShowStudentDropdown(true);
                }}
                onFocus={() => {
                  setShowStudentDropdown(true);
                  if (students.length === 0) {
                    loadAllStudents();
                  }
                }}
                className="w-full"
              />
              {showStudentDropdown && (
                <>
                  {isLoadingStudents && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center">
                      <p className="text-sm text-gray-500">{t("common.loading") || "Loading..."}</p>
                    </div>
                  )}
                  {!isLoadingStudents && students.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {students.map((student) => (
                        <div
                          key={student.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setFormData({ ...formData, student_id: student.id.toString() });
                            setStudentSearch(student.full_name);
                            setShowStudentDropdown(false);
                          }}
                        >
                          {student.full_name}
                        </div>
                      ))}
                    </div>
                  )}
                  {!isLoadingStudents && students.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                      <p className="text-sm text-gray-500 text-center">
                        {t("trials.noStudentsFound") || "No students found"}
                      </p>
                    </div>
                  )}
                </>
              )}
              {selectedStudent && !showStudentDropdown && (
                <div className="mt-2 text-sm text-gray-600">
                  {t("trials.selectedStudent") || "Selected"}: {selectedStudent.full_name}
                </div>
              )}
            </div>
          </div>

          {/* Teacher Selector */}
          <div className="space-y-2">
            <Label htmlFor="teacher">{t("trials.teacher") || "Teacher"} *</Label>
            <Select
              value={formData.teacher_id}
              onValueChange={(value) => {
                setFormData({ 
                  ...formData, 
                  teacher_id: value, 
                  course_id: "", // Clear course when teacher changes
                  start_time: "", 
                  end_time: "" 
                });
              }}
            >
              <SelectTrigger id="teacher" dir="rtl" className={direction === "rtl" ? "text-right" : ""}>
                <SelectValue placeholder={t("trials.selectTeacher") || "Select teacher"} />
              </SelectTrigger>
              <SelectContent dir="rtl" className={direction === "rtl" ? "text-right" : ""}>
                {isLoadingTeachers ? (
                  <SelectItem value="loading" disabled>{t("common.loading") || "Loading..."}</SelectItem>
                ) : (
                  teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.user?.name || `Teacher #${teacher.id}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Course Selector */}
          <div className="space-y-2">
            <Label htmlFor="course">{t("trials.course") || "Course"} *</Label>
            <Select
              value={formData.course_id}
              onValueChange={(value) => setFormData({ ...formData, course_id: value })}
              disabled={!formData.teacher_id || isLoadingCourses}
            >
              <SelectTrigger id="course" dir="rtl" className={direction === "rtl" ? "text-right" : ""}>
                <SelectValue 
                  placeholder={
                    !formData.teacher_id 
                      ? t("trials.selectTeacherFirst") || "Please select a teacher first"
                      : isLoadingCourses
                      ? t("common.loading") || "Loading..."
                      : courses.length === 0
                      ? t("trials.noCoursesForTeacher") || "No courses assigned to this teacher"
                      : t("trials.selectCourse") || "Select course"
                  } 
                />
              </SelectTrigger>
              <SelectContent dir="rtl" className={direction === "rtl" ? "text-right" : ""}>
                {isLoadingCourses ? (
                  <SelectItem value="loading" disabled>{t("common.loading") || "Loading..."}</SelectItem>
                ) : courses.length === 0 ? (
                  <SelectItem value="no-courses" disabled>
                    {t("trials.noCoursesForTeacher") || "No courses assigned to this teacher"}
                  </SelectItem>
                ) : (
                  courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {formData.teacher_id && selectedTeacherCourses.length === 0 && !isLoadingCourses && (
              <p className="text-xs text-amber-600 mt-1">
                {t("trials.teacherHasNoCourses") || "This teacher has no courses assigned. Please assign courses to this teacher first."}
              </p>
            )}
          </div>

          {/* Time Sections - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Time Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/60 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full -mr-16 -mt-16"></div>
              <div className="relative p-5 space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-green-200/50">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <User className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h3 className={cn("font-semibold text-green-900 text-base", direction === "rtl" ? "text-right" : "text-left")}>
                      {t("trials.studentTime") || "Student Time"}
                    </h3>
                    <p className="text-xs text-green-700/70 mt-0.5">
                      {t("trials.studentTimezone") || "Student's local time"}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="student_date" className={cn("text-sm font-medium text-green-900 flex items-center gap-1.5", direction === "rtl" ? "text-right flex-row-reverse" : "text-left")}>
                      <Calendar className="w-4 h-4" />
                      {t("trials.studentDate") || "Date"} *
                    </Label>
                    <Input
                      id="student_date"
                      type="date"
                      value={formData.student_date}
                      onChange={(e) => setFormData({ ...formData, student_date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="bg-white/80 border-green-200 focus:border-green-400 focus:ring-green-400/20"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="student_start_time" className={cn("text-sm font-medium text-green-900 flex items-center gap-1.5", direction === "rtl" ? "text-right flex-row-reverse" : "text-left")}>
                        <Clock className="w-4 h-4" />
                        {t("trials.startTime") || "Start"} *
                      </Label>
                      <Input
                        id="student_start_time"
                        type="time"
                        value={formData.student_start_time}
                        onChange={(e) => setFormData({ ...formData, student_start_time: e.target.value })}
                        required
                        className="bg-white/80 border-green-200 focus:border-green-400 focus:ring-green-400/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="student_end_time" className={cn("text-sm font-medium text-green-900 flex items-center gap-1.5", direction === "rtl" ? "text-right flex-row-reverse" : "text-left")}>
                        <Clock className="w-4 h-4" />
                        {t("trials.endTime") || "End"} *
                      </Label>
                      <Input
                        id="student_end_time"
                        type="time"
                        value={formData.student_end_time}
                        onChange={(e) => setFormData({ ...formData, student_end_time: e.target.value })}
                        required
                        className="bg-white/80 border-green-200 focus:border-green-400 focus:ring-green-400/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher Time Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/60 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16"></div>
              <div className="relative p-5 space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-blue-200/50">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <h3 className={cn("font-semibold text-blue-900 text-base", direction === "rtl" ? "text-right" : "text-left")}>
                      {t("trials.teacherTime") || "Teacher Time"}
                    </h3>
                    <p className="text-xs text-blue-700/70 mt-0.5">
                      {t("trials.teacherTimezone") || "Teacher's local time"}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="teacher_date" className={cn("text-sm font-medium text-blue-900 flex items-center gap-1.5", direction === "rtl" ? "text-right flex-row-reverse" : "text-left")}>
                      <Calendar className="w-4 h-4" />
                      {t("trials.teacherDate") || "Date"} *
                    </Label>
                    <Input
                      id="teacher_date"
                      type="date"
                      value={formData.teacher_date}
                      onChange={(e) => setFormData({ ...formData, teacher_date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="bg-white/80 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="teacher_start_time" className={cn("text-sm font-medium text-blue-900 flex items-center gap-1.5", direction === "rtl" ? "text-right flex-row-reverse" : "text-left")}>
                        <Clock className="w-4 h-4" />
                        {t("trials.startTime") || "Start"} *
                      </Label>
                      <Input
                        id="teacher_start_time"
                        type="time"
                        value={formData.teacher_start_time}
                        onChange={(e) => setFormData({ ...formData, teacher_start_time: e.target.value })}
                        required
                        className="bg-white/80 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="teacher_end_time" className={cn("text-sm font-medium text-blue-900 flex items-center gap-1.5", direction === "rtl" ? "text-right flex-row-reverse" : "text-left")}>
                        <Clock className="w-4 h-4" />
                        {t("trials.endTime") || "End"} *
                      </Label>
                      <Input
                        id="teacher_end_time"
                        type="time"
                        value={formData.teacher_end_time}
                        onChange={(e) => setFormData({ ...formData, teacher_end_time: e.target.value })}
                        required
                        className="bg-white/80 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legacy fields (hidden, for backward compatibility) */}
          <div className="hidden">
            <Input
              id="trial_date"
              type="date"
              value={formData.trial_date || formData.student_date}
              onChange={(e) => setFormData({ ...formData, trial_date: e.target.value })}
            />
            <Input
              id="start_time"
              type="time"
              value={formData.start_time || formData.student_start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />
            <Input
              id="end_time"
              type="time"
              value={formData.end_time || formData.student_end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t("trials.notes") || "Notes"}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder={t("trials.notesPlaceholder") || "Optional notes about this trial class"}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button type="submit" disabled={isLoading} className="min-w-[120px]">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <ModernSpinner size="sm" variant="white" />
                  <span>{t("common.saving") || "Saving..."}</span>
                </div>
              ) : isEdit ? (
                t("common.update") || "Update"
              ) : (
                t("common.create") || "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
