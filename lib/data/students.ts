import { Student, StudentFilters, SortConfig } from "@/types/students";

// Mock student data
export const mockStudents: Student[] = [
  {
    id: "1",
    name: "Ahmed Mohamed",
    email: "ahmed.mohamed@example.com",
    phone: "+20 123 456 7890",
    status: "active",
    enrollmentStatus: "enrolled",
    enrollmentDate: "2024-01-15",
    coursesCount: 5,
    notes: "Excellent student, very engaged",
  },
  {
    id: "2",
    name: "Sarah Ali",
    email: "sarah.ali@example.com",
    phone: "+20 123 456 7891",
    status: "active",
    enrollmentStatus: "enrolled",
    enrollmentDate: "2024-02-20",
    coursesCount: 3,
  },
  {
    id: "3",
    name: "Mohamed Hassan",
    email: "mohamed.hassan@example.com",
    status: "active",
    enrollmentStatus: "enrolled",
    enrollmentDate: "2024-03-10",
    coursesCount: 7,
  },
  {
    id: "4",
    name: "Fatima Ibrahim",
    email: "fatima.ibrahim@example.com",
    phone: "+20 123 456 7892",
    status: "pending",
    enrollmentStatus: "not_enrolled",
    enrollmentDate: "2024-04-05",
    coursesCount: 0,
  },
  {
    id: "5",
    name: "Omar Khaled",
    email: "omar.khaled@example.com",
    status: "active",
    enrollmentStatus: "enrolled",
    enrollmentDate: "2024-01-08",
    coursesCount: 4,
  },
  {
    id: "6",
    name: "Layla Mahmoud",
    email: "layla.mahmoud@example.com",
    phone: "+20 123 456 7893",
    status: "inactive",
    enrollmentStatus: "enrolled",
    enrollmentDate: "2023-12-15",
    coursesCount: 2,
  },
  {
    id: "7",
    name: "Youssef Nasser",
    email: "youssef.nasser@example.com",
    status: "active",
    enrollmentStatus: "enrolled",
    enrollmentDate: "2024-02-28",
    coursesCount: 6,
  },
  {
    id: "8",
    name: "Nour Ahmed",
    email: "nour.ahmed@example.com",
    phone: "+20 123 456 7894",
    status: "active",
    enrollmentStatus: "enrolled",
    enrollmentDate: "2024-03-22",
    coursesCount: 3,
  },
  {
    id: "9",
    name: "Karim Mostafa",
    email: "karim.mostafa@example.com",
    status: "pending",
    enrollmentStatus: "not_enrolled",
    enrollmentDate: "2024-04-12",
    coursesCount: 0,
  },
  {
    id: "10",
    name: "Mariam Salah",
    email: "mariam.salah@example.com",
    phone: "+20 123 456 7895",
    status: "active",
    enrollmentStatus: "enrolled",
    enrollmentDate: "2024-01-30",
    coursesCount: 5,
  },
  {
    id: "11",
    name: "Hassan Tarek",
    email: "hassan.tarek@example.com",
    status: "inactive",
    enrollmentStatus: "enrolled",
    enrollmentDate: "2023-11-20",
    coursesCount: 1,
  },
  {
    id: "12",
    name: "Dina Waleed",
    email: "dina.waleed@example.com",
    phone: "+20 123 456 7896",
    status: "active",
    enrollmentStatus: "enrolled",
    enrollmentDate: "2024-02-14",
    coursesCount: 4,
  },
];

// Filter students based on filters
export function filterStudents(
  students: Student[],
  filters: StudentFilters
): Student[] {
  return students.filter((student) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        (student.phone && student.phone.includes(filters.search));
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status !== "all" && student.status !== filters.status) {
      return false;
    }

    // Enrollment status filter
    if (
      filters.enrollmentStatus !== "all" &&
      student.enrollmentStatus !== filters.enrollmentStatus
    ) {
      return false;
    }

    return true;
  });
}

// Sort students
export function sortStudents(
  students: Student[],
  sortConfig: SortConfig
): Student[] {
  const sorted = [...students];
  const { field, direction } = sortConfig;

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "email":
        comparison = a.email.localeCompare(b.email);
        break;
      case "enrollmentDate":
        comparison =
          new Date(a.enrollmentDate).getTime() -
          new Date(b.enrollmentDate).getTime();
        break;
      case "coursesCount":
        comparison = a.coursesCount - b.coursesCount;
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      default:
        return 0;
    }

    return direction === "asc" ? comparison : -comparison;
  });

  return sorted;
}

// Get student statistics
export function getStudentStats(students: Student[]) {
  const total = students.length;
  const active = students.filter((s) => s.status === "active").length;
  const enrolled = students.filter((s) => s.enrollmentStatus === "enrolled").length;
  
  // Get new enrollments this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newEnrollments = students.filter((s) => {
    const enrollmentDate = new Date(s.enrollmentDate);
    return (
      enrollmentDate.getMonth() === currentMonth &&
      enrollmentDate.getFullYear() === currentYear
    );
  }).length;

  return {
    total,
    active,
    enrolled,
    newEnrollments,
  };
}



