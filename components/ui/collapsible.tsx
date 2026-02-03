"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

interface CollapsibleProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  trigger: React.ReactNode;
  className?: string;
}

export function Collapsible({
  children,
  defaultOpen = false,
  trigger,
  className,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const { direction } = useLanguage();

  return (
    <div className={cn("border rounded-md", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
          direction === "rtl" && "flex-row-reverse"
        )}
      >
        <div className="flex-1">{trigger}</div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-500 transition-transform duration-200 flex-shrink-0",
            isOpen && "transform rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}
