export type StudentStatus = "active" | "inactive" | "pending";
export type EnrollmentStatus = "enrolled" | "not_enrolled";

export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: StudentStatus;
  enrollmentStatus: EnrollmentStatus;
  enrollmentDate: string;
  coursesCount: number;
  avatar?: string;
  notes?: string;
}

export interface StudentFilters {
  search: string;
  status: StudentStatus | "all";
  enrollmentStatus: EnrollmentStatus | "all";
}

export type SortField = "name" | "email" | "enrollmentDate" | "coursesCount" | "status";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}



