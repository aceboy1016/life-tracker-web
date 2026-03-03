export type EventCategory =
    | 'general'
    | 'health'
    | 'work'
    | 'hobby'
    | 'social'
    | 'household';

export interface LifeEvent {
    id: string;
    name: string;
    lastExecutedDate: Date | null;
    category: EventCategory;
    notes: string;
    userId: string;
    createdAt?: Date;
}

export const CATEGORY_CONFIG: Record<
    EventCategory,
    { label: string; emoji: string; color: string; bgColor: string; darkColor: string; darkBg: string }
> = {
    general: {
        label: 'その他',
        emoji: '📌',
        color: 'text-slate-700',
        bgColor: 'bg-slate-100',
        darkColor: 'text-slate-300',
        darkBg: 'bg-slate-800',
    },
    health: {
        label: '健康',
        emoji: '❤️',
        color: 'text-rose-700',
        bgColor: 'bg-rose-100',
        darkColor: 'text-rose-300',
        darkBg: 'bg-rose-900/40',
    },
    work: {
        label: '仕事',
        emoji: '💼',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        darkColor: 'text-blue-300',
        darkBg: 'bg-blue-900/40',
    },
    hobby: {
        label: '趣味',
        emoji: '🎯',
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
        darkColor: 'text-purple-300',
        darkBg: 'bg-purple-900/40',
    },
    social: {
        label: 'ソーシャル',
        emoji: '👥',
        color: 'text-amber-700',
        bgColor: 'bg-amber-100',
        darkColor: 'text-amber-300',
        darkBg: 'bg-amber-900/40',
    },
    household: {
        label: '家事',
        emoji: '🏠',
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-100',
        darkColor: 'text-emerald-300',
        darkBg: 'bg-emerald-900/40',
    },
};
