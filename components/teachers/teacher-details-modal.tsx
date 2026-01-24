"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Teacher } from "@/types/teachers";
import { TeacherService } from "@/lib/services/teacher.service";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Users,
  Clock,
  DollarSign,
  Eye,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface TeacherDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher | null;
}

interface MonthlyStats {
  teacher: {
    id: number;
    name: string;
    email: string;
    hourly_rate: number;
    currency: string;
  };
  month: number;
  year: number;
  stats: {
    total_classes: number;
    attended_classes: number;
    total_hours: number;
    salary: number;
  };
  students: Array<{
    id: number;
    full_name: string;
    email?: string;
    whatsapp?: string;
    status: string;
    country?: string;
    currency?: string;
  }>;
  availability?: Array<{
    id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    timezone: string;
    is_available: boolean;
  }>;
}

export function TeacherDetailsModal({
  open,
  onOpenChange,
  teacher,
}: TeacherDetailsModalProps) {
  const { t, direction } = useLanguage();
  const router = useRouter();
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && teacher) {
      loadStats();
    } else {
      setStats(null);
      setError(null);
    }
  }, [open, teacher]);

  const loadStats = async () => {
    if (!teacher) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await TeacherService.getTeacherMonthlyStats(teacher.id);
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to load teacher statistics");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewStudent = (studentId: number) => {
    router.push(`/dashboard/students/${studentId}`);
    onOpenChange(false);
  };

  const getMonthName = (month: number) => {
    const months = [
      t("common.january") || "January",
      t("common.february") || "February",
      t("common.march") || "March",
      t("common.april") || "April",
      t("common.may") || "May",
      t("common.june") || "June",
      t("common.july") || "July",
      t("common.august") || "August",
      t("common.september") || "September",
      t("common.october") || "October",
      t("common.november") || "November",
      t("common.december") || "December",
    ];
    return months[month - 1] || `Month ${month}`;
  };

  const getDayName = (dayOfWeek: number) => {
    const days = [
      t("common.sunday") || "Sunday",
      t("common.monday") || "Monday",
      t("common.tuesday") || "Tuesday",
      t("common.wednesday") || "Wednesday",
      t("common.thursday") || "Thursday",
      t("common.friday") || "Friday",
      t("common.saturday") || "Saturday",
    ];
    return days[dayOfWeek - 1] || `Day ${dayOfWeek}`;
  };

  const formatTime = (time: string) => {
    // Handle both "HH:mm:ss" and "HH:mm" formats
    const timeStr = time.split(':').slice(0, 2).join(':');
    return timeStr;
  };

  const groupAvailabilityByDay = () => {
    if (!stats?.availability) return {};
    
    const grouped: Record<number, Array<typeof stats.availability[0]>> = {};
    stats.availability.forEach((slot) => {
      if (!grouped[slot.day_of_week]) {
        grouped[slot.day_of_week] = [];
      }
      grouped[slot.day_of_week].push(slot);
    });
    
    return grouped;
  };

  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={cn("text-left rtl:text-right")}>
            {t("teachers.teacherDetails") || "Teacher Details"} - {teacher.user?.name || "N/A"}
          </DialogTitle>
          <DialogDescription className={cn("text-left rtl:text-right")}>
            {stats && `${getMonthName(stats.month)} ${stats.year} - ${t("teachers.monthlyStatistics") || "Monthly Statistics"}`}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && stats && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className={cn(
                    "flex items-center",
                    direction === "rtl" ? "flex-row-reverse justify-between" : "justify-between"
                  )}>
                    <div className={cn("flex-1 min-w-0", direction === "rtl" && "text-right")}>
                      <p className={cn("text-xs font-medium text-gray-600 mb-1", direction === "rtl" && "text-right")}>
                        {t("teachers.totalClasses") || "Total Classes"}
                      </p>
                      <p className={cn("text-2xl font-bold text-gray-900", direction === "rtl" && "text-right")}>
                        {stats.stats.total_classes}
                      </p>
                    </div>
                    <div className={cn(
                      "h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0",
                      direction === "rtl" ? "ml-2" : "mr-2"
                    )}>
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className={cn(
                    "flex items-center",
                    direction === "rtl" ? "flex-row-reverse justify-between" : "justify-between"
                  )}>
                    <div className={cn("flex-1 min-w-0", direction === "rtl" && "text-right")}>
                      <p className={cn("text-xs font-medium text-gray-600 mb-1", direction === "rtl" && "text-right")}>
                        {t("teachers.attendedClasses") || "Attended"}
                      </p>
                      <p className={cn("text-2xl font-bold text-green-600", direction === "rtl" && "text-right")}>
                        {stats.stats.attended_classes}
                      </p>
                    </div>
                    <div className={cn(
                      "h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0",
                      direction === "rtl" ? "ml-2" : "mr-2"
                    )}>
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className={cn(
                    "flex items-center",
                    direction === "rtl" ? "flex-row-reverse justify-between" : "justify-between"
                  )}>
                    <div className={cn("flex-1 min-w-0", direction === "rtl" && "text-right")}>
                      <p className={cn("text-xs font-medium text-gray-600 mb-1", direction === "rtl" && "text-right")}>
                        {t("salaries.totalHours") || "Total Hours"}
                      </p>
                      <p className={cn("text-2xl font-bold text-purple-600", direction === "rtl" && "text-right")}>
                        {stats.stats.total_hours.toFixed(1)}
                      </p>
                    </div>
                    <div className={cn(
                      "h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0",
                      direction === "rtl" ? "ml-2" : "mr-2"
                    )}>
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className={cn(
                    "flex items-center",
                    direction === "rtl" ? "flex-row-reverse justify-between" : "justify-between"
                  )}>
                    <div className={cn("flex-1 min-w-0", direction === "rtl" && "text-right")}>
                      <p className={cn("text-xs font-medium text-gray-600 mb-1", direction === "rtl" && "text-right")}>
                        {t("salaries.salary") || "Salary"}
                      </p>
                      <p className={cn("text-2xl font-bold text-orange-600", direction === "rtl" && "text-right")}>
                        {stats.stats.salary.toFixed(2)} {stats.teacher.currency}
                      </p>
                    </div>
                    <div className={cn(
                      "h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0",
                      direction === "rtl" ? "ml-2" : "mr-2"
                    )}>
                      <DollarSign className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Availability */}
            <div>
              <div className={cn(
                "flex items-center gap-2 mb-4",
                direction === "rtl" && "flex-row-reverse"
              )}>
                <CalendarDays className="h-5 w-5 text-gray-600" />
                <h3 className={cn("text-lg font-semibold text-gray-900", direction === "rtl" && "text-right")}>
                  {t("teachers.weeklyAvailability") || "Weekly Availability"}
                </h3>
              </div>
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  {stats.availability && stats.availability.length > 0 ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => {
                        const daySlots = stats.availability?.filter(
                          (slot) => slot.day_of_week === dayOfWeek
                        ) || [];
                        
                        if (daySlots.length === 0) return null;
                        
                        return (
                          <div
                            key={dayOfWeek}
                            className={cn(
                              "flex items-start gap-4 pb-3 border-b last:border-b-0 last:pb-0",
                              direction === "rtl" && "flex-row-reverse"
                            )}
                          >
                            <div className={cn(
                              "w-24 font-medium text-gray-900 flex-shrink-0",
                              direction === "rtl" && "text-right"
                            )}>
                              {getDayName(dayOfWeek)}
                            </div>
                            <div className={cn(
                              "flex-1 flex flex-wrap gap-2",
                              direction === "rtl" && "flex-row-reverse"
                            )}>
                              {daySlots.map((slot, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1"
                                >
                                  <Clock className={cn("h-3 w-3", direction === "rtl" ? "ml-1" : "mr-1")} />
                                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                  {slot.timezone && slot.timezone !== 'UTC' && (
                                    <span className={cn("ml-1 text-xs", direction === "rtl" && "mr-1 ml-0")}>
                                      ({slot.timezone})
                                    </span>
                                  )}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {t("teachers.noAvailabilitySet") || "No availability set for this teacher"}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Students List */}
            <div>
              <div className={cn(
                "flex items-center justify-between mb-4",
                direction === "rtl" && "flex-row-reverse"
              )}>
                <h3 className={cn("text-lg font-semibold text-gray-900", direction === "rtl" && "text-right")}>
                  {t("teachers.assignedStudents") || "Assigned Students"} ({stats.students.length})
                </h3>
              </div>

              {stats.students.length === 0 ? (
                <div className="text-center py-12 border border-gray-200 rounded-lg">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className={cn("text-gray-500", direction === "rtl" && "text-right")}>
                    {t("teachers.noStudentsAssigned") || "No students assigned"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {stats.students.map((student) => (
                    <Card key={student.id} className="border border-gray-200 hover:border-purple-300 transition-colors">
                      <CardContent className="p-4">
                        <div className={cn(
                          "flex items-start justify-between",
                          direction === "rtl" && "flex-row-reverse"
                        )}>
                          <div className={cn("flex-1 min-w-0", direction === "rtl" && "text-right")}>
                            <div className={cn(
                              "flex items-center gap-2 mb-2",
                              direction === "rtl" && "flex-row-reverse"
                            )}>
                              <h4 className={cn("font-semibold text-gray-900", direction === "rtl" && "text-right")}>
                                {student.full_name}
                              </h4>
                              <Badge
                                variant="outline"
                                className={cn(
                                  student.status === "active" && "bg-green-100 text-green-700 border-green-200",
                                  student.status === "paused" && "bg-yellow-100 text-yellow-700 border-yellow-200",
                                  student.status === "stopped" && "bg-red-100 text-red-700 border-red-200"
                                )}
                              >
                                {t(`students.${student.status}`) || student.status}
                              </Badge>
                            </div>
                            <div className={cn(
                              "flex flex-wrap items-center gap-3 text-sm text-gray-600",
                              direction === "rtl" && "flex-row-reverse"
                            )}>
                              {student.email && (
                                <div className={cn("flex items-center gap-1", direction === "rtl" && "flex-row-reverse")}>
                                  <Mail className="h-3 w-3" />
                                  <span>{student.email}</span>
                                </div>
                              )}
                              {student.whatsapp && (
                                <div className={cn("flex items-center gap-1", direction === "rtl" && "flex-row-reverse")}>
                                  <Phone className="h-3 w-3" />
                                  <span>{student.whatsapp}</span>
                                </div>
                              )}
                              {student.country && (
                                <div className={cn("flex items-center gap-1", direction === "rtl" && "flex-row-reverse")}>
                                  <MapPin className="h-3 w-3" />
                                  <span>{student.country}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className={cn(
                            "flex items-center gap-2",
                            direction === "rtl" && "flex-row-reverse"
                          )}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewStudent(student.id)}
                              className={cn(
                                "gap-2",
                                direction === "rtl" && "flex-row-reverse"
                              )}
                            >
                              <Eye className="h-4 w-4" />
                              {t("teachers.view") || "View"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
