"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, TrendingUp, Award } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  name: string;
  enrollments: number;
  rating: number;
  change: number;
  category: string;
}

const getTopCourses = (t: (key: string) => string): Course[] => [
  {
    id: "1",
    name: t("courses.advancedReactDevelopment"),
    enrollments: 1245,
    rating: 4.9,
    change: 12.5,
    category: t("courses.development"),
  },
  {
    id: "2",
    name: t("courses.fullStackJavaScript"),
    enrollments: 980,
    rating: 4.8,
    change: 8.3,
    category: t("courses.development"),
  },
  {
    id: "3",
    name: t("courses.uiUxDesignMastery"),
    enrollments: 856,
    rating: 4.7,
    change: 15.2,
    category: t("courses.design"),
  },
  {
    id: "4",
    name: t("courses.dataScienceFundamentals"),
    enrollments: 742,
    rating: 4.6,
    change: 5.1,
    category: t("courses.dataScience"),
  },
  {
    id: "5",
    name: t("courses.pythonForBeginners"),
    enrollments: 689,
    rating: 4.8,
    change: 9.7,
    category: t("courses.programming"),
  },
];

const getCategoryColor = (category: string, t: (key: string) => string) => {
  const colors: Record<string, string> = {
    [t("courses.development")]: "bg-purple-100 text-purple-700",
    [t("courses.design")]: "bg-pink-100 text-pink-700",
    [t("courses.dataScience")]: "bg-blue-100 text-blue-700",
    [t("courses.programming")]: "bg-green-100 text-green-700",
  };
  return colors[category] || "bg-gray-100 text-gray-700";
};

export function TopCourses() {
  const { t } = useLanguage();
  const topCourses = getTopCourses(t);
  
  return (
    <Card className="h-full shadow-sm border-0 bg-white hover:shadow-vuxy-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">{t("dashboard.topCourses")}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{t("dashboard.mostPopularThisMonth")}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-semibold text-purple-700">{t("dashboard.top5")}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all duration-300 cursor-pointer"
            >
                  <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn(
                      "px-2 py-0.5 rounded-md text-xs font-semibold",
                      getCategoryColor(course.category, t)
                    )}>
                      {course.category}
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-semibold text-gray-700">
                        {course.rating}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                    {course.name}
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs font-medium text-gray-600">
                        {course.enrollments.toLocaleString()} {t("dashboard.enrolled")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-semibold text-green-600">
                        +{course.change}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-4 py-2.5 text-sm font-semibold text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
        >
          {t("dashboard.viewAllCourses")} →
        </motion.button>
      </CardContent>
    </Card>
  );
}



