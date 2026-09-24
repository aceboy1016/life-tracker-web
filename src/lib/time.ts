export type Urgency = 'never' | 'fresh' | 'ok' | 'warn' | 'over';

const HOUR = 3600_000;
const DAY = 24 * HOUR;

export function getUrgency(date: Date | null, now: number): Urgency {
    if (!date) return 'never';
    const hours = (now - date.getTime()) / HOUR;
    if (hours < 24) return 'fresh';
    if (hours < 72) return 'ok';
    if (hours < 168) return 'warn';
    return 'over';
}

/** Compact elapsed time split into a number and a unit, e.g. { value: '12', unit: '日' }. */
export function formatElapsed(date: Date | null, now: number): { value: string; unit: string } {
    if (!date) return { value: '—', unit: '' };
    const diff = Math.max(0, now - date.getTime());
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return { value: 'たった今', unit: '' };
    if (minutes < 60) return { value: String(minutes), unit: '分' };
    const hours = Math.floor(diff / HOUR);
    if (hours < 24) return { value: String(hours), unit: '時間' };
    const days = Math.floor(diff / DAY);
    if (days < 60) return { value: String(days), unit: '日' };
    if (days < 365) return { value: String(Math.floor(days / 30)), unit: 'ヶ月' };
    return { value: String(Math.floor(days / 365)), unit: '年' };
}

export function formatElapsedText(date: Date | null, now: number): string {
    if (!date) return 'まだ記録なし';
    const { value, unit } = formatElapsed(date, now);
    return unit ? `${value}${unit}前` : value;
}

export function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

/** Value for <input type="datetime-local"> in local time. */
export function toLocalInputValue(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const URGENCY_META: Record<Urgency, { label: string; text: string; bar: string }> = {
    never: { label: '未記録', text: 'text-ink-3', bar: 'border-l-ink-3' },
    fresh: { label: '24時間以内', text: 'text-fresh', bar: 'border-l-fresh' },
    ok: { label: '3日以内', text: 'text-ok', bar: 'border-l-ok' },
    warn: { label: '3〜7日', text: 'text-warn', bar: 'border-l-warn' },
    over: { label: '1週間以上', text: 'text-over', bar: 'border-l-over' },
};
