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
import { TrialService } from "@/lib/services/trial.service";
import { StudentService } from "@/lib/services/student.service";
import { CourseService } from "@/lib/services/course.service";
import { Student, Course } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { COUNTRIES, getTimezoneForCountry, getCurrencyForCountry } from "@/lib/countries-timezones";
import { Search } from "lucide-react";

interface AddTrialFromScheduleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: number;
  date: string;
  time: string;
  onSuccess: () => void;
}

export function AddTrialFromSchedule({
  open,
  onOpenChange,
  teacherId,
  date,
  time,
  onSuccess,
}: AddTrialFromScheduleProps) {
  const { t, direction } = useLanguage();

  // Student selection mode: 'new' or 'existing'
  const [studentMode, setStudentMode] = useState<"new" | "existing">("existing");

  // Form state
  const [formData, setFormData] = useState({
    student_id: "",
    course_id: "",
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  // Calculate end time (default to 1 hour after start time)
  const calculateEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHour = (hours + 1) % 24;
    return `${endHour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  // Load initial data
  useEffect(() => {
    if (open) {
      loadCourses();
      setFormData({
        student_id: "",
        course_id: "",
        start_time: time.substring(0, 5),
        end_time: calculateEndTime(time),
        notes: "",
      });
      setStudentSearch("");
      setStudents([]);
      setError(null);
    }
  }, [open, time]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (studentMode === "existing" && !formData.student_id) {
      setError(t("trials.error.studentRequired") || "Please select a student");
      return;
    }

    if (studentMode === "new" && !newStudentData.full_name) {
      setError(t("trials.error.studentNameRequired") || "Please enter student name");
      return;
    }

    if (!formData.course_id) {
      setError(t("trials.error.courseRequired") || "Please select a course");
      return;
    }

    if (!formData.start_time || !formData.end_time) {
      setError(t("trials.error.timeRequired") || "Please enter start and end time");
      return;
    }

    try {
      setIsLoading(true);

      const trialData: any = {
        teacher_id: teacherId,
        course_id: parseInt(formData.course_id),
        trial_date: date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        notes: formData.notes || "",
      };

      if (studentMode === "existing") {
        trialData.student_id = parseInt(formData.student_id);
      } else {
        trialData.new_student = {
          ...newStudentData,
          timezone: newStudentData.timezone || getTimezoneForCountry(newStudentData.country) || "UTC",
          currency: newStudentData.currency || getCurrencyForCountry(newStudentData.country) || "USD",
        };
      }

      await TrialService.createTrial(trialData);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || t("trials.error.create") || "Failed to create trial");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = studentSearch.toLowerCase();
    const name = student.full_name?.toLowerCase() || "";
    const email = student.email?.toLowerCase() || "";
    return name.includes(searchLower) || email.includes(searchLower);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={direction}>
        <DialogHeader>
          <DialogTitle>{t("schedule.addTrial") || "Add Trial"}</DialogTitle>
          <DialogDescription>
            {t("schedule.addTrialDescription") || "Create a new trial class for the selected time slot"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date and Time (Read-only) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("trials.trialDate") || "Trial Date"}</Label>
              <Input
                type="date"
                value={date}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{t("trials.startTime") || "Start Time"}</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      start_time: e.target.value,
                      end_time: calculateEndTime(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>{t("trials.endTime") || "End Time"}</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Student Selection */}
          <div>
            <Label>{t("trials.student") || "Student"}</Label>
            <RadioGroup
              value={studentMode}
              onValueChange={(value) => setStudentMode(value as "new" | "existing")}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing" id="existing" />
                <Label htmlFor="existing" className="font-normal cursor-pointer">
                  {t("trials.existingStudent") || "Existing Student"}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new" className="font-normal cursor-pointer">
                  {t("trials.newStudent") || "New Student"}
                </Label>
              </div>
            </RadioGroup>

            {studentMode === "existing" ? (
              <div className="mt-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("trials.searchStudent") || "Search student..."}
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setShowStudentDropdown(true);
                  }}
                  onFocus={() => setShowStudentDropdown(true)}
                  className="pl-9"
                />
                {showStudentDropdown && filteredStudents.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => {
                          setFormData({ ...formData, student_id: student.id.toString() });
                          setStudentSearch(student.full_name || "");
                          setShowStudentDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {student.full_name} {student.email && `(${student.email})`}
                      </div>
                    ))}
                  </div>
                )}
                {formData.student_id && (
                  <div className="mt-2 text-sm text-gray-600">
                    {t("trials.selectedStudent") || "Selected"}:{" "}
                    {students.find((s) => s.id.toString() === formData.student_id)?.full_name}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <Input
                  placeholder={t("trials.studentName") || "Student Name"}
                  value={newStudentData.full_name}
                  onChange={(e) =>
                    setNewStudentData({ ...newStudentData, full_name: e.target.value })
                  }
                />
                <Input
                  type="email"
                  placeholder={t("trials.email") || "Email (optional)"}
                  value={newStudentData.email}
                  onChange={(e) =>
                    setNewStudentData({ ...newStudentData, email: e.target.value })
                  }
                />
                <Input
                  placeholder={t("trials.whatsapp") || "WhatsApp (optional)"}
                  value={newStudentData.whatsapp}
                  onChange={(e) =>
                    setNewStudentData({ ...newStudentData, whatsapp: e.target.value })
                  }
                />
                <Select
                  value={newStudentData.country}
                  onValueChange={(value) => {
                    const timezone = getTimezoneForCountry(value) || "UTC";
                    const currency = getCurrencyForCountry(value) || "USD";
                    setNewStudentData({
                      ...newStudentData,
                      country: value,
                      timezone,
                      currency,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("trials.country") || "Country (optional)"} />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Course Selection */}
          <div>
            <Label>{t("trials.course") || "Course"} *</Label>
            <Select
              value={formData.course_id}
              onValueChange={(value) => setFormData({ ...formData, course_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("trials.selectCourse") || "Select course"} />
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

          {/* Notes */}
          <div>
            <Label>{t("trials.notes") || "Notes (optional)"}</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t("trials.notesPlaceholder") || "Add any additional notes..."}
              rows={3}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? t("common.creating") || "Creating..."
                : t("common.create") || "Create Trial"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
