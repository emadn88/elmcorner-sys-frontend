"use client";

import { useState, useEffect } from "react";
import { Clock, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TeacherService } from "@/lib/services/teacher.service";
import { TeacherAvailability } from "@/lib/api/types";

const DAYS = [
  { value: 1, label: "Sunday" },
  { value: 2, label: "Monday" },
  { value: 3, label: "Tuesday" },
  { value: 4, label: "Wednesday" },
  { value: 5, label: "Thursday" },
  { value: 6, label: "Friday" },
  { value: 7, label: "Saturday" },
];

export default function TeacherAvailabilityPage() {
  const { t } = useLanguage();
  const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      const data = await TeacherService.getAvailability();
      setAvailability(data);
    } catch (err: any) {
      setError(err.message || "Failed to load availability");
    } finally {
      setIsLoading(false);
    }
  };

  const addTimeSlot = (dayOfWeek: number) => {
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

  const removeTimeSlot = (id: number) => {
    setAvailability(availability.filter((slot) => slot.id !== id));
  };

  const updateTimeSlot = (id: number, field: string, value: any) => {
    setAvailability(
      availability.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    );
  };

  const handleSave = async () => {
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
      alert("Availability updated successfully");
      await fetchAvailability();
    } catch (err: any) {
      setError(err.message || "Failed to update availability");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("teacher.availability") || "Availability"}
        </h1>
        <p className="text-gray-600 mt-1">
          {t("teacher.setAvailability") || "Set your available days and times"}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {DAYS.map((day) => {
        const daySlots = availability.filter((slot) => slot.day_of_week === day.value);
        return (
          <Card key={day.value}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {day.label}
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addTimeSlot(day.value)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time Slot
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {daySlots.length === 0 ? (
                <p className="text-gray-500 text-sm">No availability set</p>
              ) : (
                <div className="space-y-3">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <input
                        type="time"
                        value={slot.start_time}
                        onChange={(e) =>
                          updateTimeSlot(slot.id, "start_time", e.target.value)
                        }
                        className="px-3 py-2 border rounded"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={slot.end_time}
                        onChange={(e) =>
                          updateTimeSlot(slot.id, "end_time", e.target.value)
                        }
                        className="px-3 py-2 border rounded"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeTimeSlot(slot.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? "Saving..." : "Save Availability"}
        </Button>
      </div>
    </div>
  );
}
