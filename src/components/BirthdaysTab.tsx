'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Birthday } from '@/types';
import { Avatar, IconTile } from '@/lib/icons';
import { nextBirthday, NextBirthday } from '@/lib/time';
import { GroupHeader, cardClass } from '@/components/ui';

export default function BirthdaysTab({
    birthdays,
    loading,
    now,
    onOpen,
}: {
    birthdays: Birthday[];
    loading: boolean;
    now: number;
    onOpen: (b: Birthday) => void;
}) {
    const [search, setSearch] = useState('');
    const q = search.trim().toLowerCase().replace(/\s/g, '');
    const sorted = useMemo(
        () =>
            birthdays
                .filter((b) => !q || `${b.name}${b.reading}${b.relation}`.toLowerCase().replace(/\s/g, '').includes(q))
                .map((b) => ({ b, next: nextBirthday(b, now) }))
                .sort((x, y) => x.next.inDays - y.next.inDays || x.b.name.localeCompare(y.b.name, 'ja')),
        [birthdays, now, q]
    );

    // Group by the month of the next occurrence, in upcoming order.
    const groups = useMemo(() => {
        const out: { key: string; title: string; items: typeof sorted }[] = [];
        for (const item of sorted) {
            const key = `${item.next.date.y}-${item.next.date.m}`;
            const thisYear = item.next.date.y === new Date(now).getFullYear();
            let group = out.find((g) => g.key === key);
            if (!group) {
                group = { key, title: thisYear ? `${item.next.date.m}月` : `${item.next.date.y}年${item.next.date.m}月`, items: [] };
                out.push(group);
            }
            group.items.push(item);
        }
        return out;
    }, [sorted, now]);

    if (loading) return <div className={`${cardClass} h-40`} />;

    if (birthdays.length === 0) {
        return (
            <div className={`${cardClass} px-6 py-10 text-center`}>
                <div className="flex justify-center">
                    <IconTile name="cake" size={52} />
                </div>
                <p className="mt-4 text-[16px] font-bold text-ink">誕生日を登録</p>
                <p className="mt-1.5 text-[13px] text-ink-2 leading-relaxed">
                    家族や友人の誕生日を入れておくと、
                    <br />
                    あと何日かがわかり、前もって通知が届きます。
                </p>
            </div>
        );
    }

    const soonest = sorted[0];
    const todays = sorted.filter((x) => x.next.inDays === 0);

    const searchBox = (
        <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="名前・フリガナで検索"
                className="w-full bg-surface border border-line rounded-2xl pl-10 pr-10 py-2.5 text-base text-ink placeholder:text-ink-3 focus:outline-none focus:border-ink/25 [&::-webkit-search-cancel-button]:hidden"
            />
            {search && (
                <button
                    onClick={() => setSearch('')}
                    aria-label="検索をクリア"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-2 text-ink-2 flex items-center justify-center"
                >
                    <X size={13} />
                </button>
            )}
        </div>
    );

    if (!soonest) {
        return (
            <div className="space-y-7">
                {searchBox}
                <p className="text-center text-[14px] text-ink-3 py-12">該当する人はいません</p>
            </div>
        );
    }

    return (
        <div className="space-y-7">
            {q === '' && (
                <div className={`${cardClass} overflow-hidden`}>
                    {todays.length > 0 ? (
                        <div className="bg-accent-soft divide-y divide-line">
                            {todays.map(({ b, next }) => (
                                <button key={b.id} onClick={() => onOpen(b)} className="w-full flex items-center gap-3.5 px-4 py-4 text-left">
                                    <Avatar name={b.name} size={44} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[12px] text-accent">今日は</p>
                                        <p className="text-[15px] font-medium text-ink truncate">{b.name}の誕生日</p>
                                    </div>
                                    {next.age !== null && <p className="text-[22px] font-semibold text-ink tracking-tight">{next.age}歳</p>}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <button onClick={() => onOpen(soonest.b)} className="w-full flex items-center gap-3.5 px-4 py-4 text-left">
                            <Avatar name={soonest.b.name} size={44} />
                            <div className="min-w-0 flex-1">
                                <p className="text-[12px] text-ink-3">次の誕生日</p>
                                <p className="text-[15px] font-medium text-ink truncate">{soonest.b.name}</p>
                                <p className="text-[12px] text-ink-3 mt-0.5">{describe(soonest.next)}</p>
                            </div>
                            <p className="text-ink tabular-nums shrink-0">
                                <span className="text-[12px] text-ink-2 mr-0.5">あと</span>
                                <span className="text-[26px] font-semibold tracking-tight">{soonest.next.inDays}</span>
                                <span className="text-[12px] text-ink-2 ml-0.5">日</span>
                            </p>
                        </button>
                    )}
                </div>
            )}

            {birthdays.length > 8 && searchBox}

            {groups.map((group) => (
                <section key={group.key}>
                    <GroupHeader title={group.title} count={group.items.length} />
                    <div className={`${cardClass} divide-y divide-line overflow-hidden`}>
                        {group.items.map(({ b, next }) => (
                            <button
                                key={b.id}
                                onClick={() => onOpen(b)}
                                className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-surface-2/60"
                            >
                                <Avatar name={b.name} size={40} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[15px] font-medium text-ink truncate">{b.name}</p>
                                    <p className="mt-0.5 text-[12px] text-ink-3 truncate">
                                        {describe(next)}
                                        {b.relation && ` · ${b.relation}`}
                                    </p>
                                </div>
                                <p className="shrink-0 text-right text-ink tabular-nums">
                                    {next.inDays === 0 ? (
                                        <span className="text-[14px] font-medium text-accent">今日</span>
                                    ) : (
                                        <>
                                            <span className="text-[12px] text-ink-2 mr-0.5">あと</span>
                                            <span className="text-[20px] font-semibold tracking-tight">{next.inDays}</span>
                                            <span className="text-[12px] text-ink-2 ml-0.5">日</span>
                                        </>
                                    )}
                                </p>
                            </button>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}

function describe(next: NextBirthday): string {
    return `${next.date.m}月${next.date.d}日${next.age !== null ? ` · ${next.age}歳になる` : ''}`;
}
