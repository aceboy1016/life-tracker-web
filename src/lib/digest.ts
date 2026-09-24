import { formatElapsedText, getUrgency } from '@/lib/time';

export interface DigestEvent {
    name: string;
    lastExecutedDate: Date | null;
}

const MAX_NAMES = 3;

/** Notification text listing items not done for a week or more (same rule as the "ご無沙汰" section). */
export function buildDigest(events: DigestEvent[], now: number): { title: string; body: string } | null {
    const overdue = events
        .filter((e) => {
            const u = getUrgency(e.lastExecutedDate, now);
            return u === 'over' || u === 'never';
        })
        .sort((a, b) => (a.lastExecutedDate?.getTime() ?? -Infinity) - (b.lastExecutedDate?.getTime() ?? -Infinity));

    if (overdue.length === 0) return null;

    const names = overdue
        .slice(0, MAX_NAMES)
        .map((e) => (e.lastExecutedDate ? `${e.name}（${formatElapsedText(e.lastExecutedDate, now)}）` : e.name));
    const rest = overdue.length - MAX_NAMES;

    return {
        title: `ご無沙汰なことが${overdue.length}件あります`,
        body: names.join('、') + (rest > 0 ? ` ほか${rest}件` : ''),
    };
}
