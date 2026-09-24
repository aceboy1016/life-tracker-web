import { nextBirthday, upcomingOccasions } from '@/lib/time';

export interface DigestEvent {
    name: string;
    /** Only milestones (人生の節目) get anniversary / round-day notifications. */
    isMilestone: boolean;
    lastExecutedDate: Date | null;
}

export interface DigestBirthday {
    name: string;
    month: number;
    day: number;
    year: number | null;
    remindDaysBefore: number;
}

/**
 * Morning notification: what today is (birthdays, anniversaries, round-number days),
 * then birthday reminders ahead of time. Nothing on a day with neither.
 * `timeZone` decides what "today" is on the server.
 */
export function buildDigest(
    data: { events: DigestEvent[]; birthdays?: DigestBirthday[] },
    now: number,
    timeZone?: string
): { title: string; body: string } | null {
    const { events, birthdays = [] } = data;

    const today: string[] = [];
    const soon: string[] = [];
    for (const b of birthdays) {
        const next = nextBirthday(b, now, timeZone);
        const age = next.age !== null ? `（${next.age}歳）` : '';
        if (next.inDays === 0) today.push(`${b.name}の誕生日${age}`);
        else if (b.remindDaysBefore > 0 && next.inDays === b.remindDaysBefore) {
            soon.push(`${next.inDays === 1 ? "明日" : `${next.inDays}日後`}（${next.date.m}/${next.date.d}）は${b.name}の誕生日${age}`);
        }
    }
    for (const e of events) {
        if (!e.isMilestone || !e.lastExecutedDate) continue;
        for (const o of upcomingOccasions(e.lastExecutedDate, now, timeZone)) {
            if (o.inDays === 0) today.push(`${e.name}から${o.label}`);
        }
    }

    const lines = [...today.map((t) => `今日は${t}`), ...soon];
    if (lines.length === 0) return null;
    return { title: lines[0], body: lines.slice(1).join('\n') || 'LifeTracker を開いて確認しましょう' };
}
