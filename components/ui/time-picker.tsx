"use client";

import { useState, useEffect, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string; // Format: "HH:mm" (24-hour)
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function TimePicker({ value, onChange, className, disabled }: TimePickerProps) {
  const [hour12, setHour12] = useState<string>("12");
  const [minutes, setMinutes] = useState<string>("00");
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert 24-hour to 12-hour format
  const convert24To12 = (hour24: string): { hour12: string; ampm: "AM" | "PM" } => {
    const h = parseInt(hour24);
    if (h === 0) return { hour12: "12", ampm: "AM" };
    if (h === 12) return { hour12: "12", ampm: "PM" };
    if (h > 12) return { hour12: (h - 12).toString(), ampm: "PM" };
    return { hour12: h.toString(), ampm: "AM" };
  };

  // Convert 12-hour to 24-hour format
  const convert12To24 = (hour12: string, ampm: "AM" | "PM"): string => {
    const h = parseInt(hour12);
    if (ampm === "AM") {
      if (h === 12) return "00";
      return h.toString().padStart(2, "0");
    } else {
      if (h === 12) return "12";
      return (h + 12).toString().padStart(2, "0");
    }
  };

  // Parse value on mount and when value changes
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      const { hour12: h12, ampm: ap } = convert24To12(h || "00");
      setHour12(h12);
      setMinutes(m || "00");
      setAmpm(ap);
    } else {
      setHour12("12");
      setMinutes("00");
      setAmpm("AM");
    }
  }, [value]);

  // Track if any Select dropdown is open
  const [selectOpen, setSelectOpen] = useState(false);

  // Close dropdown when clicking outside (but not when clicking inside Select dropdowns)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Don't close if any Select dropdown is open
      if (selectOpen) {
        return;
      }
      
      // Don't close if clicking inside the container
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }
      
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, selectOpen]);

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => {
    const hour = (i + 1).toString();
    return { 
      value: hour, 
      label: hour
    };
  });

  // Generate minute options (00, 15, 30, 45)
  const minuteOptions = [
    { value: "00", label: "00" },
    { value: "15", label: "15" },
    { value: "30", label: "30" },
    { value: "45", label: "45" },
  ];

  const handleHourChange = (newHour: string) => {
    setHour12(newHour);
    const hour24 = convert12To24(newHour, ampm);
    onChange(`${hour24}:${minutes}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    setMinutes(newMinute);
    const hour24 = convert12To24(hour12, ampm);
    onChange(`${hour24}:${newMinute}`);
  };

  const handleAmpmChange = (newAmpm: "AM" | "PM") => {
    setAmpm(newAmpm);
    const hour24 = convert12To24(hour12, newAmpm);
    onChange(`${hour24}:${minutes}`);
  };

  const incrementHour = () => {
    const currentHour = parseInt(hour12);
    const newHour = currentHour === 12 ? 1 : currentHour + 1;
    handleHourChange(newHour.toString());
  };

  const decrementHour = () => {
    const currentHour = parseInt(hour12);
    const newHour = currentHour === 1 ? 12 : currentHour - 1;
    handleHourChange(newHour.toString());
  };

  const incrementMinute = () => {
    const currentIndex = minuteOptions.findIndex(opt => opt.value === minutes);
    const nextIndex = (currentIndex + 1) % minuteOptions.length;
    handleMinuteChange(minuteOptions[nextIndex].value);
  };

  const decrementMinute = () => {
    const currentIndex = minuteOptions.findIndex(opt => opt.value === minutes);
    const prevIndex = (currentIndex - 1 + minuteOptions.length) % minuteOptions.length;
    handleMinuteChange(minuteOptions[prevIndex].value);
  };

  // Format display value (12-hour format with AM/PM)
  const formatDisplayValue = (h: string, m: string, ap: "AM" | "PM"): string => {
    if (!h || !m) return "";
    return `${h}:${m} ${ap}`;
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        <Input
          type="text"
          value={formatDisplayValue(hour12, minutes, ampm)}
          readOnly
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "pl-9 pr-9 cursor-pointer bg-background",
            disabled && "cursor-not-allowed opacity-50"
          )}
          disabled={disabled}
          placeholder="Select time"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
          <ChevronUp className="h-3 w-3 text-muted-foreground" />
          <ChevronDown className="h-3 w-3 text-muted-foreground -mt-1" />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
          <div className="p-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              {/* Hour Selector */}
              <div className="flex flex-col items-center">
                <label className="text-xs font-medium text-muted-foreground mb-2">Hour</label>
                <div className="flex flex-col items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={incrementHour}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <div className="w-16">
                    <Select 
                      value={hour12} 
                      onValueChange={handleHourChange}
                      onOpenChange={(open) => setSelectOpen(open)}
                    >
                      <SelectTrigger className="w-16 h-12 text-center text-lg font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent 
                        className="max-h-64" 
                        onCloseAutoFocus={(e) => e.preventDefault()}
                        onEscapeKeyDown={(e) => e.preventDefault()}
                        onPointerDownOutside={(e) => e.preventDefault()}
                      >
                        {hourOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-center">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={decrementHour}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-2xl font-bold pt-8">:</div>

              {/* Minute Selector */}
              <div className="flex flex-col items-center">
                <label className="text-xs font-medium text-muted-foreground mb-2">Minute</label>
                <div className="flex flex-col items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={incrementMinute}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <div className="w-16">
                    <Select 
                      value={minutes} 
                      onValueChange={handleMinuteChange}
                      onOpenChange={(open) => setSelectOpen(open)}
                    >
                      <SelectTrigger className="w-16 h-12 text-center text-lg font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent 
                        onCloseAutoFocus={(e) => e.preventDefault()}
                        onEscapeKeyDown={(e) => e.preventDefault()}
                        onPointerDownOutside={(e) => e.preventDefault()}
                      >
                        {minuteOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-center">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={decrementMinute}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* AM/PM Selector */}
              <div className="flex flex-col items-center">
                <label className="text-xs font-medium text-muted-foreground mb-2">Period</label>
                <div className="flex flex-col items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleAmpmChange(ampm === "AM" ? "PM" : "AM")}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <div className="w-16">
                    <Select 
                      value={ampm} 
                      onValueChange={(value) => handleAmpmChange(value as "AM" | "PM")}
                      onOpenChange={(open) => setSelectOpen(open)}
                    >
                      <SelectTrigger className="w-16 h-12 text-center text-lg font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent 
                        onCloseAutoFocus={(e) => e.preventDefault()}
                        onEscapeKeyDown={(e) => e.preventDefault()}
                        onPointerDownOutside={(e) => e.preventDefault()}
                      >
                        <SelectItem value="AM" className="text-center">AM</SelectItem>
                        <SelectItem value="PM" className="text-center">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleAmpmChange(ampm === "AM" ? "PM" : "AM")}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Display Preview */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Selected Time</div>
                <div className="text-xl font-semibold">{formatDisplayValue(hour12, minutes, ampm)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  ({convert12To24(hour12, ampm)}:{minutes})
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
