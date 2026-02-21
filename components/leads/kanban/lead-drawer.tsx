"use client";

import { useState, useEffect } from "react";
import { Lead, LeadAuditLog, User } from "@/lib/api/types";
import { LeadService } from "@/lib/services/lead.service";
import { COMING_FROM_OPTIONS, getStatusConfig, getStatusLabelTKey, KANBAN_STATUSES } from "./kanban-constants";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import {
    X, Phone, User as UserIcon, Calendar, Tag, MessageCircle,
    ExternalLink, Clock, Edit, Save, Trash2
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface LeadDrawerProps {
    lead: Lead | null;
    users: User[];
    onClose: () => void;
    onUpdated: (lead: Lead) => void;
    onDeleted?: (leadId: number) => void;
}

function formatDateTime(dateStr?: string) {
    if (!dateStr) return "—";
    try { return format(parseISO(dateStr), "MMM d, yyyy HH:mm"); } catch { return dateStr; }
}

export function LeadDrawer({ lead, users, onClose, onUpdated, onDeleted }: LeadDrawerProps) {
    const { t, direction } = useLanguage();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [history, setHistory] = useState<LeadAuditLog[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [form, setForm] = useState({
        name: "",
        whatsapp: "",
        coming_from: "",
        coming_from_other: "",
        description: "",
        notes: "",
        follow_up_date: "",
        assigned_to: "" as string | number,
        tags: [] as string[],
        status: "" as string,
        priority: "" as string,
    });

    useEffect(() => {
        if (!lead) return;
        setForm({
            name: lead.name || "",
            whatsapp: lead.whatsapp || "",
            coming_from: lead.coming_from || "",
            coming_from_other: lead.coming_from_other || "",
            description: lead.description || "",
            notes: lead.notes || "",
            follow_up_date: lead.follow_up_date || "",
            assigned_to: lead.assigned_to || "",
            tags: lead.tags || [],
            status: lead.status || "",
            priority: lead.priority || "",
        });
        setEditing(false);
        fetchHistory(lead.id);
    }, [lead]);

    async function fetchHistory(id: number) {
        setLoadingHistory(true);
        try {
            const data = await LeadService.getLeadHistory(id);
            setHistory(data);
        } catch { /* ignore */ }
        finally { setLoadingHistory(false); }
    }

    async function handleSave() {
        if (!lead) return;
        setSaving(true);
        try {
            const payload: Record<string, unknown> = { ...form };
            if (payload.assigned_to === "") payload.assigned_to = null;
            const updated = await LeadService.updateLead(lead.id, payload as Parameters<typeof LeadService.updateLead>[1]);
            onUpdated(updated);
            setEditing(false);
            fetchHistory(lead.id);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    }

    function addTag() {
        const t = tagInput.trim();
        if (t && !form.tags.includes(t)) {
            setForm(f => ({ ...f, tags: [...f.tags, t] }));
        }
        setTagInput("");
    }

    function removeTag(tag: string) {
        setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));
    }

    async function handleRemove() {
        if (!lead || !window.confirm(t("pipeline.removeConfirm"))) return;
        setDeleting(true);
        try {
            await LeadService.deleteLead(lead.id);
            onDeleted?.(lead.id);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setDeleting(false);
        }
    }

    if (!lead) return null;

    const whatsAppUrl = `https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`;
    const statusCfg = getStatusConfig(lead.status);
    const statusLabel = t("pipeline." + getStatusLabelTKey(lead.status));
    const isRtl = direction === "rtl";

    return (
        <>
            <div
                className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className={cn(
                "fixed top-0 h-full w-full max-w-[480px] bg-gray-50 dark:bg-gray-900 border z-50 flex flex-col overflow-hidden shadow-2xl",
                isRtl ? "right-auto left-0 border-r border-gray-200 dark:border-gray-700" : "right-0 border-l border-gray-200 dark:border-gray-700"
            )}>
                <div className={cn("flex items-center justify-between px-5 py-4 border-b bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700", isRtl ? "flex-row-reverse" : "")}>
                    <div className={cn("flex items-center gap-3 min-w-0", isRtl ? "flex-row-reverse" : "")}>
                        <div className="w-9 h-9 rounded-full bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center shrink-0">
                            <UserIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white truncate">{lead.name}</p>
                            <span className={cn("text-xs px-2 py-0.5 rounded-full", statusCfg.bg, statusCfg.text)}>
                                {statusLabel}
                            </span>
                        </div>
                    </div>
                    <div className={cn("flex items-center gap-2 shrink-0", isRtl ? "flex-row-reverse" : "")}>
                        {editing ? (
                            <>
                                <button
                                    onClick={() => setEditing(false)}
                                    className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                                >
                                    {t("pipeline.cancel")}
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Save className="h-3 w-3" />
                                    {saving ? t("pipeline.saving") : t("pipeline.save")}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 hover:border-emerald-500 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                            >
                                <Edit className="h-3 w-3" />
                                {t("pipeline.edit")}
                            </button>
                        )}
                        <button
                            onClick={handleRemove}
                            disabled={deleting}
                            title={t("pipeline.remove")}
                            className="p-1.5 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                        <button onClick={onClose} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className={cn("flex-1 overflow-y-auto p-5 space-y-5", isRtl ? "text-right" : "text-left")}>
                    <div className={cn("flex items-center justify-between bg-gray-100 dark:bg-gray-800/50 rounded-xl p-3", isRtl ? "flex-row-reverse" : "")}>
                        <div className={cn("flex items-center gap-2", isRtl ? "flex-row-reverse" : "")}>
                            <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span dir="ltr" className="text-sm text-gray-900 dark:text-gray-100 font-mono text-left">{lead.whatsapp}</span>
                        </div>
                        <a
                            href={whatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs rounded-lg transition-colors"
                        >
                            <ExternalLink className="h-3 w-3" />
                            {t("pipeline.openChat")}
                        </a>
                    </div>

                    <div className="space-y-4">
                        <Field label={t("pipeline.fullName")} isRtl={isRtl}>
                            {editing ? (
                                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className={inputStyle} />
                            ) : <span className="text-gray-900 dark:text-gray-100">{lead.name}</span>}
                        </Field>

                        <Field label={t("pipeline.whatsapp")} isRtl={isRtl}>
                            {editing ? (
                                <input
                                    dir="ltr"
                                    value={form.whatsapp}
                                    onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                                    className={cn(inputStyle, "text-left")}
                                />
                            ) : (
                                <span dir="ltr" className="text-gray-900 dark:text-gray-100 text-left">{lead.whatsapp}</span>
                            )}
                        </Field>

                        <Field label={t("pipeline.comingFrom")} isRtl={isRtl}>
                            {editing ? (
                                <div className="space-y-1.5">
                                    <select value={form.coming_from} onChange={e => setForm(f => ({ ...f, coming_from: e.target.value }))}
                                        className={inputStyle}>
                                        <option value="">{t("pipeline.selectSource")}</option>
                                        {COMING_FROM_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    {form.coming_from === "Other" && (
                                        <input value={form.coming_from_other}
                                            onChange={e => setForm(f => ({ ...f, coming_from_other: e.target.value }))}
                                            placeholder={t("pipeline.specifySource")}
                                            className={inputStyle} />
                                    )}
                                </div>
                            ) : (
                                <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                    {lead.coming_from === "Other" && lead.coming_from_other
                                        ? lead.coming_from_other
                                        : lead.coming_from || "—"}
                                </span>
                            )}
                        </Field>

                        <Field label={t("pipeline.status")} isRtl={isRtl}>
                            {editing ? (
                                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                    className={inputStyle}>
                                    {KANBAN_STATUSES.map(s => (
                                        <option key={s.key} value={s.key}>{t("pipeline." + getStatusLabelTKey(s.key))}</option>
                                    ))}
                                </select>
                            ) : (
                                <span className={cn("px-2 py-0.5 rounded-full text-xs", statusCfg.bg, statusCfg.text)}>
                                    {statusLabel}
                                </span>
                            )}
                        </Field>

                        <Field label={t("pipeline.assignedTo")} isRtl={isRtl}>
                            {editing ? (
                                <select value={String(form.assigned_to)} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
                                    className={inputStyle}>
                                    <option value="">{t("pipeline.unassignedOption")}</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            ) : (
                                <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                    <UserIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                    {lead.assigned_user?.name || t("pipeline.unassigned")}
                                </span>
                            )}
                        </Field>

                        <Field label={t("pipeline.followUpDate")} isRtl={isRtl}>
                            {editing ? (
                                <input type="date" value={form.follow_up_date}
                                    onChange={e => setForm(f => ({ ...f, follow_up_date: e.target.value }))}
                                    className={inputStyle} />
                            ) : (
                                <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                    <Calendar className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                    {lead.follow_up_date
                                        ? format(parseISO(lead.follow_up_date), "MMM d, yyyy")
                                        : "—"}
                                </span>
                            )}
                        </Field>

                        <Field label={t("pipeline.description")} isRtl={isRtl}>
                            {editing ? (
                                <textarea value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows={3}
                                    className={cn(inputStyle, "resize-none")} />
                            ) : <span className="text-gray-600 dark:text-gray-400 text-sm">{lead.description || "—"}</span>}
                        </Field>

                        <Field label={t("pipeline.notes")} isRtl={isRtl}>
                            {editing ? (
                                <textarea value={form.notes}
                                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                    rows={3}
                                    className={cn(inputStyle, "resize-none")} />
                            ) : <span className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">{lead.notes || "—"}</span>}
                        </Field>

                        <Field label={t("pipeline.tags")} isRtl={isRtl}>
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-1.5">
                                    {(editing ? form.tags : lead.tags ?? []).map(tag => (
                                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-200 dark:bg-gray-700/60 rounded-lg text-xs text-gray-700 dark:text-gray-300">
                                            <Tag className="h-2.5 w-2.5" />
                                            {tag}
                                            {editing && (
                                                <button onClick={() => removeTag(tag)} className={cn("hover:text-red-500 dark:hover:text-red-400", isRtl ? "mr-0.5" : "ml-0.5")}>×</button>
                                            )}
                                        </span>
                                    ))}
                                </div>
                                {editing && (
                                    <div className={cn("flex gap-2", isRtl ? "flex-row-reverse" : "")}>
                                        <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                                            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                                            placeholder={t("pipeline.addTagPlaceholder")}
                                            className={cn(inputStyle, "flex-1 text-xs")} />
                                        <button onClick={addTag} className="px-2.5 py-1.5 bg-gray-600 dark:bg-gray-600 hover:bg-gray-500 dark:hover:bg-gray-500 text-white text-xs rounded-lg">{t("pipeline.addTag")}</button>
                                    </div>
                                )}
                            </div>
                        </Field>
                    </div>

                    <div className="bg-gray-100 dark:bg-gray-800/30 rounded-xl p-3 space-y-1.5">
                        <MetaRow label={t("pipeline.created")} value={formatDateTime(lead.created_at)} isRtl={isRtl} />
                        <MetaRow label={t("pipeline.lastUpdated")} value={formatDateTime(lead.updated_at)} isRtl={isRtl} />
                        <MetaRow label={t("pipeline.statusChanged")} value={formatDateTime(lead.last_status_changed_at)} isRtl={isRtl} />
                    </div>

                    <div>
                        <h4 className={cn("text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2", isRtl ? "flex-row-reverse" : "")}>
                            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            {t("pipeline.statusHistory")}
                        </h4>
                        {loadingHistory ? (
                            <p className="text-xs text-gray-500 dark:text-gray-400">…</p>
                        ) : history.length === 0 ? (
                            <p className="text-xs text-gray-500 dark:text-gray-500 italic">{t("pipeline.noHistory")}</p>
                        ) : (
                            <div className="space-y-2">
                                {history.map(entry => (
                                    <div key={entry.id} className={cn("flex gap-3 items-start", isRtl ? "flex-row-reverse" : "")}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-700 dark:text-gray-300">
                                                {entry.field_changed === "create"
                                                    ? <span className="text-emerald-600 dark:text-emerald-400">{t("pipeline.leadCreated")}</span>
                                                    : (
                                                        <>
                                                            <span className="text-gray-500 dark:text-gray-500">{t("pipeline." + getStatusLabelTKey(entry.from_status ?? ""))}</span>
                                                            {" → "}
                                                            <span className={getStatusConfig(entry.to_status).text}>{t("pipeline." + getStatusLabelTKey(entry.to_status))}</span>
                                                        </>
                                                    )}
                                            </p>
                                            <div className={cn("flex items-center gap-2 mt-0.5", isRtl ? "flex-row-reverse" : "")}>
                                                <span className="text-xs text-gray-500 dark:text-gray-500">{entry.user?.name ?? "System"}</span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-500">{formatDateTime(entry.created_at)}</span>
                                            </div>
                                            {entry.notes && (
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">"{entry.notes}"</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

const inputStyle = "w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500";

function Field({ label, children, isRtl }: { label: string; children: React.ReactNode; isRtl?: boolean }) {
    return (
        <div className={isRtl ? "text-right" : "text-left"}>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</label>
            <div className="text-sm text-gray-700 dark:text-gray-200">{children}</div>
        </div>
    );
}

function MetaRow({ label, value, isRtl }: { label: string; value: string; isRtl?: boolean }) {
    return (
        <div className={cn("flex justify-between text-xs text-gray-600 dark:text-gray-400", isRtl ? "flex-row-reverse" : "")}>
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}
