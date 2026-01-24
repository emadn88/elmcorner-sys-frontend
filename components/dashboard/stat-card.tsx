"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatCardProps } from "@/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

const colorClasses = {
  primary: "from-purple-600 to-purple-400",
  secondary: "from-blue-500 to-indigo-500",
  accent: "from-pink-500 to-purple-500",
  success: "from-green-500 to-emerald-500",
  warning: "from-yellow-500 to-orange-500",
  error: "from-red-500 to-rose-500",
};

const iconColorClasses = {
  primary: "text-purple-600",
  secondary: "text-blue-600",
  accent: "text-pink-600",
  success: "text-green-600",
  warning: "text-yellow-600",
  error: "text-red-600",
};

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  color = "primary",
  gradient = false,
  className,
}: StatCardProps) {
  const { t, direction } = useLanguage();
  const count = useMotionValue(0);
  const rounded = useSpring(count, { stiffness: 50, damping: 20 });
  const display = useTransform(rounded, (latest) => {
    if (typeof value === "number") {
      return Math.round(latest).toLocaleString();
    }
    return value;
  });

  // Animate counter if value is a number
  useEffect(() => {
    if (typeof value === "number") {
      count.set(value);
    }
  }, [value, count]);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group"
    >
      <Card
        className={cn(
          "overflow-hidden border-0 shadow-sm hover:shadow-vuxy-lg transition-all duration-300 relative",
          gradient && `bg-gradient-to-br ${colorClasses[color]} text-white`,
          !gradient && "bg-white hover:border-purple-200",
          className
        )}
      >
        {/* Decorative gradient overlay on hover */}
        {!gradient && (
          <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300",
            `bg-gradient-to-br ${colorClasses[color]}`
          )} />
        )}
        
        <CardContent className="p-6 relative z-10">
          <div className={`flex items-start ${direction === "rtl" ? "flex-row-reverse" : ""} justify-between gap-4`}>
            <div className={`flex-1 min-w-0 ${direction === "rtl" ? "text-right" : "text-left"}`}>
              <p
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider mb-2",
                  gradient ? "text-white/80" : "text-gray-500"
                )}
              >
                {title}
              </p>
              <motion.h3
                className={cn(
                  typeof value === "number" ? "text-2xl" : "text-base",
                  "font-bold mb-1",
                  gradient ? "text-white" : "text-gray-900"
                )}
              >
                {typeof value === "number" ? display : value}
              </motion.h3>
              {change !== undefined && (
                <motion.div
                  initial={{ opacity: 0, x: direction === "rtl" ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`flex items-center gap-2 mt-3 ${direction === "rtl" ? "flex-row-reverse" : ""}`}
                >
                  <span
                    className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full",
                      changeType === "positive" && "bg-green-100 text-green-700",
                      changeType === "negative" && "bg-red-100 text-red-700",
                      changeType === "neutral" && "bg-gray-100 text-gray-700",
                      gradient && changeType === "positive" && "bg-white/20 text-white",
                      gradient && changeType === "negative" && "bg-white/20 text-white",
                      gradient && changeType === "neutral" && "bg-white/20 text-white"
                    )}
                  >
                    {changeType === "positive" && "↑"}
                    {changeType === "negative" && "↓"}
                    {change !== undefined && `${change > 0 ? "+" : ""}${change}%`}
                  </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        gradient ? "text-white/70" : "text-gray-500"
                      )}
                    >
                      {t("dashboard.vsLastMonth")}
                    </span>
                </motion.div>
              )}
            </div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={cn(
                "p-3.5 rounded-xl transition-all duration-300 flex-shrink-0",
                gradient
                  ? "bg-white/20 backdrop-blur-sm"
                  : `bg-gradient-to-br ${colorClasses[color]} bg-opacity-10 group-hover:bg-opacity-20`
              )}
            >
              <Icon
                className={cn(
                  "h-7 w-7",
                  gradient ? "text-white" : iconColorClasses[color]
                )}
              />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

