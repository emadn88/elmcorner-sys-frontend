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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TrialClass, TeacherAvailability } from "@/lib/api/types";
import { StudentService } from "@/lib/services/student.service";
import { TeacherService } from "@/lib/services/teacher.service";
import { CourseService } from "@/lib/services/course.service";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { Student, Teacher, Course } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { COUNTRIES, getTimezoneForCountry, getCurrencyForCountry } from "@/lib/countries-timezones";

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

  // Student selection mode: 'new' or 'existing'
  const [studentMode, setStudentMode] = useState<"new" | "existing">("new");

  // Form state
  const [formData, setFormData] = useState({
    student_id: "",
    teacher_id: "",
    course_id: "",
    trial_date: "",
    start_time: "",
    end_time: "",
    notes: "",
  });

  // New student form data
  const [newStudentData, setNewStudentData] = useState({
    full_name: "",
    email: "",
    whatsapp: "",
    country: "",
    currency: "USD",
    timezone: "UTC",
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teacherAvailability, setTeacherAvailability] = useState<TeacherAvailabilitySlot[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // Load initial data
  useEffect(() => {
    if (open) {
      loadTeachers();
      loadCourses();
      if (trial) {
        setStudentMode("existing");
        setFormData({
          student_id: trial.student_id.toString(),
          teacher_id: trial.teacher_id.toString(),
          course_id: trial.course_id.toString(),
          trial_date: trial.trial_date.split('T')[0],
          start_time: trial.start_time.substring(0, 5),
          end_time: trial.end_time.substring(0, 5),
          notes: trial.notes || "",
        });
        if (trial.student) {
          setStudents([trial.student]);
        }
        if (trial.teacher_id) {
          loadTeacherAvailability(trial.teacher_id);
        }
      } else {
        setStudentMode("new");
        setFormData({
          student_id: "",
          teacher_id: "",
          course_id: "",
          trial_date: new Date().toISOString().split('T')[0],
          start_time: "",
          end_time: "",
          notes: "",
        });
        setNewStudentData({
          full_name: "",
          email: "",
          whatsapp: "",
          country: "",
          currency: "USD",
          timezone: "UTC",
        });
        setStudents([]);
        setTeacherAvailability([]);
      }
      setError(null);
    }
  }, [open, trial]);

  // Load students on search
  useEffect(() => {
    if (open && studentSearch && studentMode === "existing") {
      setIsLoadingStudents(true);
      StudentService.getStudents({ search: studentSearch, per_page: 10 })
        .then((response) => {
          setStudents(response.data);
        })
        .catch(() => {
          setStudents([]);
        })
        .finally(() => setIsLoadingStudents(false));
    } else if (open && !studentSearch && studentMode === "existing") {
      setStudents([]);
    }
  }, [studentSearch, open, studentMode]);

  // Load teacher availability when teacher is selected
  useEffect(() => {
    if (formData.teacher_id) {
      loadTeacherAvailability(parseInt(formData.teacher_id));
    } else {
      setTeacherAvailability([]);
    }
  }, [formData.teacher_id]);

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
      setCourses(response.data);
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
        API_ENDPOINTS.ADMIN.TEACHER(teacherId) + "/availability"
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

  const handleAvailabilitySlotSelect = (slot: TeacherAvailabilitySlot) => {
    setFormData({
      ...formData,
      start_time: slot.start_time.substring(0, 5),
      end_time: slot.end_time.substring(0, 5),
    });
  };

  const handleCountryChange = (countryName: string) => {
    const country = COUNTRIES.find((c) => c.name === countryName);
    if (country) {
      setNewStudentData({
        ...newStudentData,
        country: country.name,
        currency: getCurrencyForCountry(country.code) || "USD",
        timezone: getTimezoneForCountry(country.code) || "UTC",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate based on student mode
    if (studentMode === "new") {
      if (!newStudentData.full_name) {
        setError(t("trials.validation.studentNameRequired") || "Student name is required");
        return;
      }
    } else {
      if (!formData.student_id) {
        setError(t("trials.validation.studentRequired") || "Please select a student");
        return;
      }
    }

    if (!formData.teacher_id || !formData.course_id || !formData.trial_date || !formData.start_time || !formData.end_time) {
      setError(t("trials.validation.required") || "All required fields must be filled");
      return;
    }

    if (formData.end_time <= formData.start_time) {
      setError(t("trials.validation.endTimeAfterStart") || "End time must be after start time");
      return;
    }

    try {
      const trialData: Partial<TrialClass> & { new_student?: Partial<Student> } = {
        teacher_id: parseInt(formData.teacher_id),
        course_id: parseInt(formData.course_id),
        trial_date: formData.trial_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        notes: formData.notes || undefined,
      };

      if (studentMode === "new") {
        trialData.new_student = newStudentData;
      } else {
        trialData.student_id = parseInt(formData.student_id);
      }

      await onSave(trialData);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || t("trials.error.save") || "Failed to save trial");
    }
  };

  const selectedStudent = students.find((s) => s.id.toString() === formData.student_id);
  
  // Group availability by day
  const availabilityByDay = teacherAvailability.reduce((acc, slot) => {
    if (!acc[slot.day_of_week]) {
      acc[slot.day_of_week] = [];
    }
    acc[slot.day_of_week].push(slot);
    return acc;
  }, {} as Record<number, TeacherAvailabilitySlot[]>);

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

          {/* Student Selection Mode */}
          {!isEdit && (
            <div className="space-y-2">
              <Label>{t("trials.studentMode") || "Student"}</Label>
              <RadioGroup
                value={studentMode}
                onValueChange={(value) => setStudentMode(value as "new" | "existing")}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="new-student" />
                  <Label htmlFor="new-student" className="cursor-pointer">
                    {t("trials.newStudent") || "New Student"}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="existing" id="existing-student" />
                  <Label htmlFor="existing-student" className="cursor-pointer">
                    {t("trials.existingStudent") || "Existing Student"}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* New Student Form */}
          {studentMode === "new" && !isEdit && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-semibold">{t("trials.newStudentInfo") || "New Student Information"}</h3>
              
              <div className="space-y-2">
                <Label htmlFor="full_name">{t("trials.studentName") || "Full Name"} *</Label>
                <Input
                  id="full_name"
                  value={newStudentData.full_name}
                  onChange={(e) => setNewStudentData({ ...newStudentData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("trials.email") || "Email"}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStudentData.email}
                    onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">{t("trials.whatsapp") || "WhatsApp"}</Label>
                  <Input
                    id="whatsapp"
                    value={newStudentData.whatsapp}
                    onChange={(e) => setNewStudentData({ ...newStudentData, whatsapp: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">{t("trials.country") || "Country"}</Label>
                <Select
                  value={newStudentData.country}
                  onValueChange={handleCountryChange}
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder={t("trials.selectCountry") || "Select country"} />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Existing Student Selector */}
          {studentMode === "existing" && (
            <div className="space-y-2">
              <Label htmlFor="student">{t("trials.student") || "Student"} *</Label>
              <div className="relative">
                <Input
                  id="student"
                  placeholder={t("trials.searchStudent") || "Search student..."}
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full"
                />
                {studentSearch && students.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setFormData({ ...formData, student_id: student.id.toString() });
                          setStudentSearch(student.full_name);
                          setStudents([]);
                        }}
                      >
                        {student.full_name}
                      </div>
                    ))}
                  </div>
                )}
                {selectedStudent && (
                  <div className="mt-2 text-sm text-gray-600">
                    {t("trials.selectedStudent") || "Selected"}: {selectedStudent.full_name}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Teacher Selector */}
          <div className="space-y-2">
            <Label htmlFor="teacher">{t("trials.teacher") || "Teacher"} *</Label>
            <Select
              value={formData.teacher_id}
              onValueChange={(value) => setFormData({ ...formData, teacher_id: value, start_time: "", end_time: "" })}
            >
              <SelectTrigger id="teacher">
                <SelectValue placeholder={t("trials.selectTeacher") || "Select teacher"} />
              </SelectTrigger>
              <SelectContent>
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

          {/* Teacher Availability */}
          {formData.teacher_id && (
            <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label>{t("trials.teacherAvailability") || "Teacher Available Times"}</Label>
              {isLoadingAvailability ? (
                <p className="text-sm text-gray-600">{t("common.loading") || "Loading..."}</p>
              ) : teacherAvailability.length === 0 ? (
                <p className="text-sm text-yellow-600">
                  {t("trials.noAvailability") || "This teacher has not set their availability yet"}
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(availabilityByDay).map(([day, slots]) => {
                    const dayLabel = DAYS_OF_WEEK.find((d) => d.value === parseInt(day))?.label;
                    return (
                      <div key={day} className="space-y-1">
                        <div className="font-medium text-sm">{dayLabel}</div>
                        <div className="flex flex-wrap gap-2">
                          {slots.map((slot) => (
                            <Button
                              key={slot.id}
                              type="button"
                              variant={
                                formData.start_time === slot.start_time.substring(0, 5) &&
                                formData.end_time === slot.end_time.substring(0, 5)
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => handleAvailabilitySlotSelect(slot)}
                            >
                              {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
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

          {/* Course Selector */}
          <div className="space-y-2">
            <Label htmlFor="course">{t("trials.course") || "Course"} *</Label>
            <Select
              value={formData.course_id}
              onValueChange={(value) => setFormData({ ...formData, course_id: value })}
            >
              <SelectTrigger id="course">
                <SelectValue placeholder={t("trials.selectCourse") || "Select course"} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCourses ? (
                  <SelectItem value="loading" disabled>{t("common.loading") || "Loading..."}</SelectItem>
                ) : (
                  courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Trial Date */}
          <div className="space-y-2">
            <Label htmlFor="trial_date">{t("trials.trialDate") || "Trial Date"} *</Label>
            <Input
              id="trial_date"
              type="date"
              value={formData.trial_date}
              onChange={(e) => setFormData({ ...formData, trial_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">{t("trials.startTime") || "Start Time"} *</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">{t("trials.endTime") || "End Time"} *</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? t("common.saving") || "Saving..."
                : isEdit
                ? t("common.update") || "Update"
                : t("common.create") || "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
