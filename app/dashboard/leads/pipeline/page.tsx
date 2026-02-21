"use client";

import { useState, useEffect } from "react";
import { KanbanBoard } from "@/components/leads/kanban/kanban-board";
import { UserService } from "@/lib/services/user.service";
import { User } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";

export default function PipelinePage() {
    const { t, direction } = useLanguage();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const res = await UserService.getUsers({ per_page: 200, page: 1 });
                if (!cancelled && res.data) {
                    setUsers(res.data as User[]);
                }
            } catch {
                if (!cancelled) setUsers([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400 dark:text-gray-400">{t("pipeline.loading")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-full ${direction === "rtl" ? "text-right" : "text-left"}`}>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 shrink-0">
                {t("pipeline.title")}
            </h1>
            <div className="flex-1 min-h-0">
                <KanbanBoard users={users} />
            </div>
        </div>
    );
}
