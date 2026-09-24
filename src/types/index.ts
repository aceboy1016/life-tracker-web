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

export const CATEGORY_CONFIG: Record<EventCategory, { label: string; en: string; emoji: string }> = {
    general: { en: 'OTHER', label: 'その他', emoji: '📌' },
    health: { en: 'HEALTH', label: '健康', emoji: '❤️' },
    work: { en: 'WORK', label: '仕事', emoji: '💼' },
    hobby: { en: 'HOBBY', label: '趣味', emoji: '🎯' },
    social: { en: 'SOCIAL', label: 'ソーシャル', emoji: '👥' },
    household: { en: 'HOUSEHOLD', label: '家事', emoji: '🏠' },
    electronics: { en: 'DEVICES', label: '電子機器', emoji: '💻' },
};

export const CATEGORY_ENTRIES = Object.entries(CATEGORY_CONFIG) as [
    EventCategory,
    (typeof CATEGORY_CONFIG)[EventCategory],
][];

export function getCategory(category: EventCategory) {
    return CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.general;
}
