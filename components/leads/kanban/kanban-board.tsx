"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    DndContext,
    DragOverlay,
    DragEndEvent,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { Lead, User } from "@/lib/api/types";
import { LeadService } from "@/lib/services/lead.service";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { LeadDrawer } from "./lead-drawer";
import { KanbanFilters } from "./kanban-filters";
import { AddLeadModal } from "./add-lead-modal";
import { KANBAN_STATUSES, getStatusLabelTKey } from "./kanban-constants";
import { Plus, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
    users: User[];
}

export function KanbanBoard({ users }: KanbanBoardProps) {
    const { t, direction } = useLanguage();
    // Board state
    const [board, setBoard] = useState<Record<string, Lead[]>>({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Drag & drop
    const [activeLead, setActiveLead] = useState<Lead | null>(null);
    const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

    // Selected lead for drawer
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    // Add lead modal
    const [showAddModal, setShowAddModal] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const [comingFrom, setComingFrom] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [followUpFilter, setFollowUpFilter] = useState("");
    const [showNotInterested, setShowNotInterested] = useState(true);

    // Polling
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const buildFilters = useCallback(() => ({
        search: search || undefined,
        coming_from: comingFrom || undefined,
        assigned_to: assignedTo ? Number(assignedTo) : undefined,
        follow_up_filter: (followUpFilter || undefined) as "today" | "overdue" | "this_week" | undefined,
        hide_not_interested: !showNotInterested || undefined,
    }), [search, comingFrom, assignedTo, followUpFilter, showNotInterested]);

    const fetchBoard = useCallback(async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        else setRefreshing(true);

        try {
            const data = await LeadService.getKanbanBoard(buildFilters());
            setBoard(data);
            setError(null);
        } catch (e) {
            if (!isBackground) setError(t("pipeline.errorLoad"));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [buildFilters]);

    // Initial load + refetch when filters change
    useEffect(() => {
        fetchBoard(false);
    }, [fetchBoard]);

    // 30-second polling
    useEffect(() => {
        pollRef.current = setInterval(() => fetchBoard(true), 30_000);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [fetchBoard]);

    // ── Drag handlers ──────────────────────────────────────────────────────────

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        const lead = active.data.current?.lead as Lead | undefined;
        setActiveLead(lead ?? null);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveLead(null);

        if (!over || !active) return;

        const leadId = active.id as number;
        const newStatus = over.id as string;

        // Find current status of the lead
        let currentStatus: string | null = null;
        for (const [status, leads] of Object.entries(board)) {
            if (leads.some(l => l.id === leadId)) {
                currentStatus = status;
                break;
            }
        }

        if (!currentStatus || currentStatus === newStatus) return;

        // Optimistic update
        const updatedBoard = { ...board };
        const lead = updatedBoard[currentStatus].find(l => l.id === leadId)!;
        updatedBoard[currentStatus] = updatedBoard[currentStatus].filter(l => l.id !== leadId);
        if (!updatedBoard[newStatus]) updatedBoard[newStatus] = [];
        updatedBoard[newStatus] = [{ ...lead, status: newStatus as Lead["status"] }, ...updatedBoard[newStatus]];
        setBoard(updatedBoard);

        // Persist to backend
        setStatusUpdateError(null);
        LeadService.updateLeadStatus(leadId, newStatus as Lead["status"])
            .then((updatedLead) => {
                if (selectedLead?.id === leadId) setSelectedLead(updatedLead);
            })
            .catch(() => {
                setStatusUpdateError(t("pipeline.statusUpdateError"));
                fetchBoard(false);
            });
    }

    // ── Lead actions ───────────────────────────────────────────────────────────

    function handleLeadUpdated(updated: Lead) {
        setSelectedLead(updated);
        setBoard(prev => {
            const next = { ...prev };
            // Remove from all columns then re-insert to correct one
            for (const key of Object.keys(next)) {
                next[key] = next[key].filter(l => l.id !== updated.id);
            }
            const col = updated.status;
            if (!next[col]) next[col] = [];
            next[col] = [updated, ...next[col]];
            return next;
        });
    }

    function handleLeadCreated(lead: Lead) {
        setShowAddModal(false);
        setBoard(prev => {
            const next = { ...prev };
            const col = lead.status || "just_sent_us";
            if (!next[col]) next[col] = [];
            next[col] = [lead, ...next[col]];
            return next;
        });
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400 dark:text-gray-400">{t("pipeline.loading")}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
                <button onClick={() => fetchBoard(false)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-xl transition-colors">
                    {t("pipeline.retry")}
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-4">
            {statusUpdateError && (
                <div className="shrink-0 px-4 py-2 bg-red-500/10 dark:bg-red-900/20 border border-red-500/30 dark:border-red-500/40 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center justify-between">
                    <span>{statusUpdateError}</span>
                    <button onClick={() => setStatusUpdateError(null)} className={cn("text-red-500 dark:text-red-400 hover:opacity-80", direction === "rtl" ? "mr-2" : "ml-2")}>×</button>
                </div>
            )}
            {/* Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
                <KanbanFilters
                    search={search}
                    comingFrom={comingFrom}
                    followUpFilter={followUpFilter}
                    showNotInterested={showNotInterested}
                    assignedTo={assignedTo}
                    onSearchChange={setSearch}
                    onComingFromChange={setComingFrom}
                    onFollowUpFilterChange={setFollowUpFilter}
                    onShowNotInterestedChange={setShowNotInterested}
                    onAssignedToChange={setAssignedTo}
                    users={users}
                />

                <div className="flex items-center gap-2">
                    {refreshing && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <RefreshCw className="h-3 w-3 animate-spin" /> {t("pipeline.syncing")}
                        </span>
                    )}
                    <button
                        onClick={() => fetchBoard(false)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 transition-colors"
                        title={t("pipeline.refresh")}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        <Plus className="h-4 w-4" />
                        {t("pipeline.addStudent")}
                    </button>
                </div>
            </div>

            {/* Board — 8 columns fit on one page, no horizontal scroll */}
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className={cn("grid gap-2 flex-1 min-h-0 pb-4 w-full", "grid-cols-8 min-w-0")}>
                    {KANBAN_STATUSES.map(statusConfig => {
                        const leads = board[statusConfig.key] ?? [];
                        return (
                            <KanbanColumn
                                key={statusConfig.key}
                                statusKey={statusConfig.key}
                                label={t("pipeline." + getStatusLabelTKey(statusConfig.key))}
                                color={statusConfig.color}
                                bg={statusConfig.bg}
                                border={statusConfig.border}
                                text={statusConfig.text}
                                leads={leads}
                                onCardClick={setSelectedLead}
                            />
                        );
                    })}
                </div>

                {/* Drag overlay — ghost card while dragging */}
                <DragOverlay>
                    {activeLead ? (
                        <div className="rotate-2 scale-105 shadow-2xl">
                            <KanbanCard lead={activeLead} onClick={() => { }} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Lead detail drawer */}
            {selectedLead && (
                <LeadDrawer
                    lead={selectedLead}
                    users={users}
                    onClose={() => setSelectedLead(null)}
                    onUpdated={handleLeadUpdated}
                />
            )}

            {/* Add student modal */}
            {showAddModal && (
                <AddLeadModal
                    onClose={() => setShowAddModal(false)}
                    onCreated={handleLeadCreated}
                    users={users}
                />
            )}
        </div>
    );
}
