import { formatElapsedText, getUrgency, nextBirthday, upcomingOccasions } from '@/lib/time';

export interface DigestEvent {
    name: string;
    kind: 'milestone' | 'routine';
    lastExecutedDate: Date | null;
}

export interface DigestBirthday {
    name: string;
    month: number;
    day: number;
    year: number | null;
    remindDaysBefore: number;
}

const MAX_NAMES = 3;

/**
 * Morning notification. Priority: what today is (birthdays, anniversaries), then birthday
 * reminders ahead of time, then routines not done for a week or more.
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
        if (e.kind !== 'milestone' || !e.lastExecutedDate) continue;
        for (const o of upcomingOccasions(e.lastExecutedDate, now, timeZone)) {
            if (o.inDays === 0) today.push(`${e.name}から${o.label}`);
        }
    }

    const overdue = events
        .filter((e) => {
            if (e.kind !== 'routine') return false;
            const u = getUrgency(e.lastExecutedDate, now);
            return u === 'over' || u === 'never';
        })
        .sort((a, b) => (a.lastExecutedDate?.getTime() ?? -Infinity) - (b.lastExecutedDate?.getTime() ?? -Infinity));

    const overdueText = () => {
        const names = overdue
            .slice(0, MAX_NAMES)
            .map((e) => (e.lastExecutedDate ? `${e.name}（${formatElapsedText(e.lastExecutedDate, now)}）` : e.name));
        const rest = overdue.length - MAX_NAMES;
        return names.join('、') + (rest > 0 ? ` ほか${rest}件` : '');
    };

    const lines = [
        ...today.map((t) => `今日は${t}`),
        ...soon,
        ...(overdue.length > 0 ? [`しばらくやっていないこと：${overdueText()}`] : []),
    ];
    if (lines.length === 0) return null;

    if (today.length === 0 && soon.length === 0) {
        return { title: `しばらくやっていないことが${overdue.length}件`, body: overdueText() };
    }
    return { title: lines[0], body: lines.slice(1).join('\n') || 'LifeTracker を開いて確認しましょう' };
}
