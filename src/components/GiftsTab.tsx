'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Search, X } from 'lucide-react';
import { Gift } from '@/types';
import { IconTile, OCCASION_ICON } from '@/lib/icons';
import { GroupHeader, Pill, Segmented, cardClass } from '@/components/ui';

type Filter = 'all' | 'open' | 'done';

interface PersonGroup {
    name: string;
    gifts: Gift[];
    total: number;
    open: number;
}

export default function GiftsTab({
    gifts,
    loading,
    onOpen,
    onAddFor,
}: {
    gifts: Gift[];
    loading: boolean;
    onOpen: (gift: Gift) => void;
    onAddFor: (name: string) => void;
}) {
    const [filter, setFilter] = useState<Filter>('all');
    const [search, setSearch] = useState('');

    const openCount = gifts.filter((g) => !g.returned).length;
    const people = new Set(gifts.map((g) => g.from)).size;

    const groups = useMemo(() => {
        const q = search.trim().toLowerCase();
        const map = new Map<string, PersonGroup>();
        for (const g of gifts) {
            if (filter === 'open' && g.returned) continue;
            if (filter === 'done' && !g.returned) continue;
            if (q && ![g.from, g.item, g.occasion, g.notes, g.returnNote].some((s) => s.toLowerCase().includes(q))) continue;
            const group = map.get(g.from) ?? { name: g.from, gifts: [], total: 0, open: 0 };
            group.gifts.push(g);
            group.total += g.amount ?? 0;
            if (!g.returned) group.open++;
            map.set(g.from, group);
        }
        // People you still owe come first, then by most recent gift.
        return [...map.values()].sort((a, b) => b.open - a.open || b.gifts[0].date.getTime() - a.gifts[0].date.getTime());
    }, [gifts, filter, search]);

    if (loading) {
        return <div className={`${cardClass} h-40`} />;
    }

    if (gifts.length === 0) {
        return (
            <div className={`${cardClass} px-6 py-10 text-center`}>
                <div className="flex justify-center">
                    <IconTile name="gift" size={52} />
                </div>
                <p className="mt-4 text-[16px] font-bold text-ink">いただきものを記録</p>
                <p className="mt-1.5 text-[13px] text-ink-2 leading-relaxed">
                    誰に何をもらったかを残しておけば、
                    <br />
                    その人のお祝いのときに見返せます。
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-2 gap-2.5 mb-5">
                <div className={`${cardClass} px-4 py-3.5`}>
                    <p className="text-[12px] text-ink-3">いただいた人</p>
                    <p className="mt-1 text-[24px] font-semibold text-ink tabular-nums leading-none">
                        {people}
                        <span className="text-[12px] text-ink-2 font-normal ml-0.5">人</span>
                    </p>
                </div>
                <button onClick={() => setFilter('open')} className={`${cardClass} px-4 py-3.5 text-left`}>
                    <p className="text-[12px] text-ink-3">まだお返ししていない</p>
                    <p className="mt-1 text-[24px] font-semibold text-ink tabular-nums leading-none">
                        {openCount}
                        <span className="text-[12px] text-ink-2 font-normal ml-0.5">件</span>
                    </p>
                </button>
            </div>

            <div className="space-y-2.5 mb-6">
                <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="名前・品物で検索"
                        className="w-full bg-surface border border-line rounded-2xl pl-10 pr-10 py-2.5 text-[14px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-ink/25 [&::-webkit-search-cancel-button]:hidden"
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
                <Segmented
                    value={filter}
                    onChange={setFilter}
                    options={[
                        ['all', 'すべて'],
                        ['open', 'お返し前'],
                        ['done', 'お返し済み'],
                    ]}
                />
            </div>

            {groups.length === 0 ? (
                <p className="text-center text-[14px] text-ink-3 py-12">該当する記録はありません</p>
            ) : (
                <div className="space-y-6">
                    {groups.map((group) => (
                        <section key={group.name}>
                            <GroupHeader
                                title={group.name}
                                count={group.gifts.length}
                                action={
                                    <button onClick={() => onAddFor(group.name)} className="text-[12px] text-ink-3 hover:text-ink">
                                        ＋ 追加
                                    </button>
                                }
                            />
                            <div className={`${cardClass} divide-y divide-line overflow-hidden`}>
                                {group.gifts.map((g) => (
                                    <button
                                        key={g.id}
                                        onClick={() => onOpen(g)}
                                        className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-surface-2/60"
                                    >
                                        <IconTile name={OCCASION_ICON[g.occasion] ?? 'gift'} size={40} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[15px] font-medium text-ink truncate">
                                                {g.occasion}
                                                {g.item && <span className="text-ink-2 font-normal"> · {g.item}</span>}
                                            </p>
                                            <p className="mt-0.5 text-[12px] text-ink-3 truncate">
                                                {format(g.date, 'yyyy.M.d')}
                                                {g.returnNote && ` · ${g.returned ? 'お返し：' : '予定：'}${g.returnNote}`}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right space-y-1">
                                            {g.amount != null && (
                                                <p className="text-[14px] font-medium text-ink tabular-nums">¥{g.amount.toLocaleString('ja-JP')}</p>
                                            )}
                                            {g.returned ? <Pill>お返し済み</Pill> : <Pill tone="alert">お返し前</Pill>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
