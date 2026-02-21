"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Lead } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { isToday, isPast, parseISO } from "date-fns";

interface KanbanCardProps {
    lead: Lead;
    onClick: (lead: Lead) => void;
}

function isFollowUpUrgent(followUpDate?: string): boolean {
    if (!followUpDate) return false;
    try {
        const d = parseISO(followUpDate);
        return isToday(d) || isPast(d);
    } catch {
        return false;
    }
}

export function KanbanCard({ lead, onClick }: KanbanCardProps) {
    const { direction } = useLanguage();
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: lead.id,
        data: { lead },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
        cursor: isDragging ? "grabbing" : "grab",
    };

    const urgent = isFollowUpUrgent(lead.follow_up_date);
    const isRtl = direction === "rtl";

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick(lead)}
            className={cn(
                "group relative rounded-lg p-2.5 select-none min-w-0 flex items-center justify-center min-h-[44px]",
                "bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600",
                "shadow-md shadow-gray-300/50 dark:shadow-lg dark:shadow-black/50",
                "hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg hover:shadow-gray-400/40 dark:hover:shadow-xl dark:hover:shadow-black/60",
                "transition-all duration-150 cursor-pointer",
                urgent && "ring-1 ring-orange-500/50",
                isRtl ? "text-right" : "text-left"
            )}
        >
            <p className={cn(
                "font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight truncate w-full",
                isRtl ? "text-right pl-1" : "text-left pr-1"
            )}>
                {lead.name}
            </p>
        </div>
    );
}
