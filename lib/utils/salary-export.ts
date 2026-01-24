/**
 * Utility functions for salary export and currency conversion
 */

import { TeacherSalary, SalaryBreakdown } from "@/types/salaries";

/**
 * Convert USD amount to EGP
 */
export function convertToEGP(amount: number, rate: number): number {
  return Math.round(amount * rate * 100) / 100;
}

/**
 * Export salaries to Excel (CSV format)
 */
export function exportSalariesToExcel(
  salaries: TeacherSalary[],
  breakdowns: Map<number, SalaryBreakdown>,
  shouldConvertToEGP: boolean = false,
  usdToEgpRate: number = 30
): void {
  // Prepare data
  const rows: string[][] = [];
  
  // Headers
  rows.push([
    "Teacher Name",
    "Teacher Email",
    "Hourly Rate",
    "Currency",
    "Total Hours",
    "Total Classes",
    "Salary",
    "Status",
  ]);

  // Add salary rows
  salaries.forEach((salary) => {
    let hourlyRate = salary.hourly_rate;
    let salaryAmount = salary.salary;
    let currency = salary.currency;

    if (shouldConvertToEGP && salary.currency === "USD") {
      hourlyRate = convertToEGP(salary.hourly_rate, usdToEgpRate);
      salaryAmount = convertToEGP(salary.salary, usdToEgpRate);
      currency = "EGP";
    }

    rows.push([
      salary.teacher_name,
      salary.teacher_email,
      hourlyRate.toFixed(2),
      currency,
      salary.total_hours.toFixed(2),
      salary.total_classes.toString(),
      salaryAmount.toFixed(2),
      salary.status,
    ]);
  });

  // Add breakdown details
  if (breakdowns.size > 0) {
    rows.push([]); // Empty row
    rows.push(["Detailed Breakdown"]); // Section header
    rows.push([
      "Teacher Name",
      "Class Date",
      "Student Name",
      "Course Name",
      "Duration (Hours)",
      "Hourly Rate",
      "Salary",
      "Currency",
    ]);

    breakdowns.forEach((breakdown) => {
      breakdown.classes.forEach((classItem) => {
        let hourlyRate = classItem.hourly_rate;
        let salaryAmount = classItem.salary;
        let currency = breakdown.currency;

        if (shouldConvertToEGP && breakdown.currency === "USD") {
          hourlyRate = convertToEGP(classItem.hourly_rate, usdToEgpRate);
          salaryAmount = convertToEGP(classItem.salary, usdToEgpRate);
          currency = "EGP";
        }

        rows.push([
          breakdown.teacher_name,
          classItem.class_date,
          classItem.student_name,
          classItem.course_name,
          classItem.duration_hours.toFixed(2),
          hourlyRate.toFixed(2),
          salaryAmount.toFixed(2),
          currency,
        ]);
      });
    });
  }

  // Convert to CSV
  const csvContent = rows
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `salaries-export-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
