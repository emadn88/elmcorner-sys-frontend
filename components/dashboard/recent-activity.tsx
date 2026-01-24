"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ActivityItem } from "@/types";
import { useLanguage } from "@/contexts/language-context";
import { BookOpen, Users, ClipboardList, Award, MessageSquare } from "lucide-react";

// Get activities with translations
const getActivities = (t: (key: string) => string): ActivityItem[] => [
  {
    id: "1",
    user: "Sarah Johnson",
    action: t("activity.completed"),
    target: "Introduction to React",
    time: "2 minutes ago",
    type: "course",
  },
  {
    id: "2",
    user: "Michael Chen",
    action: t("activity.submitted"),
    target: "Assignment #3",
    time: "15 minutes ago",
    type: "assignment",
  },
  {
    id: "3",
    user: "Emily Davis",
    action: t("activity.received"),
    target: "Grade A+",
    time: "1 hour ago",
    type: "grade",
  },
  {
    id: "4",
    user: "David Wilson",
    action: t("activity.enrolledIn"),
    target: "Advanced JavaScript",
    time: "2 hours ago",
    type: "course",
  },
  {
    id: "5",
    user: "Lisa Anderson",
    action: t("activity.sentAMessage"),
    target: t("activity.toYou"),
    time: "3 hours ago",
    type: "message",
  },
];

const typeIcons = {
  course: BookOpen,
  student: Users,
  assignment: ClipboardList,
  grade: Award,
  message: MessageSquare,
};

const typeColors = {
  course: "bg-purple-100 text-purple-600",
  student: "bg-blue-100 text-blue-600",
  assignment: "bg-green-100 text-green-600",
  grade: "bg-yellow-100 text-yellow-600",
  message: "bg-pink-100 text-pink-600",
};

export function RecentActivity() {
  const { t } = useLanguage();
  const activities = getActivities(t);
  
  return (
    <Card className="h-full shadow-sm border-0 bg-white hover:shadow-vuxy-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">{t("activity.recentActivity")}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{t("activity.latestUpdates")}</p>
          </div>
          <button className="text-xs text-purple-600 hover:text-purple-700 font-semibold">
            {t("common.viewAll")}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, index) => {
            const Icon = typeIcons[activity.type];
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <Avatar className="h-10 w-10 ring-2 ring-gray-100 group-hover:ring-purple-200 transition-all">
                  <AvatarImage src={`/avatars/${activity.user.toLowerCase().replace(" ", "-")}.jpg`} />
                  <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                    {activity.user
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-gray-900">
                      {activity.user}
                    </span>
                    <span className="text-sm text-gray-600">
                      {activity.action}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {activity.target}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${typeColors[activity.type]} transition-transform group-hover:scale-110`}
                    >
                      <Icon className="h-3 w-3" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {activity.time}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

