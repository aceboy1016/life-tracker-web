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

export interface Birthday {
    id: string;
    name: string;
    month: number; // 1-12
    day: number;
    /** Birth year if known, for showing age. */
    year: number | null;
    relation: string;
    /** Extra reminder this many days before (0 = on the day only). */
    remindDaysBefore: number;
    notes: string;
    createdAt?: Date;
}

export type BirthdayInput = Omit<Birthday, 'id' | 'createdAt'>;

export const BIRTHDAY_RELATIONS = ['家族', 'パートナー', '友人', '仕事', 'その他'];

export const REMIND_OPTIONS: [string, string][] = [
    ['0', '当日のみ'],
    ['1', '前日'],
    ['3', '3日前'],
    ['7', '1週間前'],
];
