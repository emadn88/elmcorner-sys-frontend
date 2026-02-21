"use client";

import { useDroppable } from "@dnd-kit/core";
import { Lead } from "@/lib/api/types";
import { KanbanCard } from "./kanban-card";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
    statusKey: string;
    label: string;
    color: string;
    bg: string;
    border: string;
    text: string;
    leads: Lead[];
    onCardClick: (lead: Lead) => void;
}

export function KanbanColumn({
    statusKey,
    label,
    color,
    bg,
    border,
    text,
    leads,
    onCardClick,
}: KanbanColumnProps) {
    const { t, direction } = useLanguage();
    const { setNodeRef, isOver } = useDroppable({ id: statusKey });

    return (
        <div className={cn("flex flex-col min-w-0 flex-1", direction === "rtl" ? "text-right" : "text-left")}>
            {/* Column header */}
            <div
                className={cn(
                    "flex items-center justify-between px-2 py-2 rounded-lg mb-2 min-h-[40px]",
                    bg,
                    border,
                    "border",
                    "dark:border-gray-600"
                )}
            >
                <div className={cn("flex items-center gap-1.5 min-w-0 flex-1", direction === "rtl" ? "flex-row-reverse" : "")}>
                    <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                    />
                    <span
                        dir={direction === "rtl" ? "rtl" : "ltr"}
                        className={cn("text-xs font-semibold truncate", text)}
                    >
                        {label}
                    </span>
                </div>
                <span
                    className={cn(
                        "text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0",
                        "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                    )}
                >
                    {leads.length}
                </span>
            </div>

            {/* Drop zone */}
            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 flex flex-col gap-1.5 min-h-[120px] rounded-lg p-1.5",
                    "transition-colors duration-150",
                    isOver
                        ? "bg-emerald-500/10 dark:bg-emerald-500/20 ring-1 ring-emerald-500/40"
                        : "bg-gray-100/80 dark:bg-gray-800/40"
                )}
            >
                {leads.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-xs text-gray-500 dark:text-gray-500 italic text-center py-3 px-1">
                            {t("pipeline.dropCardsHere")}
                        </p>
                    </div>
                ) : (
                    leads.map((lead) => (
                        <KanbanCard key={lead.id} lead={lead} onClick={onCardClick} />
                    ))
                )}
            </div>
        </div>
    );
}
