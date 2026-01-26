/**
 * Schedule Service
 * Service layer for teacher schedule operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export interface WeeklyScheduleDay {
  day_of_week: number;
  date: string;
  date_formatted: string;
  availability: TeacherAvailabilitySlot[];
  classes: ScheduleClass[];
  trials: ScheduleTrial[];
}

export interface TeacherAvailabilitySlot {
  id: number;
  teacher_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduleClass {
  id: number;
  timetable_id?: number;
  package_id?: number;
  student_id: number;
  teacher_id: number;
  course_id: number;
  class_date: string;
  start_time: string;
  end_time: string;
  duration: number;
  status: string;
  student?: {
    id: number;
    full_name: string;
  };
  course?: {
    id: number;
    name: string;
  };
  timetable?: {
    id: number;
  };
  package?: {
    id: number;
  };
}

export interface ScheduleTrial {
  id: number;
  student_id: number;
  teacher_id: number;
  course_id: number;
  trial_date: string;
  start_time: string;
  end_time: string;
  status: string;
  student?: {
    id: number;
    full_name: string;
  };
  course?: {
    id: number;
    name: string;
  };
}

export interface WeeklyScheduleResponse {
  teacher: {
    id: number;
    name: string;
    timezone: string;
  };
  week_start: string;
  week_end: string;
  schedule: WeeklyScheduleDay[];
  timetables: any[];
}

export class ScheduleService {
  /**
   * Get teacher's weekly schedule
   */
  static async getTeacherWeeklySchedule(
    teacherId: number,
    weekStart?: string
  ): Promise<WeeklyScheduleResponse> {
    const params: any = {};
    if (weekStart) {
      params.week_start = weekStart;
    }

    const response = await apiClient.get<WeeklyScheduleResponse>(
      API_ENDPOINTS.ADMIN.TEACHER_WEEKLY_SCHEDULE(teacherId),
      { params }
    );

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch teacher weekly schedule");
  }
}
