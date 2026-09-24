export type EventCategory =
    | 'general'
    | 'health'
    | 'work'
    | 'hobby'
    | 'social'
    | 'household'
    | 'electronics';

/** How an item is grouped on the home screen. */
export type EventGroup = 'milestone' | 'business' | 'purchase' | 'contract' | 'routine' | 'other';

export const EVENT_GROUPS: { key: EventGroup; label: string; hint: string; icon: string }[] = [
    { key: 'milestone', label: '人生の節目', hint: '付き合った日、プロポーズ、入社日など。記念日をお知らせします', icon: 'heart' },
    { key: 'business', label: '仕事・ビジネス', hint: '業務委託、事業やサービスの開始日など。周年をお知らせします', icon: 'handshake' },
    { key: 'purchase', label: '買ったもの', hint: 'スマホ、パソコン、自転車など。買ってからの期間がわかります', icon: 'laptop' },
    { key: 'contract', label: '契約・入会', hint: '回線、ジム、保険など。契約してからの期間がわかります', icon: 'wifi' },
    { key: 'routine', label: '定期的なこと', hint: '髪を切る、歯医者など。やったら日付を更新します', icon: 'scissors' },
    { key: 'other', label: 'その他', hint: '', icon: 'star' },
];

/** Groups whose anniversaries and round-number days (100日, 1,000日…) are shown and notified. */
export function tracksAnniversaries(group: string | undefined): boolean {
    return group === 'milestone' || group === 'business';
}

export interface LifeEvent {
    id: string;
    name: string;
    group: EventGroup;
    /** The date to count from: when it happened, was bought, or was last done. */
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
    /** Furigana, used for search. */
    reading: string;
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
