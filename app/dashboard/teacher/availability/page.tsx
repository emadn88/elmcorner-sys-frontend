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
import { ClassDetailsModal } from "@/components/teacher/class-details-modal";
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
  const [errorDetails, setErrorDetails] = useState<Record<string, string[]> | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassInstance | null>(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [apologyReason, setApologyReason] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [isAvailabilityCollapsed, setIsAvailabilityCollapsed] = useState(false);
  const [selectedDateEvent, setSelectedDateEvent] = useState<{
    type: 'free' | 'trial' | 'booked';
    date: string;
    startTime: string;
    endTime: string;
    data?: ClassInstance | TrialClass;
  } | null>(null);
  const [isDateEventModalOpen, setIsDateEventModalOpen] = useState(false);
  
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

  // Normalize time format to HH:mm (remove seconds if present)
  const normalizeTime = (time: string): string => {
    if (!time) return "";
    // If time is in HH:mm:ss format, extract HH:mm
    if (time.includes(":") && time.split(":").length === 3) {
      const [hours, minutes] = time.split(":");
      return `${hours}:${minutes}`;
    }
    // If already in HH:mm format, return as is
    return time;
  };

  // Helper function to translate field names to Arabic
  const translateFieldName = (field: string): string => {
    const fieldTranslations: Record<string, string> = {
      'availability': 'التوفر',
      'start_time': 'وقت البداية',
      'end_time': 'وقت النهاية',
      'day_of_week': 'يوم الأسبوع',
      'timezone': 'المنطقة الزمنية',
      'is_available': 'متاح',
    };

    // Handle nested fields like "availability.0.start_time"
    if (field.includes('.')) {
      const parts = field.split('.');
      const lastPart = parts[parts.length - 1];
      const translatedLast = fieldTranslations[lastPart] || lastPart.replace(/_/g, ' ');
      
      // If it's an array index, show it
      if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 2])) {
        const index = parts[parts.length - 2];
        return `التوفر ${parseInt(index) + 1} - ${translatedLast}`;
      }
      return translatedLast;
    }

    return fieldTranslations[field] || field.replace(/_/g, ' ');
  };

  // Helper function to translate validation error messages to Arabic
  const translateErrorMessage = (message: string): string => {
    const errorTranslations: Record<string, string> = {
      // Required field errors
      'field is required': 'الحقل مطلوب',
      'is required': 'مطلوب',
      'required': 'مطلوب',
      
      // Date/Time format errors
      'must match the format': 'يجب أن يطابق الصيغة',
      'must be a valid date': 'يجب أن يكون تاريخاً صحيحاً',
      'must be a valid time': 'يجب أن يكون وقتاً صحيحاً',
      'date_format': 'يجب أن يطابق الصيغة',
      'format': 'يجب أن يطابق الصيغة',
      
      // Date comparison errors
      'must be a date after': 'يجب أن يكون تاريخاً بعد',
      'must be after': 'يجب أن يكون بعد',
      'after': 'يجب أن يكون بعد',
      'must be a date before': 'يجب أن يكون تاريخاً قبل',
      'must be before': 'يجب أن يكون قبل',
      'before': 'يجب أن يكون قبل',
      
      // Type errors
      'must be an integer': 'يجب أن يكون رقماً صحيحاً',
      'must be a number': 'يجب أن يكون رقماً',
      'must be a string': 'يجب أن يكون نصاً',
      'must be an array': 'يجب أن يكون مصفوفة',
      'must be a boolean': 'يجب أن يكون true أو false',
      
      // Range errors
      'must be at least': 'يجب أن يكون على الأقل',
      'must be at most': 'يجب أن يكون على الأكثر',
      'must be between': 'يجب أن يكون بين',
      'must be greater than': 'يجب أن يكون أكبر من',
      'must be less than': 'يجب أن يكون أقل من',
      
      // Other common errors
      'invalid': 'غير صحيح',
      'already exists': 'موجود بالفعل',
      'not found': 'غير موجود',
      'must be unique': 'يجب أن يكون فريداً',
    };

    // Try to find and replace common patterns
    let translated = message;
    
    // Translate common patterns
    for (const [english, arabic] of Object.entries(errorTranslations)) {
      const regex = new RegExp(english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      translated = translated.replace(regex, arabic);
    }

    // Handle specific patterns - must be done before field name translation
    // Pattern: "The availability.0.end_time field must be a date after availability.0.start_time."
    translated = translated.replace(
      /The (.+?) field must be a date after (.+?)\./gi,
      (match, field1, field2) => {
        const translatedField1 = translateFieldName(field1);
        const translatedField2 = translateFieldName(field2);
        return `حقل ${translatedField1} يجب أن يكون تاريخاً بعد ${translatedField2}.`;
      }
    );
    
    // Pattern: "The availability.0.end_time field must be after availability.0.start_time."
    translated = translated.replace(
      /The (.+?) field must be after (.+?)\./gi,
      (match, field1, field2) => {
        const translatedField1 = translateFieldName(field1);
        const translatedField2 = translateFieldName(field2);
        return `حقل ${translatedField1} يجب أن يكون بعد ${translatedField2}.`;
      }
    );
    
    // Pattern: "The availability.0.start_time field must match the format H:i."
    translated = translated.replace(
      /The (.+?) field must match the format (.+?)\./gi,
      (match, field, format) => {
        const translatedField = translateFieldName(field);
        return `حقل ${translatedField} يجب أن يطابق الصيغة ${format}.`;
      }
    );
    
    // Pattern: "The availability.0.start_time field is required."
    translated = translated.replace(
      /The (.+?) field is required\./gi,
      (match, field) => {
        const translatedField = translateFieldName(field);
        return `حقل ${translatedField} مطلوب.`;
      }
    );

    // Translate field names in the message
    Object.entries({
      'availability': 'التوفر',
      'start_time': 'وقت البداية',
      'end_time': 'وقت النهاية',
      'day_of_week': 'يوم الأسبوع',
      'timezone': 'المنطقة الزمنية',
    }).forEach(([en, ar]) => {
      const regex = new RegExp(`\\b${en}\\b`, 'gi');
      translated = translated.replace(regex, ar);
    });

    // Replace field references like "availability.0.start_time" with translated names
    translated = translated.replace(
      /availability\.(\d+)\.(start_time|end_time)/gi,
      (match, index, field) => {
        const fieldName = field === 'start_time' ? 'وقت البداية' : 'وقت النهاية';
        return `التوفر ${parseInt(index) + 1} - ${fieldName}`;
      }
    );

    return translated;
  };

  // Helper function to extract errors from API response
  const extractErrors = (error: any): { message: string; details: Record<string, string[]> | null } => {
    let message = error?.message || getText("teacher.failedToUpdateAvailability");
    let details: Record<string, string[]> | null = null;

    // Check if error has validation errors object
    if (error?.errors && typeof error.errors === 'object') {
      details = {};
      Object.keys(error.errors).forEach((key) => {
        const fieldErrors = error.errors[key];
        const errorArray = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
        // Translate each error message
        details![key] = errorArray.map(err => translateErrorMessage(err));
      });
      // Use first error as main message if available
      const firstErrorKey = Object.keys(error.errors)[0];
      const firstError = error.errors[firstErrorKey];
      if (Array.isArray(firstError) && firstError.length > 0) {
        message = translateErrorMessage(firstError[0]);
      } else if (typeof firstError === 'string') {
        message = translateErrorMessage(firstError);
      }
    }

    // Check if error.response has validation errors (Axios error structure)
    if (error?.response?.data?.errors && typeof error.response.data.errors === 'object') {
      details = {};
      Object.keys(error.response.data.errors).forEach((key) => {
        const fieldErrors = error.response.data.errors[key];
        const errorArray = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
        // Translate each error message
        details![key] = errorArray.map(err => translateErrorMessage(err));
      });
      const firstErrorKey = Object.keys(error.response.data.errors)[0];
      const firstError = error.response.data.errors[firstErrorKey];
      if (Array.isArray(firstError) && firstError.length > 0) {
        message = translateErrorMessage(firstError[0]);
      } else if (typeof firstError === 'string') {
        message = translateErrorMessage(firstError);
      }
    } else if (message) {
      // Translate the main error message as well
      message = translateErrorMessage(message);
    }

    return { message, details };
  };

  // Helper function to format field names for display
  const formatFieldName = (field: string): string => {
    return translateFieldName(field);
  };

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
      
      // Normalize time formats in availability data
      const normalizedAvailability = availabilityData.map((slot) => ({
        ...slot,
        start_time: normalizeTime(slot.start_time),
        end_time: normalizeTime(slot.end_time),
      }));
      
      setAvailability(normalizedAvailability);
      setClasses(classesResponse.classes || []);
      setTrials(trialsResponse.trials || []);
    } catch (err: any) {
      const { message, details } = extractErrors(err);
      setError(message);
      setErrorDetails(details);
      setIsErrorModalOpen(true);
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

  // Helper function to normalize time to HH:mm format for comparison
  const normalizeTimeForComparison = (time: string): string => {
    if (!time) return "";
    // Extract HH:mm from various formats (HH:mm, HH:mm:ss, etc.)
    const match = time.match(/(\d{2}):(\d{2})/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }
    return time;
  };

  // Get all time slots for a specific date from availability
  const getTimeSlotsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
    const slots: Array<{
      startTime: string;
      endTime: string;
      type: 'free' | 'trial' | 'booked';
      data?: ClassInstance | TrialClass;
    }> = [];

    // Get availability slots for this day of week
    const dayAvailability = availability.filter(
      (avail) => avail.day_of_week === dayOfWeek && avail.is_available
    );

    dayAvailability.forEach((avail) => {
      const availStart = normalizeTimeForComparison(avail.start_time);
      const availEnd = normalizeTimeForComparison(avail.end_time);

      // Check if there's a class at this time
      const classAtTime = classes.find(
        (cls) => {
          if (cls.class_date !== dateStr) return false;
          const clsStart = normalizeTimeForComparison(cls.start_time);
          const clsEnd = normalizeTimeForComparison(cls.end_time);
          return clsStart === availStart && clsEnd === availEnd;
        }
      );

      // Check if there's a trial at this time
      const trialAtTime = trials.find(
        (trial) => {
          if (trial.trial_date !== dateStr) return false;
          const trialStart = normalizeTimeForComparison(trial.start_time);
          const trialEnd = normalizeTimeForComparison(trial.end_time);
          return trialStart === availStart && trialEnd === availEnd;
        }
      );

      if (classAtTime) {
        slots.push({
          startTime: avail.start_time,
          endTime: avail.end_time,
          type: 'booked',
          data: classAtTime,
        });
      } else if (trialAtTime) {
        slots.push({
          startTime: avail.start_time,
          endTime: avail.end_time,
          type: 'trial',
          data: trialAtTime,
        });
      } else {
        slots.push({
          startTime: avail.start_time,
          endTime: avail.end_time,
          type: 'free',
        });
      }
    });

    return slots.sort((a, b) => {
      const aStart = normalizeTimeForComparison(a.startTime);
      const bStart = normalizeTimeForComparison(b.startTime);
      return aStart.localeCompare(bStart);
    });
  };

  // Get color for event card based on type
  const getEventCardColor = (type: 'free' | 'trial' | 'booked') => {
    switch (type) {
      case 'free':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30';
      case 'trial':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30';
      case 'booked':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  // Get text color for event card
  const getEventTextColor = (type: 'free' | 'trial' | 'booked') => {
    switch (type) {
      case 'free':
        return 'text-green-800 dark:text-green-200';
      case 'trial':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'booked':
        return 'text-blue-800 dark:text-blue-200';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  };

  // Handle clicking on an event card
  const handleEventCardClick = (event: {
    type: 'free' | 'trial' | 'booked';
    date: string;
    startTime: string;
    endTime: string;
    data?: ClassInstance | TrialClass;
  }) => {
    setSelectedDateEvent(event);
    setIsDateEventModalOpen(true);
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
    // If it's a class, open ClassDetailsModal
    if (event.type === "class" && event.data) {
      setSelectedClass(event.data as ClassInstance);
      setIsClassModalOpen(true);
    } else {
      // For trials, use the existing modal
      setSelectedEvent(event);
      setNewStatus(event.status);
      setIsEventModalOpen(true);
    }
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
      const { message, details } = extractErrors(err);
      setError(message);
      setErrorDetails(details);
      setIsErrorModalOpen(true);
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
      const { message, details } = extractErrors(err);
      setError(message);
      setErrorDetails(details);
      setIsErrorModalOpen(true);
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
    // Normalize time values to HH:mm format
    let normalizedValue = value;
    if ((field === "start_time" || field === "end_time") && value) {
      normalizedValue = normalizeTime(value);
    }
    
    setAvailability(
      availability.map((slot) =>
        slot.id === id ? { ...slot, [field]: normalizedValue } : slot
      )
    );
  };

  const handleSaveAvailability = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setErrorDetails(null);
      await TeacherService.updateAvailability(
        availability.map((slot) => ({
          day_of_week: slot.day_of_week,
          start_time: normalizeTime(slot.start_time),
          end_time: normalizeTime(slot.end_time),
          timezone: slot.timezone,
          is_available: slot.is_available,
        }))
      );
      await fetchData();
    } catch (err: any) {
      const { message, details } = extractErrors(err);
      setError(message);
      setErrorDetails(details);
      setIsErrorModalOpen(true);
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
    <div className="space-y-4 sm:space-y-6 rtl w-full" dir="rtl" style={{ textAlign: 'right', direction: 'rtl', width: '100%' }}>
      <div className="flex items-center justify-between flex-row-reverse w-full">
        <div className="text-right w-full" style={{ textAlign: 'right', width: '100%' }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-right w-full" style={{ textAlign: 'right', width: '100%' }}>
            {getText("teacher.availability")}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 text-right w-full" style={{ textAlign: 'right', width: '100%' }}>
            {getText("teacher.availabilityDescription")}
          </p>
        </div>
      </div>


      {/* Availability Settings - Collapsible */}
      <Card className="text-right rtl" dir="rtl" style={{ textAlign: 'right', direction: 'rtl' }}>
        <CardHeader 
          className="text-right rtl cursor-pointer p-4 sm:p-6" 
          dir="rtl" 
          style={{ textAlign: 'right', direction: 'rtl', width: '100%' }}
          onClick={() => setIsAvailabilityCollapsed(!isAvailabilityCollapsed)}
        >
          <div className="flex items-center justify-between flex-row-reverse w-full gap-2">
            <CardTitle className="flex items-center gap-2 flex-row-reverse text-right flex-1 rtl" dir="rtl" style={{ textAlign: 'right', direction: 'rtl', justifyContent: 'flex-end' }}>
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base text-right" style={{ textAlign: 'right', direction: 'rtl' }}>{getText("teacher.setAvailability")}</span>
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
          <CardContent className="text-right rtl p-4 sm:p-6" dir="rtl" style={{ textAlign: 'right', direction: 'rtl' }}>
            <div className="space-y-3 sm:space-y-4 rtl" dir="rtl" style={{ direction: 'rtl', textAlign: 'right' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 rtl" dir="rtl" style={{ direction: 'rtl' }}>
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
                  <div key={day.value} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 text-right rtl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200" dir="rtl" style={{ textAlign: 'right', direction: 'rtl', width: '100%' }}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 flex-row-reverse w-full gap-2 sm:gap-3" style={{ direction: 'rtl', width: '100%' }}>
                      <h3 className="font-medium text-sm sm:text-base text-right flex-1" style={{ textAlign: 'right', direction: 'rtl' }}>
                        {day.labelAr}
                      </h3>
                      <Button
                        size="sm"
                        onClick={() => addAvailabilitySlot(day.value)}
                        className="flex-row-reverse flex-shrink-0 bg-green-500 hover:bg-green-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                        style={{ direction: 'rtl', flexShrink: 0 }}
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                        <span style={{ textAlign: 'right' }}>{getText("teacher.addTimeSlot")}</span>
                      </Button>
                    </div>
                    {daySlots.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm text-right w-full" style={{ textAlign: 'right', direction: 'rtl', width: '100%' }}>
                        {getText("teacher.noAvailabilitySet")}
                      </p>
                    ) : (
                      <div className="space-y-2 w-full" style={{ direction: 'rtl', width: '100%' }}>
                        {daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex flex-col gap-2 p-2 sm:p-3 border-2 border-blue-200 dark:border-blue-800 rounded-lg w-full bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                            style={{ direction: 'rtl', width: '100%' }}
                          >
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-row-reverse w-full" style={{ direction: 'rtl' }}>
                              {/* From Time */}
                              <div className="flex flex-col gap-1 flex-1 min-w-0">
                                <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 text-right" style={{ textAlign: 'right', direction: 'rtl' }}>
                                  {getText("teacher.fromTime")}
                                </Label>
                                <input
                                  type="time"
                                  value={slot.start_time}
                                  onChange={(e) =>
                                    updateAvailabilitySlot(slot.id, "start_time", e.target.value)
                                  }
                                  className="px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 w-full"
                                  dir="ltr"
                                  style={{ textAlign: 'left', direction: 'ltr' }}
                                />
                              </div>
                              
                              {/* To Time */}
                              <div className="flex flex-col gap-1 flex-1 min-w-0">
                                <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 text-right" style={{ textAlign: 'right', direction: 'rtl' }}>
                                  {getText("teacher.toTime")}
                                </Label>
                                <input
                                  type="time"
                                  value={slot.end_time}
                                  onChange={(e) =>
                                    updateAvailabilitySlot(slot.id, "end_time", e.target.value)
                                  }
                                  className="px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 w-full"
                                  dir="ltr"
                                  style={{ textAlign: 'left', direction: 'ltr' }}
                                />
                              </div>
                              
                              {/* Remove Button */}
                              <div className="flex items-end pb-0 sm:pb-0.5">
                                <Button
                                  size="sm"
                                  onClick={() => removeAvailabilitySlot(slot.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 rounded-md h-9 sm:h-10 w-full sm:w-auto"
                                >
                                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
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
            <div className="flex justify-end flex-row-reverse pt-3 sm:pt-4" style={{ direction: 'rtl', justifyContent: 'flex-start' }}>
              <Button 
                onClick={handleSaveAvailability} 
                disabled={isSaving} 
                size="lg" 
                className="flex-row-reverse bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 px-4 sm:px-6 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto" 
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
        <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6 text-right" style={{ textAlign: 'right' }}>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={getText("teacher.searchEvents")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-right text-sm sm:text-base"
              dir="rtl"
              style={{ textAlign: 'right', direction: 'rtl' }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Week Calendar with Event Cards */}
      <Card className="text-right" style={{ textAlign: 'right' }}>
        <CardHeader className="text-right" style={{ textAlign: 'right' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 flex-row-reverse">
            <CardTitle className="flex items-center gap-2 flex-row-reverse text-right w-full sm:w-auto" style={{ textAlign: 'right', justifyContent: 'flex-start' }}>
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-base sm:text-lg" style={{ textAlign: 'right' }}>{getText("teacher.weekView")}</span>
            </CardTitle>
            <div className="flex items-center gap-1 sm:gap-2 flex-row-reverse w-full sm:w-auto justify-between sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek("prev")}
                className="flex items-center justify-center h-8 px-2 sm:px-3"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <span className="text-xs sm:text-sm font-medium text-right px-1 sm:px-2 flex-1 sm:flex-none sm:min-w-[200px]" style={{ textAlign: 'right', direction: 'rtl' }}>
                {weekDates[0].toLocaleDateString("ar-SA", { 
                  month: "short", 
                  day: "numeric" 
                })} - {weekDates[6].toLocaleDateString("ar-SA", { 
                  month: "short", 
                  day: "numeric" 
                })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek("next")}
                className="flex items-center justify-center h-8 px-2 sm:px-3"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeekStart(new Date())}
                className="flex items-center justify-center h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                {getText("teacher.today")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-right p-4 sm:p-6" style={{ textAlign: 'right' }}>
          <div className="space-y-4" style={{ direction: 'rtl' }}>
            {weekDates.map((date) => {
              const dateStr = date.toISOString().split("T")[0];
              const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
              const dayInfo = DAYS.find((d) => d.value === dayOfWeek);
              const timeSlots = getTimeSlotsForDate(date);
              
              return (
                <div key={dateStr} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-4 flex-row-reverse">
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {dayInfo?.labelAr} - {date.toLocaleDateString("ar-SA", { 
                          month: "long", 
                          day: "numeric",
                          year: "numeric"
                        })}
                      </h3>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {timeSlots.length} {timeSlots.length === 1 ? 'وقت متاح' : 'أوقات متاحة'}
                    </span>
                  </div>
                  
                  {timeSlots.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      لا توجد أوقات متاحة في هذا اليوم
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {timeSlots.map((slot, index) => (
                        <div
                          key={index}
                          onClick={() => handleEventCardClick({
                            type: slot.type,
                            date: dateStr,
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            data: slot.data,
                          })}
                          className={cn(
                            "border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md",
                            getEventCardColor(slot.type)
                          )}
                        >
                          <div className="flex items-center justify-between mb-2 flex-row-reverse">
                            <div className={cn("font-semibold text-sm", getEventTextColor(slot.type))}>
                              {slot.type === 'free' && '⏰ متاح'}
                              {slot.type === 'trial' && '🎯 حصة تجريبية'}
                              {slot.type === 'booked' && '📚 محجوز'}
                            </div>
                            <div className={cn("text-xs font-medium", getEventTextColor(slot.type))}>
                              {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                            </div>
                          </div>
                          
                          {slot.type === 'free' && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 text-right">
                              انقر لعرض التفاصيل
                            </p>
                          )}
                          
                          {slot.type === 'trial' && slot.data && (
                            <div className="mt-2 space-y-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white text-right">
                                {((slot.data as TrialClass).student?.full_name) || 'طالب'}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 text-right">
                                {((slot.data as TrialClass).course?.name) || 'دورة'}
                              </p>
                            </div>
                          )}
                          
                          {slot.type === 'booked' && slot.data && (
                            <div className="mt-2 space-y-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white text-right">
                                {((slot.data as ClassInstance).student?.full_name) || 'طالب'}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 text-right">
                                {((slot.data as ClassInstance).course?.name) || 'دورة'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 text-right">
                                الحالة: {((slot.data as ClassInstance).status === 'pending' ? 'قيد الانتظار' : 
                                         (slot.data as ClassInstance).status === 'attended' ? 'حضر' :
                                         (slot.data as ClassInstance).status === 'absent_student' ? 'غائب' : 
                                         (slot.data as ClassInstance).status)}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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

      {/* Date Event Details Modal */}
      <Dialog open={isDateEventModalOpen} onOpenChange={setIsDateEventModalOpen}>
        <DialogContent className="rtl max-w-2xl" dir="rtl" style={{ textAlign: 'right', direction: 'rtl' }}>
          <DialogHeader className="text-right" style={{ textAlign: 'right' }}>
            <DialogTitle className="text-right" style={{ textAlign: 'right' }}>
              {selectedDateEvent?.type === 'free' && '⏰ وقت متاح'}
              {selectedDateEvent?.type === 'trial' && '🎯 حصة تجريبية'}
              {selectedDateEvent?.type === 'booked' && '📚 حصة محجوزة'}
            </DialogTitle>
            <DialogDescription className="text-right" style={{ textAlign: 'right' }}>
              {selectedDateEvent && (
                <>
                  {new Date(selectedDateEvent.date).toLocaleDateString("ar-SA", { 
                    weekday: "long",
                    month: "long", 
                    day: "numeric",
                    year: "numeric"
                  })}
                  <br />
                  الوقت: {selectedDateEvent.startTime.substring(0, 5)} - {selectedDateEvent.endTime.substring(0, 5)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 text-right" style={{ textAlign: 'right', direction: 'rtl' }}>
            {selectedDateEvent?.type === 'free' && (
              <div className="space-y-3">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">معلومات الوقت المتاح</h4>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p><strong>التاريخ:</strong> {selectedDateEvent && new Date(selectedDateEvent.date).toLocaleDateString("ar-SA", { 
                      weekday: "long",
                      month: "long", 
                      day: "numeric",
                      year: "numeric"
                    })}</p>
                    <p><strong>وقت البداية:</strong> {selectedDateEvent?.startTime.substring(0, 5)}</p>
                    <p><strong>وقت النهاية:</strong> {selectedDateEvent?.endTime.substring(0, 5)}</p>
                    <p className="text-green-700 dark:text-green-300 font-medium mt-3">
                      ✓ هذا الوقت متاح ويمكن حجزه
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedDateEvent?.type === 'trial' && selectedDateEvent.data && (
              <div className="space-y-3">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">معلومات الحصة التجريبية</h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">الطالب:</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {((selectedDateEvent.data as TrialClass).student?.full_name) || 'غير محدد'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">الدورة:</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {((selectedDateEvent.data as TrialClass).course?.name) || 'غير محدد'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">الحالة:</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {((selectedDateEvent.data as TrialClass).status === 'pending' ? 'قيد الانتظار' :
                            (selectedDateEvent.data as TrialClass).status === 'pending_review' ? 'قيد المراجعة' :
                            (selectedDateEvent.data as TrialClass).status === 'completed' ? 'مكتمل' :
                            (selectedDateEvent.data as TrialClass).status === 'no_show' ? 'لم يحضر' :
                            (selectedDateEvent.data as TrialClass).status === 'converted' ? 'تم التحويل' :
                            (selectedDateEvent.data as TrialClass).status)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">التاريخ:</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedDateEvent && new Date(selectedDateEvent.date).toLocaleDateString("ar-SA", { 
                            month: "long", 
                            day: "numeric",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                    </div>
                    {((selectedDateEvent.data as TrialClass).notes) && (
                      <div className="mt-3 pt-3 border-t border-yellow-300 dark:border-yellow-700">
                        <p className="text-gray-600 dark:text-gray-400 mb-1">الملاحظات:</p>
                        <p className="text-gray-900 dark:text-white">{((selectedDateEvent.data as TrialClass).notes)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedDateEvent?.type === 'booked' && selectedDateEvent.data && (
              <div className="space-y-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">معلومات الحصة المحجوزة</h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">الطالب:</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {((selectedDateEvent.data as ClassInstance).student?.full_name) || 'غير محدد'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">الدورة:</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {((selectedDateEvent.data as ClassInstance).course?.name) || 'غير محدد'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">الحالة:</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {((selectedDateEvent.data as ClassInstance).status === 'pending' ? 'قيد الانتظار' :
                            (selectedDateEvent.data as ClassInstance).status === 'attended' ? 'حضر' :
                            (selectedDateEvent.data as ClassInstance).status === 'absent_student' ? 'غائب الطالب' :
                            (selectedDateEvent.data as ClassInstance).status === 'cancelled_by_student' ? 'ملغي من الطالب' :
                            (selectedDateEvent.data as ClassInstance).status === 'cancelled_by_teacher' ? 'ملغي من المعلم' :
                            (selectedDateEvent.data as ClassInstance).status)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">المدة:</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {((selectedDateEvent.data as ClassInstance).duration || 0)} دقيقة
                        </p>
                      </div>
                    </div>
                    {((selectedDateEvent.data as ClassInstance).notes) && (
                      <div className="mt-3 pt-3 border-t border-blue-300 dark:border-blue-700">
                        <p className="text-gray-600 dark:text-gray-400 mb-1">الملاحظات:</p>
                        <p className="text-gray-900 dark:text-white">{((selectedDateEvent.data as ClassInstance).notes)}</p>
                      </div>
                    )}
                    {((selectedDateEvent.data as ClassInstance).class_report) && (
                      <div className="mt-3 pt-3 border-t border-blue-300 dark:border-blue-700">
                        <p className="text-gray-600 dark:text-gray-400 mb-1">تقرير الحصة:</p>
                        <p className="text-gray-900 dark:text-white">{((selectedDateEvent.data as ClassInstance).class_report)}</p>
                      </div>
                    )}
                    {((selectedDateEvent.data as ClassInstance).student_evaluation) && (
                      <div className="mt-3 pt-3 border-t border-blue-300 dark:border-blue-700">
                        <p className="text-gray-600 dark:text-gray-400 mb-1">تقييم الطالب:</p>
                        <p className="text-gray-900 dark:text-white">{((selectedDateEvent.data as ClassInstance).student_evaluation)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex-row-reverse" style={{ direction: 'rtl', justifyContent: 'flex-start' }}>
            <Button
              onClick={() => {
                setIsDateEventModalOpen(false);
                setSelectedDateEvent(null);
              }}
              variant="outline"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={isErrorModalOpen} onOpenChange={setIsErrorModalOpen}>
        <DialogContent className="rtl" dir="rtl" style={{ textAlign: 'right', direction: 'rtl' }}>
          <DialogHeader className="text-right" style={{ textAlign: 'right' }}>
            <DialogTitle className="flex items-center gap-2 text-right" style={{ textAlign: 'right' }}>
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span style={{ textAlign: 'right' }}>خطأ</span>
            </DialogTitle>
            <DialogDescription className="text-right" style={{ textAlign: 'right' }}>
              {error || "حدث خطأ ما"}
            </DialogDescription>
          </DialogHeader>
          
          {errorDetails && Object.keys(errorDetails).length > 0 && (
            <div className="space-y-3 text-right" style={{ textAlign: 'right', direction: 'rtl' }}>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-right" style={{ textAlign: 'right' }}>
                تفاصيل الأخطاء:
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto" style={{ direction: 'rtl' }}>
                {Object.entries(errorDetails).map(([field, errors]) => (
                  <div key={field} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-right" style={{ textAlign: 'right' }}>
                    <div className="font-medium text-red-800 dark:text-red-200 text-sm mb-1" style={{ textAlign: 'right' }}>
                      {formatFieldName(field)}:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-right" style={{ textAlign: 'right', direction: 'rtl' }}>
                      {errors.map((errorMsg, index) => (
                        <li key={index} className="text-sm text-red-700 dark:text-red-300" style={{ textAlign: 'right' }}>
                          {errorMsg}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-row-reverse" style={{ direction: 'rtl', justifyContent: 'flex-start' }}>
            <Button
              onClick={() => {
                setIsErrorModalOpen(false);
                setError(null);
                setErrorDetails(null);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Class Details Modal */}
      {selectedClass && (
        <ClassDetailsModal
          open={isClassModalOpen}
          onOpenChange={(open) => {
            setIsClassModalOpen(open);
            if (!open) setSelectedClass(null);
          }}
          classItem={selectedClass as any}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
}
