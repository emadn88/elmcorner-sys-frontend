"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function RadioGroup({ value, onValueChange, className, children }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={cn("space-y-2", className)} role="radiogroup">
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

interface RadioGroupItemProps {
  value: string;
  id?: string;
  className?: string;
  children?: React.ReactNode;
}

export function RadioGroupItem({ value, id, className, children }: RadioGroupItemProps) {
  const { value: groupValue, onValueChange } = React.useContext(RadioGroupContext);
  const isChecked = groupValue === value;

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <input
        type="radio"
        id={id}
        value={value}
        checked={isChecked}
        onChange={() => onValueChange?.(value)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
      />
      {children}
    </div>
  );
}
