/**
 * Kanban board constants: statuses, labels, colors, and source options.
 * To add/edit statuses or coming_from options, only update this file.
 */

export const KANBAN_STATUSES = [
    { key: 'just_sent_us', label: 'Just Sent Us', color: '#6366f1', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400' },
    { key: 'needs_trial', label: 'Needs Trial', color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
    { key: 'waiting_for_trial', label: 'Waiting for Trial', color: '#3b82f6', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    { key: 'finished_trial', label: 'Finished Trial', color: '#8b5cf6', bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400' },
    { key: 'confirmed', label: 'Confirmed', color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    { key: 'not_complete', label: 'Not Complete', color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
    { key: 'not_interested', label: 'Not Interested', color: '#6b7280', bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400' },
    { key: 'needs_follow_up', label: 'Needs Follow-up', color: '#f97316', bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
] as const;

export type KanbanStatusKey = typeof KANBAN_STATUSES[number]['key'];

/** Translation key for pipeline status label (use with t(`pipeline.${getStatusLabelTKey(key)}`)) */
export const STATUS_LABEL_T_KEYS: Record<string, string> = {
    just_sent_us: 'statusJustSentUs',
    needs_trial: 'statusNeedsTrial',
    waiting_for_trial: 'statusWaitingForTrial',
    finished_trial: 'statusFinishedTrial',
    confirmed: 'statusConfirmed',
    not_complete: 'statusNotComplete',
    not_interested: 'statusNotInterested',
    needs_follow_up: 'statusNeedsFollowUp',
};

export function getStatusConfig(key: string) {
    return KANBAN_STATUSES.find(s => s.key === key) ?? {
        key,
        label: key.replace(/_/g, ' '),
        color: '#6b7280',
        bg: 'bg-gray-500/10',
        border: 'border-gray-500/30',
        text: 'text-gray-400',
    };
}

export function getStatusLabelTKey(key: string): string {
    return STATUS_LABEL_T_KEYS[key] ?? 'statusJustSentUs';
}

export const COMING_FROM_OPTIONS = [
    'Facebook',
    'Instagram',
    'Referral',
    'Website',
    'WhatsApp',
    'TikTok',
    'YouTube',
    'Other',
] as const;
