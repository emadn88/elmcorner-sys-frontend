"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { X, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MultiSelectOption {
  id: number;
  name: string;
  [key: string]: any;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: number[];
  onChange: (selectedIds: number[]) => void;
  onSearch?: (searchTerm: string) => void;
  placeholder?: string;
  label?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  onSearch,
  placeholder = "Select items...",
  label,
  searchPlaceholder = "Search...",
  isLoading = false,
  className,
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter options based on search
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected options
  const selectedOptions = options.filter((option) =>
    selected.includes(option.id)
  );

  // Handle option toggle
  const toggleOption = (optionId: number) => {
    if (disabled) return;
    
    const newSelected = selected.includes(optionId)
      ? selected.filter((id) => id !== optionId)
      : [...selected, optionId];
    onChange(newSelected);
  };

  // Handle remove option
  const removeOption = (optionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(selected.filter((id) => id !== optionId));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Call onSearch when search term changes
  useEffect(() => {
    if (onSearch && searchTerm) {
      onSearch(searchTerm);
    }
  }, [searchTerm, onSearch]);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className={cn("text-left rtl:text-right")}>{label}</Label>
      )}
      <div className="relative" ref={containerRef}>
        <Button
          type="button"
          variant="outline"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "w-full justify-between min-h-[42px] h-auto py-2 px-3",
            !selected.length && "text-muted-foreground",
            isOpen && "ring-2 ring-ring ring-offset-2"
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selectedOptions.map((option) => (
                <span
                  key={option.id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm"
                >
                  {option.name}
                  {!disabled && (
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-blue-900 dark:hover:text-blue-100"
                      onClick={(e) => removeOption(option.id, e)}
                    />
                  )}
                </span>
              ))
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 opacity-50 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </Button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8"
                autoFocus
              />
            </div>

            {/* Options list */}
            <div className="max-h-48 overflow-auto">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selected.includes(option.id);
                  return (
                    <div
                      key={option.id}
                      onClick={() => toggleOption(option.id)}
                      className={cn(
                        "px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-between",
                        isSelected && "bg-blue-50 dark:bg-blue-900/20"
                      )}
                    >
                      <span>{option.name}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
