"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, User, BookOpen, TrendingUp, Calendar, Users, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TeacherService } from "@/lib/services/teacher.service";
import { TeacherProfile } from "@/types/teachers";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

type TabId = "personal" | "courses" | "performance" | "schedule" | "students" | "activity";

export default function TeacherProfilePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, direction } = useLanguage();
  const teacherId = Number(params.id);
  const initialTab = (searchParams.get("tab") as TabId) || "personal";

  const tabs: { id: TabId; labelKey: string; icon: any }[] = [
    { id: "personal", labelKey: "teachers.personalInfo", icon: User },
    { id: "courses", labelKey: "teachers.courses", icon: BookOpen },
    { id: "performance", labelKey: "teachers.performance", icon: TrendingUp },
    { id: "schedule", labelKey: "teachers.schedule", icon: Calendar },
    { id: "students", labelKey: "teachers.assignedStudents", icon: Users },
    { id: "activity", labelKey: "teachers.activityTimeline", icon: Activity },
  ];

  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (teacherId) {
      loadProfile();
    }
  }, [teacherId]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await TeacherService.getTeacher(teacherId);
      setProfile(data);
    } catch (err: any) {
      setError(err.message || "Failed to load teacher profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className={cn("text-red-600", direction === "rtl" && "text-right")}>
          {error || t("teachers.teacherNotFound") || "Teacher not found"}
        </p>
        <Button onClick={() => router.push("/dashboard/teachers")}>
          <ArrowLeft className={cn("h-4 w-4", direction === "rtl" ? "ml-2" : "mr-2")} />
          {t("teachers.backToTeachers") || "Back to Teachers"}
        </Button>
      </div>
    );
  }

  const { teacher, stats } = profile;

  return (
    <div className={cn("space-y-6", direction === "rtl" && "rtl")}>
      {/* Header */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
        <CardContent className="p-6">
          <div className={cn("flex items-start", direction === "rtl" ? "flex-row-reverse" : "")}>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 flex-shrink-0"
              onClick={() => router.push("/dashboard/teachers")}
            >
              {direction === "rtl" ? (
                <ArrowRight className="h-4 w-4" />
              ) : (
                <ArrowLeft className="h-4 w-4" />
              )}
            </Button>
            <div className={cn("flex-1 min-w-0", direction === "rtl" ? "text-right mr-6" : "ml-6")}>
              <div className={cn("flex items-center mb-2", direction === "rtl" ? "flex-row-reverse gap-3 justify-end" : "gap-3")}>
                <h1 className={cn("text-3xl font-bold text-gray-900", direction === "rtl" && "text-right")}>
                  {teacher.user?.name || t("teachers.teacher") || "Teacher"}
                </h1>
                <Badge className={cn(
                  "border flex-shrink-0",
                  teacher.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'
                )}>
                  {t(`teachers.${teacher.status}`) || teacher.status}
                </Badge>
              </div>
              <div className={cn(
                "flex flex-wrap items-center text-sm text-gray-600",
                direction === "rtl" ? "flex-row-reverse gap-4 justify-end" : "gap-4"
              )}>
                {teacher.user?.email && (
                  <div className={cn("flex items-center", direction === "rtl" ? "flex-row-reverse gap-2" : "gap-2")}>
                    <span className={cn(direction === "rtl" && "text-right")}>{teacher.user.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className={cn("flex overflow-x-auto border-b", direction === "rtl" && "flex-row-reverse")}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center px-6 py-4 border-b-2 transition-all relative",
                    direction === "rtl" ? "space-x-reverse space-x-2" : "space-x-2",
                    isActive
                      ? "border-purple-500 text-purple-600 bg-purple-50/50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive && "text-purple-600")} />
                  <span className="font-medium whitespace-nowrap">{t(tab.labelKey) || tab.labelKey}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <Card className="p-6">
        {activeTab === "personal" && (
          <div className="space-y-4">
            <h2 className={cn("text-xl font-semibold", direction === "rtl" && "text-right")}>
              {t("teachers.personalInformation") || "Personal Information"}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className={cn(direction === "rtl" && "text-right")}>
                <label className={cn("text-sm font-medium text-gray-500 block mb-1", direction === "rtl" && "text-right")}>
                  {t("teachers.hourlyRate") || "Hourly Rate"}
                </label>
                <p className={cn("text-lg", direction === "rtl" && "text-right")}>
                  {teacher.hourly_rate} {teacher.currency}
                </p>
              </div>
              <div className={cn(direction === "rtl" && "text-right")}>
                <label className={cn("text-sm font-medium text-gray-500 block mb-1", direction === "rtl" && "text-right")}>
                  {t("teachers.timezone") || "Timezone"}
                </label>
                <p className={cn("text-lg", direction === "rtl" && "text-right")}>
                  {teacher.timezone}
                </p>
              </div>
              {teacher.bio && (
                <div className={cn("col-span-2", direction === "rtl" && "text-right")}>
                  <label className={cn("text-sm font-medium text-gray-500 block mb-1", direction === "rtl" && "text-right")}>
                    {t("teachers.bio") || "Bio"}
                  </label>
                  <p className={cn("text-lg", direction === "rtl" && "text-right")}>
                    {teacher.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="space-y-4">
            <h2 className={cn("text-xl font-semibold", direction === "rtl" && "text-right")}>
              {t("teachers.assignedCourses") || "Assigned Courses"}
            </h2>
            {teacher.courses && teacher.courses.length > 0 ? (
              <div className="space-y-2">
                {teacher.courses.map((course) => (
                  <div key={course.id} className={cn("p-3 border rounded-lg", direction === "rtl" && "text-right")}>
                    <p className="font-medium">{course.name}</p>
                    {course.category && (
                      <p className="text-sm text-gray-500">{course.category}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className={cn("text-gray-500", direction === "rtl" && "text-right")}>
                {t("teachers.noCoursesAssigned") || "No courses assigned"}
              </p>
            )}
          </div>
        )}

        {activeTab === "performance" && (
          <div className="space-y-4">
            <h2 className={cn("text-xl font-semibold", direction === "rtl" && "text-right")}>
              {t("teachers.performanceMetrics") || "Performance Metrics"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className={cn("p-4 border rounded-lg", direction === "rtl" && "text-right")}>
                <p className={cn("text-sm text-gray-500 mb-2", direction === "rtl" && "text-right")}>
                  {t("teachers.totalClasses") || "Total Classes"}
                </p>
                <p className={cn("text-2xl font-bold", direction === "rtl" && "text-right")}>
                  {stats.total_classes}
                </p>
              </div>
              <div className={cn("p-4 border rounded-lg", direction === "rtl" && "text-right")}>
                <p className={cn("text-sm text-gray-500 mb-2", direction === "rtl" && "text-right")}>
                  {t("teachers.attendedClasses") || "Attended Classes"}
                </p>
                <p className={cn("text-2xl font-bold", direction === "rtl" && "text-right")}>
                  {stats.attended_classes}
                </p>
              </div>
              <div className={cn("p-4 border rounded-lg", direction === "rtl" && "text-right")}>
                <p className={cn("text-sm text-gray-500 mb-2", direction === "rtl" && "text-right")}>
                  {t("teachers.studentCount") || "Student Count"}
                </p>
                <p className={cn("text-2xl font-bold", direction === "rtl" && "text-right")}>
                  {stats.student_count}
                </p>
              </div>
            </div>
            <p className={cn("text-sm text-gray-500", direction === "rtl" && "text-right")}>
              {t("teachers.performanceChartsComingSoon") || "Performance charts will be added here"}
            </p>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="space-y-4">
            <h2 className={cn("text-xl font-semibold", direction === "rtl" && "text-right")}>
              {t("teachers.upcomingSchedule") || "Upcoming Schedule"}
            </h2>
            <p className={cn("text-gray-500", direction === "rtl" && "text-right")}>
              {t("teachers.scheduleViewComingSoon") || "Schedule view will be implemented here"}
            </p>
          </div>
        )}

        {activeTab === "students" && (
          <div className="space-y-4">
            <h2 className={cn("text-xl font-semibold", direction === "rtl" && "text-right")}>
              {t("teachers.assignedStudents") || "Assigned Students"}
            </h2>
            {profile.assigned_students && profile.assigned_students.length > 0 ? (
              <div className="space-y-2">
                {profile.assigned_students.map((student: any) => (
                  <div key={student.id} className={cn("p-3 border rounded-lg", direction === "rtl" && "text-right")}>
                    <p className="font-medium">{student.full_name || student.name}</p>
                    {student.email && (
                      <p className="text-sm text-gray-500">{student.email}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className={cn("text-gray-500", direction === "rtl" && "text-right")}>
                {t("teachers.noStudentsAssigned") || "No students assigned"}
              </p>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-4">
            <h2 className={cn("text-xl font-semibold", direction === "rtl" && "text-right")}>
              {t("teachers.activityTimeline") || "Activity Timeline"}
            </h2>
            <p className={cn("text-gray-500", direction === "rtl" && "text-right")}>
              {t("teachers.activityLogsComingSoon") || "Activity logs will be displayed here"}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
