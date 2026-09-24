export type EventCategory =
    | 'general'
    | 'health'
    | 'work'
    | 'hobby'
    | 'social'
    | 'household'
    | 'electronics';

/** milestone: a one-off date to count from (proposal, wedding). routine: something done repeatedly (haircut). */
export type EventKind = 'milestone' | 'routine';

export interface LifeEvent {
    id: string;
    name: string;
    kind: EventKind;
    /** For routines: the last time it was done. For milestones: the date it happened. */
    lastExecutedDate: Date | null;
    category: EventCategory;
    icon: string;
    notes: string;
    userId: string;
    createdAt?: Date;
}

export interface Gift {
    id: string;
    from: string;
    occasion: string;
    item: string;
    amount: number | null;
    date: Date;
    returned: boolean;
    returnNote: string;
    notes: string;
    createdAt?: Date;
}

export type GiftInput = Omit<Gift, 'id' | 'createdAt'>;

export const GIFT_OCCASIONS = ['結婚', '出産', '誕生日', '引越し・新築', '就職・昇進', 'お見舞い', 'お中元・お歳暮', 'その他'];
