/**
 * API Endpoint Constants
 * Note: These are relative paths since apiClient already has baseURL configured
 */

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    ROLES: `/auth/roles`,
    LOGIN: `/auth/login`,
    LOGOUT: `/auth/logout`,
    REFRESH: `/auth/refresh`,
    ME: `/auth/me`,
  },
  
  // Admin - Students
  ADMIN: {
    STUDENTS: `/admin/students`,
    STUDENTS_STATS: `/admin/students/stats`,
    STUDENT: (id: number) => `/admin/students/${id}`,
    
    // Teachers
    TEACHERS: `/admin/teachers`,
    TEACHER: (id: number) => `/admin/teachers/${id}`,
    TEACHER_AVAILABILITY: (id: number) => `/admin/teachers/${id}/availability`,
    TEACHER_MONTHLY_STATS: (id: number) => `/admin/teachers/${id}/monthly-stats`,
    
    // Courses
    COURSES: `/admin/courses`,
    COURSE: (id: number) => `/admin/courses/${id}`,
    
    // Families
    FAMILIES: `/admin/families`,
    FAMILIES_SEARCH: `/admin/families/search`,
    FAMILY: (id: number) => `/admin/families/${id}`,
    
    // Timetables
    TIMETABLES: `/admin/timetables`,
    TIMETABLE: (id: number) => `/admin/timetables/${id}`,
    
    // Classes
    CLASSES: `/admin/classes`,
    CLASS: (id: number) => `/admin/classes/${id}`,
    
    // Packages
    PACKAGES: `/admin/packages`,
    PACKAGES_FINISHED: `/admin/packages/finished`,
    PACKAGES_UNNOTIFIED_COUNT: `/admin/packages/unnotified-count`,
    PACKAGE: (id: number) => `/admin/packages/${id}`,
    PACKAGE_NOTIFY: (id: number) => `/admin/packages/${id}/notify`,
    PACKAGE_BILLS: (id: number) => `/admin/packages/${id}/bills`,
    PACKAGE_PDF: (id: number) => `/admin/packages/${id}/pdf`,
    PACKAGE_CLASSES: (id: number) => `/admin/packages/${id}/classes`,
    PACKAGE_REACTIVATE: (id: number) => `/admin/packages/${id}/reactivate`,
    PACKAGES_BULK_NOTIFY: `/admin/packages/bulk-notify`,
    
    // Trial Classes
    TRIALS: `/admin/trials`,
    TRIALS_STATS: `/admin/trials/stats`,
    TRIAL: (id: number) => `/admin/trials/${id}`,
    TRIAL_STATUS: (id: number) => `/admin/trials/${id}/status`,
    TRIAL_REVIEW: (id: number) => `/admin/trials/${id}/review`,
    TRIAL_CONVERT: (id: number) => `/admin/trials/${id}/convert`,
    
    // Leads
    LEADS: `/admin/leads`,
    LEADS_STATS: `/admin/leads/stats`,
    LEAD: (id: number) => `/admin/leads/${id}`,
    LEAD_STATUS: (id: number) => `/admin/leads/${id}/status`,
    LEADS_BULK_STATUS: `/admin/leads/bulk-status`,
    LEAD_CONVERT: (id: number) => `/admin/leads/${id}/convert`,
    
    // Billing
    BILLS: `/admin/bills`,
    BILL: (id: number) => `/admin/bills/${id}`,
    
    // Expenses
    EXPENSES: `/admin/expenses`,
    EXPENSE: (id: number) => `/admin/expenses/${id}`,
    
    // Duties
    DUTIES: `/admin/duties`,
    DUTY: (id: number) => `/admin/duties/${id}`,
    
    // Reports
    REPORTS: `/admin/reports`,
    REPORT: (id: number) => `/admin/reports/${id}`,
    REPORT_DOWNLOAD: (id: number) => `/admin/reports/${id}/download`,
    REPORT_SEND_WHATSAPP: (id: number) => `/admin/reports/${id}/send-whatsapp`,
    REPORT_GENERATE: `/admin/reports/generate`,
    
    // Analytics
    ANALYTICS_REVENUE: `/admin/analytics/revenue`,
    ANALYTICS_ATTENDANCE: `/admin/analytics/attendance`,
    ANALYTICS_COURSES: `/admin/analytics/courses`,
    ANALYTICS_OVERVIEW: `/admin/analytics/overview`,
    
    // Dashboard
    DASHBOARD: `/admin/dashboard`,
    
    // Settings
    SETTINGS: `/admin/settings`,
    
    // Activity
    ACTIVITY: `/admin/activity`,
    ACTIVITY_STATS: `/admin/activity/stats`,
    ACTIVITY_RECENT: `/admin/activity/recent`,
    ACTIVITY_STUDENTS: `/admin/activity/students`,
    ACTIVITY_REACTIVATE: (id: number) => `/admin/activity/reactivate/${id}`,
    
    // Salaries
    SALARIES: `/admin/salaries`,
    SALARY: (id: number) => `/admin/salaries/${id}`,
    SALARY_STATISTICS: `/admin/salaries/statistics`,
    SALARY_BREAKDOWN: (id: number) => `/admin/salaries/${id}/breakdown`,
    SALARY_HISTORY: (id: number) => `/admin/salaries/${id}/history`,
    SALARY_ALL_HISTORY: `/admin/salaries/all-history`,
    
    // Financials
    FINANCIALS: {
      SUMMARY: `/admin/financials/summary`,
      INCOME: `/admin/financials/income`,
      EXPENSES: `/admin/financials/expenses`,
      TRENDS: `/admin/financials/trends`,
      INCOME_BY_CURRENCY: `/admin/financials/income-by-currency`,
      CONVERT_CURRENCY: `/admin/financials/convert-currency`,
    },
    EXPENSES: `/admin/expenses`,
    EXPENSE: (id: number) => `/admin/expenses/${id}`,
  },
  
  // Teacher
  TEACHER: {
    DASHBOARD: `/teacher/dashboard`,
    CLASSES: `/teacher/classes`,
    CLASS: (id: number) => `/teacher/classes/${id}`,
    CLASS_STATUS: (id: number) => `/teacher/classes/${id}/status`,
    CLASS_ENTER_MEET: (id: number) => `/teacher/classes/${id}/enter-meet`,
    CLASS_END: (id: number) => `/teacher/classes/${id}/end`,
    CLASS_UPDATE: (id: number) => `/teacher/classes/${id}`,
    CLASS_CANCEL: (id: number) => `/teacher/classes/${id}/cancel`,
    STUDENTS: `/teacher/students`,
    DUTIES: `/teacher/duties`,
    PROFILE: `/teacher/profile`,
    PERFORMANCE: `/teacher/performance`,
    AVAILABILITY: `/teacher/availability`,
    CALENDAR: `/teacher/calendar`,
    EVALUATION_OPTIONS: `/teacher/evaluation-options`,
    TRIALS: `/teacher/trials`,
    TRIAL: (id: number) => `/teacher/trials/${id}`,
    TRIAL_SUBMIT_REVIEW: (id: number) => `/teacher/trials/${id}/submit-review`,
  },
  
  // Admin Notifications
  ADMIN_NOTIFICATIONS: {
    LIST: `/admin/notifications`,
    APPROVE_CANCELLATION: (id: number) => `/admin/notifications/class-cancellation/${id}/approve`,
    REJECT_CANCELLATION: (id: number) => `/admin/notifications/class-cancellation/${id}/reject`,
  },
  
  // External (Public)
  EXTERNAL: {
    PAYMENT: (token: string) => `/external/payment/${token}`,
    DUTY: (token: string) => `/external/duty/${token}`,
  },
} as const;
