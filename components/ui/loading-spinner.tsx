"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "primary" | "secondary" | "accent" | "white";
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

const variantClasses = {
  primary: "border-purple-600",
  secondary: "border-blue-600",
  accent: "border-pink-600",
  white: "border-white",
};

export function LoadingSpinner({
  size = "md",
  className,
  variant = "primary",
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <motion.div
        className={cn(
          "rounded-full border-4 border-t-transparent",
          sizeClasses[size],
          variantClasses[variant]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

// Modern pulse spinner with gradient
export function PulseSpinner({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeValues = {
    sm: 16,
    md: 32,
    lg: 48,
    xl: 64,
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <motion.div
        className="relative"
        style={{ width: sizeValues[size], height: sizeValues[size] }}
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="absolute inset-0 rounded-full bg-gradient-primary opacity-75"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.75, 0, 0.75],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

// Modern dots spinner
export function DotsSpinner({
  size = "md",
  className,
  variant = "primary",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "primary" | "secondary" | "accent";
}) {
  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3",
    xl: "w-4 h-4",
  };

  const variantColors = {
    primary: "bg-purple-600",
    secondary: "bg-blue-600",
    accent: "bg-pink-600",
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn("rounded-full", dotSizes[size], variantColors[variant])}
          animate={{
            y: [0, -12, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Modern gradient orb spinner
export function GradientOrbSpinner({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeValues = {
    sm: 24,
    md: 40,
    lg: 56,
    xl: 72,
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <motion.div
        className="relative"
        style={{ width: sizeValues[size], height: sizeValues[size] }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-primary"
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />
        <motion.div
          className="absolute inset-2 rounded-full bg-white dark:bg-gray-900"
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-primary"
          animate={{
            rotate: 360,
            scale: [1, 0.9, 1],
          }}
          transition={{
            rotate: {
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />
      </motion.div>
    </div>
  );
}

// Modern ring spinner with multiple rings
export function RingSpinner({
  size = "md",
  className,
  variant = "primary",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "primary" | "secondary" | "accent";
}) {
  const sizeValues = {
    sm: 20,
    md: 32,
    lg: 48,
    xl: 64,
  };

  const variantColors = {
    primary: "border-purple-600 border-t-transparent",
    secondary: "border-blue-600 border-t-transparent",
    accent: "border-pink-600 border-t-transparent",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <motion.div
        className="relative"
        style={{ width: sizeValues[size], height: sizeValues[size] }}
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={cn(
              "absolute rounded-full border-2",
              variantColors[variant]
            )}
            style={{
              width: sizeValues[size] - index * 8,
              height: sizeValues[size] - index * 8,
              top: index * 4,
              left: index * 4,
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1.5 - index * 0.2,
              repeat: Infinity,
              ease: "linear",
              delay: index * 0.1,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

// Main modern spinner - combines multiple effects
export function ModernSpinner({
  size = "md",
  className,
  variant = "primary",
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative">
        {/* Outer rotating ring */}
        <motion.div
          className={cn(
            "rounded-full border-4 border-t-transparent",
            sizeClasses[size],
            variantClasses[variant]
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        {/* Inner pulsing dot */}
        <motion.div
          className={cn(
            "absolute inset-0 m-auto rounded-full",
            size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : size === "lg" ? "w-3 h-3" : "w-4 h-4",
            variant === "primary" ? "bg-purple-600" :
            variant === "secondary" ? "bg-blue-600" :
            variant === "accent" ? "bg-pink-600" : "bg-white"
          )}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}

