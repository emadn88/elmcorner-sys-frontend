"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Lead, ConvertLeadRequest, Teacher, Course } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { COUNTRIES, getTimezoneForCountry, getCurrencyForCountry } from "@/lib/countries-timezones";
import { TeacherService } from "@/lib/services/teacher.service";
import { CourseService } from "@/lib/services/course.service";
import { cn } from "@/lib/utils";

interface ConvertLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onConvert: (data: ConvertLeadRequest) => Promise<void>;
}

export function ConvertLeadModal({
  open,
  onOpenChange,
  lead,
  onConvert,
}: ConvertLeadModalProps) {
  const { t, direction } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [createTrial, setCreateTrial] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [studentData, setStudentData] = useState({
    full_name: "",
    email: "",
    whatsapp: "",
    country: "",
    currency: "USD",
    timezone: "UTC",
  });

  const [trialData, setTrialData] = useState({
    teacher_id: "",
    course_id: "",
    trial_date: "",
    start_time: "",
    end_time: "",
    notes: "",
  });

  useEffect(() => {
    if (open && lead) {
      setStudentData({
        full_name: lead.name,
        email: "",
        whatsapp: lead.whatsapp,
        country: lead.country || "",
        currency: lead.country ? getCurrencyForCountry(lead.country) : "USD",
        timezone: lead.timezone || (lead.country ? getTimezoneForCountry(lead.country) : "UTC"),
      });
      setTrialData({
        teacher_id: "",
        course_id: "",
        trial_date: "",
        start_time: "",
        end_time: "",
        notes: "",
      });
      setCreateTrial(false);
      setError(null);
    }
  }, [open, lead]);

  useEffect(() => {
    if (open) {
      // Load teachers and courses
      TeacherService.getTeachers()
        .then((response) => setTeachers(response.data || []))
        .catch(() => setTeachers([]));
      
      CourseService.getCourses()
        .then((response) => setCourses(response.data || []))
        .catch(() => setCourses([]));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const convertData: ConvertLeadRequest = {
        student: {
          full_name: studentData.full_name,
          email: studentData.email || undefined,
          whatsapp: studentData.whatsapp || undefined,
          country: studentData.country || undefined,
          currency: studentData.currency,
          timezone: studentData.timezone,
        },
      };

      if (createTrial) {
        if (!trialData.teacher_id || !trialData.course_id || !trialData.trial_date || !trialData.start_time || !trialData.end_time) {
          setError(t("leads.convert.validation.trialRequired") || "Please fill in all trial fields");
          return;
        }
        convertData.trial = {
          teacher_id: parseInt(trialData.teacher_id),
          course_id: parseInt(trialData.course_id),
          trial_date: trialData.trial_date,
          start_time: trialData.start_time,
          end_time: trialData.end_time,
          notes: trialData.notes || undefined,
        };
      }

      await onConvert(convertData);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to convert lead");
    }
  };

  const handleCountryChange = (countryCode: string) => {
    setStudentData({
      ...studentData,
      country: countryCode,
      currency: getCurrencyForCountry(countryCode),
      timezone: getTimezoneForCountry(countryCode),
    });
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("leads.convert.title") || "Convert Lead to Student"}
          </DialogTitle>
          <DialogDescription>
            {t("leads.convert.description") || "Convert this lead to a student and optionally schedule a trial class"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Student Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t("leads.convert.studentInfo") || "Student Information"}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">{t("leads.convert.fullName") || "Full Name"} *</Label>
                <Input
                  id="full_name"
                  value={studentData.full_name}
                  onChange={(e) => setStudentData({ ...studentData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("leads.convert.email") || "Email"}</Label>
                <Input
                  id="email"
                  type="email"
                  value={studentData.email}
                  onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">{t("leads.convert.whatsapp") || "WhatsApp"}</Label>
                <Input
                  id="whatsapp"
                  value={studentData.whatsapp}
                  onChange={(e) => setStudentData({ ...studentData, whatsapp: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">{t("leads.convert.country") || "Country"}</Label>
                <select
                  id="country"
                  value={studentData.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">{t("leads.selectCountry") || "Select country"}</option>
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">{t("leads.convert.currency") || "Currency"}</Label>
                <Input
                  id="currency"
                  value={studentData.currency}
                  onChange={(e) => setStudentData({ ...studentData, currency: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">{t("leads.convert.timezone") || "Timezone"}</Label>
                <Input
                  id="timezone"
                  value={studentData.timezone}
                  onChange={(e) => setStudentData({ ...studentData, timezone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Trial Class Option */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create_trial"
                checked={createTrial}
                onCheckedChange={(checked) => setCreateTrial(checked === true)}
              />
              <Label htmlFor="create_trial" className="font-semibold">
                {t("leads.convert.createTrial") || "Create Trial Class"}
              </Label>
            </div>

            {createTrial && (
              <div className="space-y-4 pl-6 border-l-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacher_id">{t("leads.convert.teacher") || "Teacher"} *</Label>
                    <select
                      id="teacher_id"
                      value={trialData.teacher_id}
                      onChange={(e) => setTrialData({ ...trialData, teacher_id: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      required={createTrial}
                    >
                      <option value="">{t("leads.convert.selectTeacher") || "Select teacher"}</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.user?.name || `Teacher #${teacher.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course_id">{t("leads.convert.course") || "Course"} *</Label>
                    <select
                      id="course_id"
                      value={trialData.course_id}
                      onChange={(e) => setTrialData({ ...trialData, course_id: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      required={createTrial}
                    >
                      <option value="">{t("leads.convert.selectCourse") || "Select course"}</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="trial_date">{t("leads.convert.trialDate") || "Trial Date"} *</Label>
                    <Input
                      id="trial_date"
                      type="date"
                      value={trialData.trial_date}
                      onChange={(e) => setTrialData({ ...trialData, trial_date: e.target.value })}
                      required={createTrial}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">{t("leads.convert.startTime") || "Start Time"} *</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={trialData.start_time}
                      onChange={(e) => setTrialData({ ...trialData, start_time: e.target.value })}
                      required={createTrial}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_time">{t("leads.convert.endTime") || "End Time"} *</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={trialData.end_time}
                      onChange={(e) => setTrialData({ ...trialData, end_time: e.target.value })}
                      required={createTrial}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trial_notes">{t("leads.convert.notes") || "Notes"}</Label>
                  <Input
                    id="trial_notes"
                    value={trialData.notes}
                    onChange={(e) => setTrialData({ ...trialData, notes: e.target.value })}
                    placeholder={t("leads.convert.notesPlaceholder") || "Optional notes for the trial..."}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button type="submit">
              {t("leads.convert.button") || "Convert Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
