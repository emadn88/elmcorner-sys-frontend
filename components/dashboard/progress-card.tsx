"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressCardProps } from "@/types";
import { cn } from "@/lib/utils";

const colorClasses = {
  primary: {
    circle: "stroke-purple-600",
    bg: "bg-purple-50",
    text: "text-purple-600",
  },
  secondary: {
    circle: "stroke-blue-600",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  accent: {
    circle: "stroke-pink-600",
    bg: "bg-pink-50",
    text: "text-pink-600",
  },
  success: {
    circle: "stroke-green-600",
    bg: "bg-green-50",
    text: "text-green-600",
  },
  warning: {
    circle: "stroke-yellow-600",
    bg: "bg-yellow-50",
    text: "text-yellow-600",
  },
  error: {
    circle: "stroke-red-600",
    bg: "bg-red-50",
    text: "text-red-600",
  },
};

export function ProgressCard({
  label,
  value,
  subtitle,
  color = "primary",
}: ProgressCardProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <Card className="shadow-sm border-0 bg-white hover:shadow-vuxy-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            {/* Circular Progress */}
            <div className="relative flex-shrink-0">
              <svg
                className="transform -rotate-90"
                width="100"
                height="100"
                viewBox="0 0 100 100"
              >
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="none"
                  className="text-gray-100"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  className={colors.circle}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  style={{
                    strokeDasharray: circumference,
                  }}
                />
              </svg>
              {/* Percentage text in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className={cn("text-2xl font-bold block", colors.text)}>
                    {value}%
                  </span>
                </div>
              </div>
            </div>

            {/* Label and subtitle */}
            <div className="flex-1 min-w-0">
              <h3 className={cn("text-sm font-bold uppercase tracking-wider mb-2", colors.text)}>
                {label}
              </h3>
              {subtitle && (
                <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
              )}
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", colors.bg)}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

