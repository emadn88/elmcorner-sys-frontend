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
    TEACHER_AVAILABLE_TIME_SLOTS: (id: number) => `/admin/teachers/${id}/available-time-slots`,
    TEACHER_MONTHLY_STATS: (id: number) => `/admin/teachers/${id}/monthly-stats`,
    TEACHER_WEEKLY_SCHEDULE: (id: number) => `/admin/teachers/${id}/weekly-schedule`,
    TEACHER_CREDENTIALS: (id: number) => `/admin/teachers/${id}/credentials`,
    TEACHER_RATE_DETAILS: (id: number) => `/admin/teachers/${id}/rate-details`,
    TEACHER_RATE_DETAILS_PDF: (id: number) => `/admin/teachers/${id}/rate-details/pdf`,
    TEACHER_SEND_CREDENTIALS_WHATSAPP: (id: number) => `/admin/teachers/${id}/send-credentials-whatsapp`,
    TEACHERS_AVAILABLE: `/admin/teachers/available`,
    
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
    CLASSES_EXPORT_PDF: `/admin/classes/export/pdf`,
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
    PACKAGE_MARK_PAID: (id: number) => `/admin/packages/${id}/mark-paid`,
    PACKAGE_NOTIFICATION_HISTORY: (id: number) => `/admin/packages/${id}/notification-history`,
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
    BILLS_STATISTICS: `/admin/bills/statistics`,
    BILL: (id: number) => `/admin/bills/${id}`,
    BILL_MARK_PAID: (id: number) => `/admin/bills/${id}/mark-paid`,
    BILL_SEND_WHATSAPP: (id: number) => `/admin/bills/${id}/send-whatsapp`,
    BILL_PDF: (id: number) => `/admin/bills/${id}/pdf`,
    BILL_GENERATE_TOKEN: (id: number) => `/admin/bills/${id}/generate-token`,
    
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
    
    // Users
    USERS: `/admin/users`,
    USER: (id: number) => `/admin/users/${id}`,
    USER_STATUS: (id: number) => `/admin/users/${id}/status`,
    
    // Roles
    ROLES: `/admin/roles`,
    ROLE: (id: number) => `/admin/roles/${id}`,
    ROLE_PERMISSIONS: (id: number) => `/admin/roles/${id}/permissions`,
    ROLES_PERMISSIONS_ALL: `/admin/roles/permissions/all`,
    ROLES_PAGES_PERMISSIONS: `/admin/roles/pages-permissions`,
    
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
    MONTHLY_RATE_DETAILS: `/teacher/monthly-rate-details`,
    CLASSES: `/teacher/classes`,
    CLASS: (id: number) => `/teacher/classes/${id}`,
    CLASS_STATUS: (id: number) => `/teacher/classes/${id}/status`,
    CLASS_ENTER_MEET: (id: number) => `/teacher/classes/${id}/enter-meet`,
    CLASS_END: (id: number) => `/teacher/classes/${id}/end`,
    CLASS_UPDATE: (id: number) => `/teacher/classes/${id}`,
    CLASS_CANCEL: (id: number) => `/teacher/classes/${id}/cancel`,
    CLASS_REPORT: (id: number) => `/teacher/classes/${id}/report`,
    CLASS_CANCEL_REQUEST: (id: number) => `/teacher/classes/${id}/cancel-request`,
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
    ALL_CANCELLATION_REQUESTS: `/admin/notifications/class-cancellations/all`,
    APPROVE_CANCELLATION: (id: number) => `/admin/notifications/class-cancellation/${id}/approve`,
    REJECT_CANCELLATION: (id: number) => `/admin/notifications/class-cancellation/${id}/reject`,
  },
  
  // External (Public)
  EXTERNAL: {
    PAYMENT: (token: string) => `/external/payment/${token}`,
    PAYMENT_PDF: (token: string) => `/external/payment/${token}/pdf`,
    PAYMENT_PROCESS: (token: string) => `/external/payment/${token}/process`,
    PAYMENT_PAYPAL_CREATE: (token: string) => `/external/payment/${token}/paypal/create`,
    PAYMENT_PAYPAL_EXECUTE: (token: string) => `/external/payment/${token}/paypal/execute`,
    PAYMENT_PAYPAL_ORDER: (token: string) => `/external/payment/${token}/paypal/orders`,
    PAYMENT_PAYPAL_CAPTURE: (token: string) => `/external/payment/${token}/paypal/orders/capture`,
    DUTY: (token: string) => `/external/duty/${token}`,
  },
} as const;
