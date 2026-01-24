"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CourseService } from "@/lib/services/course.service";
import { Course } from "@/types/courses";
import { useLanguage } from "@/contexts/language-context";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const courseId = Number(params.id);

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await CourseService.getCourse(courseId);
      setCourse(data);
    } catch (err: any) {
      setError(err.message || "Failed to load course");
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

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-red-600">{error || "Course not found"}</p>
        <Button onClick={() => router.push("/dashboard/courses")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/courses")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
            {course.category && (
              <p className="text-gray-600 mt-1">{course.category}</p>
            )}
          </div>
        </div>
        <Badge className={course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
          {course.status}
        </Badge>
      </div>

      {/* Course Info */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Course Information</h2>
            {course.description && (
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-lg mt-1">{course.description}</p>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assigned Teachers ({course.teachers?.length || 0})
            </h2>
            {course.teachers && course.teachers.length > 0 ? (
              <div className="space-y-2">
                {course.teachers.map((teacher) => (
                  <div key={teacher.id} className="p-3 border rounded-lg">
                    <p className="font-medium">Teacher ID: {teacher.id}</p>
                    <p className="text-sm text-gray-500">
                      Hourly Rate: {teacher.hourly_rate} {teacher.currency}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No teachers assigned</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
