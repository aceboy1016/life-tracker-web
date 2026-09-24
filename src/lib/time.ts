const HOUR = 3600_000;
const DAY = 24 * HOUR;

/** Value for <input type="date"> in local time. */
export function toDateInputValue(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parses "YYYY-MM-DD" as local midnight (new Date(str) would treat it as UTC). */
export function fromDateInputValue(value: string): Date {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function pad(n: number) {
    return String(n).padStart(2, '0');
}

// ---------------------------------------------------------------------------
// Milestones: calendar-day arithmetic, anniversaries and round-number days.
// `timeZone` lets the server evaluate "today" in the user's zone (Asia/Tokyo).
// ---------------------------------------------------------------------------

export interface YMD {
    y: number;
    m: number; // 1-12
    d: number;
}

export function toYMD(date: Date | number, timeZone?: string): YMD {
    if (!timeZone) {
        const dt = new Date(date);
        return { y: dt.getFullYear(), m: dt.getMonth() + 1, d: dt.getDate() };
    }
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(
        new Date(date)
    );
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
    return { y: get('year'), m: get('month'), d: get('day') };
}

function dayNumber({ y, m, d }: YMD): number {
    return Math.floor(Date.UTC(y, m - 1, d) / DAY);
}

/** Whole calendar days from `from` to `to` (0 on the same day). */
export function daysBetween(from: YMD, to: YMD): number {
    return dayNumber(to) - dayNumber(from);
}

/** Years / months / days between two calendar dates, zero parts omitted. */
export function spanParts(from: YMD, to: YMD): { value: number; unit: string }[] {
    let years = to.y - from.y;
    let months = to.m - from.m;
    let days = to.d - from.d;
    if (days < 0) {
        months -= 1;
        days += new Date(to.y, to.m - 1, 0).getDate();
    }
    if (months < 0) {
        years -= 1;
        months += 12;
    }
    if (years < 0) return [];
    return [
        { value: years, unit: '年' },
        { value: months, unit: 'ヶ月' },
        { value: days, unit: '日' },
    ].filter((p) => p.value > 0);
}

/** "2年3ヶ月14日" style breakdown of the time between two calendar dates. */
export function formatSpan(from: YMD, to: YMD): string {
    return spanParts(from, to).map((p) => `${p.value}${p.unit}`).join('') || '今日';
}

/** The next month/day occurrence on or after `today` (Feb 29 falls back to Feb 28 in common years). */
function nextAnniversary(origin: YMD, today: YMD): { date: YMD; years: number } {
    for (let y = Math.max(today.y, origin.y + 1); ; y++) {
        const leapFix = origin.m === 2 && origin.d === 29 && new Date(y, 1, 29).getMonth() !== 1;
        const date = { y, m: origin.m, d: leapFix ? 28 : origin.d };
        if (daysBetween(today, date) >= 0) return { date, years: y - origin.y };
    }
}

export interface Occasion {
    kind: 'anniversary' | 'days';
    /** Days from today until the occasion (0 = today). */
    inDays: number;
    date: YMD;
    /** "1年" / "500日" */
    label: string;
}

const ROUND_DAYS = [100, 200, 300, 500, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];

/** The next anniversary and the next round-number day for a milestone, soonest first. */
export function upcomingOccasions(date: Date, now: number, timeZone?: string): Occasion[] {
    const origin = toYMD(date, timeZone);
    const today = toYMD(now, timeZone);
    const elapsed = daysBetween(origin, today);
    if (elapsed < 0) return [];

    const out: Occasion[] = [];
    const anniv = nextAnniversary(origin, today);
    out.push({ kind: 'anniversary', inDays: daysBetween(today, anniv.date), date: anniv.date, label: `${anniv.years}年` });

    const round = ROUND_DAYS.find((n) => n >= elapsed);
    if (round !== undefined && round > 0) {
        const inDays = round - elapsed;
        const target = new Date(Date.UTC(today.y, today.m - 1, today.d) + inDays * DAY);
        out.push({
            kind: 'days',
            inDays,
            date: { y: target.getUTCFullYear(), m: target.getUTCMonth() + 1, d: target.getUTCDate() },
            label: `${round.toLocaleString('ja-JP')}日`,
        });
    }
    return out.sort((a, b) => a.inDays - b.inDays);
}

export function formatYMD({ y, m, d }: YMD): string {
    return `${y}年${m}月${d}日`;
}

export interface NextBirthday {
    date: YMD;
    inDays: number;
    /** Age they turn on that day, when the birth year is known. */
    age: number | null;
}

/** Next occurrence of a birthday on or after today (Feb 29 → Feb 28 in common years). */
export function nextBirthday(b: { month: number; day: number; year: number | null }, now: number, timeZone?: string): NextBirthday {
    const today = toYMD(now, timeZone);
    for (let y = today.y; ; y++) {
        const leapFix = b.month === 2 && b.day === 29 && new Date(y, 1, 29).getMonth() !== 1;
        const date = { y, m: b.month, d: leapFix ? 28 : b.day };
        const inDays = daysBetween(today, date);
        if (inDays >= 0) return { date, inDays, age: b.year ? y - b.year : null };
    }
}
