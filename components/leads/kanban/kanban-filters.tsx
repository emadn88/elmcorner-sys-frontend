"use client";

import { COMING_FROM_OPTIONS } from "./kanban-constants";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface KanbanFiltersProps {
    search: string;
    comingFrom: string;
    followUpFilter: string;
    showNotInterested: boolean;
    assignedTo: string;
    onSearchChange: (v: string) => void;
    onComingFromChange: (v: string) => void;
    onFollowUpFilterChange: (v: string) => void;
    onShowNotInterestedChange: (v: boolean) => void;
    onAssignedToChange: (v: string) => void;
    users: { id: number; name: string }[];
}

export function KanbanFilters({
    search,
    comingFrom,
    followUpFilter,
    showNotInterested,
    assignedTo,
    onSearchChange,
    onComingFromChange,
    onFollowUpFilterChange,
    onShowNotInterestedChange,
    onAssignedToChange,
    users,
}: KanbanFiltersProps) {
    const { t, direction } = useLanguage();
    const isRtl = direction === "rtl";

    return (
        <div className={cn("flex flex-wrap items-center gap-2", isRtl ? "flex-row-reverse" : "")}>
            <div className={cn("relative", isRtl ? "flex-row-reverse" : "")}>
                <svg className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400", isRtl ? "right-3" : "left-3")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4-4m0 0A7 7 0 1 0 5 5a7 7 0 0 0 12 12z" />
                </svg>
                <input
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder={t("pipeline.searchPlaceholder")}
                    className={cn(
                        "py-2 rounded-lg text-sm border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 w-44",
                        isRtl ? "pr-9 pl-4" : "pl-9 pr-4"
                    )}
                />
            </div>

            <select
                value={comingFrom}
                onChange={e => onComingFromChange(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
            >
                <option value="">{t("pipeline.allSources")}</option>
                {COMING_FROM_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>

            <select
                value={assignedTo}
                onChange={e => onAssignedToChange(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
            >
                <option value="">{t("pipeline.allAgents")}</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>

            <select
                value={followUpFilter}
                onChange={e => onFollowUpFilterChange(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
            >
                <option value="">{t("pipeline.allFollowUps")}</option>
                <option value="today">{t("pipeline.followUpToday")}</option>
                <option value="overdue">{t("pipeline.overdue")}</option>
                <option value="this_week">{t("pipeline.thisWeek")}</option>
            </select>

            <button
                onClick={() => onShowNotInterestedChange(!showNotInterested)}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors",
                    showNotInterested
                        ? "bg-gray-200 dark:bg-gray-600/40 border-gray-400 dark:border-gray-500 text-gray-700 dark:text-gray-200"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
                    isRtl ? "flex-row-reverse" : ""
                )}
            >
                <span className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0", showNotInterested ? "bg-emerald-600 border-emerald-600" : "border-gray-400 dark:border-gray-500")}>
                    {showNotInterested && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </span>
                {t("pipeline.showNotInterested")}
            </button>
        </div>
    );
}
