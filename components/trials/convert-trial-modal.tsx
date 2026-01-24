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
import { TrialClass, ConvertTrialRequest, TimeSlot } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { COUNTRIES } from "@/lib/countries-timezones";

interface ConvertTrialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trial: TrialClass | null;
  onConvert: (packageData: ConvertTrialRequest['package'], timetableData: ConvertTrialRequest['timetable']) => Promise<void>;
  isLoading?: boolean;
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

export function ConvertTrialModal({
  open,
  onOpenChange,
  trial,
  onConvert,
  isLoading = false,
}: ConvertTrialModalProps) {
  const { t, direction } = useLanguage();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Package form data
  const [packageData, setPackageData] = useState({
    total_hours: "",
    hour_price: "",
    currency: "USD",
    start_date: "",
  });

  // Timetable form data
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [timeSlots, setTimeSlots] = useState<Record<number, { start: string; end: string }>>({});
  const [studentTimezone, setStudentTimezone] = useState("");
  const [teacherTimezone, setTeacherTimezone] = useState("");

  useEffect(() => {
    if (open && trial) {
      // Initialize with trial data
      setPackageData({
        total_hours: "",
        hour_price: "",
        currency: trial.student?.currency || "USD",
        start_date: new Date().toISOString().split('T')[0],
      });
      setStudentTimezone(trial.student?.timezone || "UTC");
      setTeacherTimezone(trial.teacher?.timezone || "UTC");
      setSelectedDays([]);
      setTimeSlots({});
      setStep(1);
      setError(null);
    }
  }, [open, trial]);

  const handleDayToggle = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
      const newTimeSlots = { ...timeSlots };
      delete newTimeSlots[day];
      setTimeSlots(newTimeSlots);
    } else {
      setSelectedDays([...selectedDays, day]);
      setTimeSlots({
        ...timeSlots,
        [day]: { start: trial?.start_time.substring(0, 5) || "10:00", end: trial?.end_time.substring(0, 5) || "11:00" },
      });
    }
  };

  const handleTimeSlotChange = (day: number, field: "start" | "end", value: string) => {
    setTimeSlots({
      ...timeSlots,
      [day]: {
        ...timeSlots[day],
        [field]: value,
      },
    });
  };

  const validateStep1 = () => {
    return true; // Confirmation step always valid
  };

  const validateStep2 = () => {
    if (!packageData.total_hours || parseFloat(packageData.total_hours) < 0.5) {
      setError(t("trials.convert.validation.totalHours") || "Total hours must be at least 0.5");
      return false;
    }
    if (!packageData.hour_price || parseFloat(packageData.hour_price) < 0) {
      setError(t("trials.convert.validation.hourPrice") || "Hour price must be greater than or equal to 0");
      return false;
    }
    if (!packageData.start_date) {
      setError(t("trials.convert.validation.startDate") || "Start date is required");
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep3 = () => {
    if (selectedDays.length === 0) {
      setError(t("trials.convert.validation.selectDays") || "Please select at least one day");
      return false;
    }
    for (const day of selectedDays) {
      const slot = timeSlots[day];
      if (!slot || !slot.start || !slot.end) {
        setError(t("trials.convert.validation.timeSlots") || "Please fill in time slots for all selected days");
        return false;
      }
      if (slot.end <= slot.start) {
        setError(t("trials.convert.validation.endAfterStart") || "End time must be after start time");
        return false;
      }
    }
    if (!studentTimezone || !teacherTimezone) {
      setError(t("trials.convert.validation.timezones") || "Both timezones are required");
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) {
      return;
    }

    try {
      const formattedTimeSlots: TimeSlot[] = selectedDays.map((day) => ({
        day,
        start: timeSlots[day].start,
        end: timeSlots[day].end,
      }));

      await onConvert(
        {
          total_hours: parseFloat(packageData.total_hours),
          hour_price: parseFloat(packageData.hour_price),
          currency: packageData.currency,
          start_date: packageData.start_date,
        },
        {
          days_of_week: selectedDays,
          time_slots: formattedTimeSlots,
          student_timezone: studentTimezone,
          teacher_timezone: teacherTimezone,
        }
      );
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || t("trials.convert.error") || "Failed to convert trial");
    }
  };

  if (!trial) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-3xl max-h-[90vh] overflow-y-auto ${direction === "rtl" ? "text-right" : "text-left"}`}>
        <DialogHeader>
          <DialogTitle>{t("trials.convert.title") || "Convert Trial to Regular Package"}</DialogTitle>
          <DialogDescription>
            {t("trials.convert.description") || "Create a package and timetable for this student"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > s ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Step 1: Confirmation */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">{t("trials.convert.trialDetails") || "Trial Details"}</h3>
              <div className="space-y-2 text-sm">
                <p><strong>{t("trials.student") || "Student"}:</strong> {trial.student?.full_name}</p>
                <p><strong>{t("trials.teacher") || "Teacher"}:</strong> {trial.teacher?.user?.name || `Teacher #${trial.teacher_id}`}</p>
                <p><strong>{t("trials.course") || "Course"}:</strong> {trial.course?.name}</p>
                <p><strong>{t("trials.trialDate") || "Trial Date"}:</strong> {new Date(trial.trial_date).toLocaleDateString()}</p>
                <p><strong>{t("trials.startTime") || "Start Time"}:</strong> {trial.start_time.substring(0, 5)}</p>
                <p><strong>{t("trials.endTime") || "End Time"}:</strong> {trial.end_time.substring(0, 5)}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {t("trials.convert.confirmMessage") || "Are you sure you want to convert this trial to a regular package and timetable?"}
            </p>
          </div>
        )}

        {/* Step 2: Package Form */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold">{t("trials.convert.packageDetails") || "Package Details"}</h3>
            
            <div className="space-y-2">
              <Label htmlFor="total_hours">{t("trials.convert.totalHours") || "Total Hours"} *</Label>
              <Input
                id="total_hours"
                type="number"
                step="0.5"
                min="0.5"
                value={packageData.total_hours}
                onChange={(e) => setPackageData({ ...packageData, total_hours: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hour_price">{t("trials.convert.hourPrice") || "Hour Price"} *</Label>
              <Input
                id="hour_price"
                type="number"
                min="0"
                step="0.01"
                value={packageData.hour_price}
                onChange={(e) => setPackageData({ ...packageData, hour_price: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">{t("trials.convert.currency") || "Currency"} *</Label>
              <Input
                id="currency"
                value={packageData.currency}
                onChange={(e) => setPackageData({ ...packageData, currency: e.target.value.toUpperCase() })}
                maxLength={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">{t("trials.convert.startDate") || "Start Date"} *</Label>
              <Input
                id="start_date"
                type="date"
                value={packageData.start_date}
                onChange={(e) => setPackageData({ ...packageData, start_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
        )}

        {/* Step 3: Timetable Form */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold">{t("trials.convert.timetableDetails") || "Timetable Details"}</h3>
            
            <div className="space-y-2">
              <Label>{t("trials.convert.daysOfWeek") || "Days of Week"} *</Label>
              <div className="grid grid-cols-2 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={selectedDays.includes(day.value)}
                      onCheckedChange={() => handleDayToggle(day.value)}
                    />
                    <Label htmlFor={`day-${day.value}`} className="cursor-pointer">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {selectedDays.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <Label>{t("trials.convert.timeSlots") || "Time Slots"} *</Label>
                {selectedDays.map((day) => {
                  const dayLabel = DAYS_OF_WEEK.find((d) => d.value === day)?.label;
                  return (
                    <div key={day} className="space-y-2">
                      <Label className="text-sm font-medium">{dayLabel}</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`start-${day}`} className="text-xs">{t("trials.startTime") || "Start"}</Label>
                          <Input
                            id={`start-${day}`}
                            type="time"
                            value={timeSlots[day]?.start || ""}
                            onChange={(e) => handleTimeSlotChange(day, "start", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`end-${day}`} className="text-xs">{t("trials.endTime") || "End"}</Label>
                          <Input
                            id={`end-${day}`}
                            type="time"
                            value={timeSlots[day]?.end || ""}
                            onChange={(e) => handleTimeSlotChange(day, "end", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_timezone">{t("trials.convert.studentTimezone") || "Student Timezone"} *</Label>
                <Input
                  id="student_timezone"
                  value={studentTimezone}
                  onChange={(e) => setStudentTimezone(e.target.value)}
                  placeholder="UTC"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher_timezone">{t("trials.convert.teacherTimezone") || "Teacher Timezone"} *</Label>
                <Input
                  id="teacher_timezone"
                  value={teacherTimezone}
                  onChange={(e) => setTeacherTimezone(e.target.value)}
                  placeholder="UTC"
                  required
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || isLoading}
            >
              {t("common.back") || "Back"}
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t("common.cancel") || "Cancel"}
              </Button>
              {step < 3 ? (
                <Button type="button" onClick={handleNext} disabled={isLoading}>
                  {t("common.next") || "Next"}
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={isLoading}>
                  {isLoading
                    ? t("common.converting") || "Converting..."
                    : t("trials.convert.submit") || "Convert"}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
