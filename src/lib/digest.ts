import { formatElapsedText, getUrgency, upcomingOccasions } from '@/lib/time';

export interface DigestEvent {
    name: string;
    kind: 'milestone' | 'routine';
    lastExecutedDate: Date | null;
}

const MAX_NAMES = 3;

/**
 * Morning notification: today's anniversaries / round-number days first, then routines
 * not done for a week or more. `timeZone` decides what "today" is on the server.
 */
export function buildDigest(events: DigestEvent[], now: number, timeZone?: string): { title: string; body: string } | null {
    const today = events
        .filter((e) => e.kind === 'milestone' && e.lastExecutedDate)
        .flatMap((e) =>
            upcomingOccasions(e.lastExecutedDate!, now, timeZone)
                .filter((o) => o.inDays === 0)
                .map((o) => `${e.name}から${o.label}`)
        );

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

    if (today.length > 0) {
        return {
            title: `今日は${today[0]}`,
            body: [
                today.length > 1 ? `ほかに：${today.slice(1).join('、')}` : '',
                overdue.length > 0 ? `しばらくやっていないこと：${overdueText()}` : '',
            ]
                .filter(Boolean)
                .join('\n') || 'おめでとうございます',
        };
    }
    if (overdue.length > 0) {
        return { title: `しばらくやっていないことが${overdue.length}件`, body: overdueText() };
    }
    return null;
}
