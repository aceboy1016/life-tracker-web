export type EventCategory =
    | 'general'
    | 'health'
    | 'work'
    | 'hobby'
    | 'social'
    | 'household'
    | 'electronics';

export interface LifeEvent {
    id: string;
    name: string;
    lastExecutedDate: Date | null;
    category: EventCategory;
    notes: string;
    userId: string;
    createdAt?: Date;
}

export const CATEGORY_CONFIG: Record<EventCategory, { label: string; emoji: string; tile: string }> = {
    general: { label: 'その他', emoji: '📌', tile: 'bg-slate-500/12' },
    health: { label: '健康', emoji: '❤️', tile: 'bg-rose-500/12' },
    work: { label: '仕事', emoji: '💼', tile: 'bg-blue-500/12' },
    hobby: { label: '趣味', emoji: '🎯', tile: 'bg-violet-500/12' },
    social: { label: 'ソーシャル', emoji: '👥', tile: 'bg-amber-500/14' },
    household: { label: '家事', emoji: '🏠', tile: 'bg-emerald-500/12' },
    electronics: { label: '電子機器', emoji: '💻', tile: 'bg-cyan-500/12' },
};

export const CATEGORY_ENTRIES = Object.entries(CATEGORY_CONFIG) as [
    EventCategory,
    (typeof CATEGORY_CONFIG)[EventCategory],
][];

export function getCategory(category: EventCategory) {
    return CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.general;
}
