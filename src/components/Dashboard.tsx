'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Plus, LogOut, Search, X } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import EventCard from '@/components/EventCard';
import AddEventModal from '@/components/AddEventModal';
import EventDetailModal from '@/components/EventDetailModal';
import { Logo, Toast, ToastState } from '@/components/ui';
import { LifeEvent, EventCategory, CATEGORY_ENTRIES } from '@/types';
import { getUrgency, isSameDay, useNow, Urgency } from '@/lib/time';

type SortKey = 'elapsed' | 'name';

const SECTIONS: { key: string; title: string; caption: string; match: Urgency[] }[] = [
    { key: 'long', title: 'ご無沙汰', caption: '1週間以上 / 未記録', match: ['over', 'never'] },
    { key: 'soon', title: 'そろそろ', caption: '3〜7日', match: ['warn'] },
    { key: 'recent', title: '最近やった', caption: '3日以内', match: ['ok', 'fresh'] },
];

const SUGGESTIONS = ['ジム', '散髪', '歯医者', 'シーツを洗う', '実家に電話', '車の洗車'];

/** Oldest (or never done) first. */
function compareByElapsed(a: LifeEvent, b: LifeEvent): number {
    const at = a.lastExecutedDate?.getTime() ?? -Infinity;
    const bt = b.lastExecutedDate?.getTime() ?? -Infinity;
    if (at === bt) return a.name.localeCompare(b.name, 'ja');
    return at - bt;
}

export default function Dashboard() {
    const { user, logOut } = useAuth();
    const { events, loading, createEvent, markAsExecuted, updateEvent, deleteEvent } = useEvents();
    const now = useNow();
    const [addState, setAddState] = useState<{ name: string } | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState<EventCategory | 'all'>('all');
    const [sortBy, setSortBy] = useState<SortKey>('elapsed');
    const [toast, setToast] = useState<ToastState | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const selectedEvent = events.find((e) => e.id === selectedId) ?? null;

    useEffect(() => {
        if (!menuOpen) return;
        const onDown = (e: MouseEvent) => {
            if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [menuOpen]);

    const showToast = useCallback((message: string, onUndo?: () => void) => {
        setToast({ id: Date.now(), message, onUndo });
    }, []);
    const dismissToast = useCallback(() => setToast(null), []);

    const handleMark = useCallback(
        (event: LifeEvent, date?: Date) => {
            const previous = event.lastExecutedDate;
            markAsExecuted(event.id, date).catch(() => showToast('記録に失敗しました'));
            showToast(`「${event.name}」を記録しました`, () => {
                updateEvent(event.id, { lastExecutedDate: previous });
            });
        },
        [markAsExecuted, updateEvent, showToast]
    );

    const handleDelete = useCallback(
        (event: LifeEvent) => {
            deleteEvent(event.id)
                .then(() => showToast(`「${event.name}」を削除しました`))
                .catch(() => showToast('削除に失敗しました'));
        },
        [deleteEvent, showToast]
    );

    const categoryCounts = useMemo(() => {
        const counts: Partial<Record<EventCategory, number>> = {};
        for (const e of events) counts[e.category] = (counts[e.category] ?? 0) + 1;
        return counts;
    }, [events]);

    const filtered = useMemo(() => {
        let list = events;
        if (filterCategory !== 'all') list = list.filter((e) => e.category === filterCategory);
        const q = search.trim().toLowerCase();
        if (q) list = list.filter((e) => e.name.toLowerCase().includes(q) || e.notes.toLowerCase().includes(q));
        return [...list].sort(sortBy === 'elapsed' ? compareByElapsed : (a, b) => a.name.localeCompare(b.name, 'ja'));
    }, [events, filterCategory, search, sortBy]);

    const stats = useMemo(() => {
        const today = new Date(now);
        let overdue = 0;
        let doneToday = 0;
        for (const e of events) {
            const u = getUrgency(e.lastExecutedDate, now);
            if (u === 'over' || u === 'never') overdue++;
            if (e.lastExecutedDate && isSameDay(e.lastExecutedDate, today)) doneToday++;
        }
        return { total: events.length, overdue, doneToday };
    }, [events, now]);

    const sections = useMemo(() => {
        if (sortBy !== 'elapsed') return [{ key: 'all', title: '', caption: '', items: filtered }];
        return SECTIONS.map((s) => ({
            ...s,
            items: filtered.filter((e) => s.match.includes(getUrgency(e.lastExecutedDate, now))),
        })).filter((s) => s.items.length > 0);
    }, [filtered, sortBy, now]);

    const initial = (user?.email ?? '?').charAt(0).toUpperCase();
    const isEmpty = !loading && events.length === 0;

    return (
        <div className="min-h-dvh bg-canvas">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-canvas/85 backdrop-blur-xl border-b border-line pt-[env(safe-area-inset-top)]">
                <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <Logo size={30} />
                        <span className="text-ink font-bold tracking-tight text-[17px]">LifeTracker</span>
                    </div>
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen((v) => !v)}
                            aria-label="アカウントメニュー"
                            aria-expanded={menuOpen}
                            className="w-9 h-9 rounded-full bg-surface-2 text-ink font-semibold text-sm flex items-center justify-center hover:bg-ink/10 transition-colors"
                        >
                            {initial}
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-surface border border-line rounded-2xl shadow-xl p-1.5 animate-fade-in">
                                <p className="px-3 py-2 text-xs text-ink-3 truncate">{user?.email}</p>
                                <button
                                    onClick={logOut}
                                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-surface-2 transition-colors"
                                >
                                    <LogOut size={16} className="text-ink-2" />
                                    ログアウト
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 pb-36">
                {/* Hero */}
                <section className="pt-7 pb-6">
                    <p className="text-sm font-medium text-ink-3">{format(now, 'M月d日(E)', { locale: ja })}</p>
                    <h1 className="mt-1 text-[26px] leading-tight font-bold tracking-tight text-ink">
                        {loading ? (
                            '読み込み中…'
                        ) : isEmpty ? (
                            'ようこそ！'
                        ) : stats.overdue > 0 ? (
                            <>
                                しばらくやってないことが
                                <br />
                                <span className="text-over">{stats.overdue}件</span> あります
                            </>
                        ) : (
                            <>
                                ぜんぶ順調です <span className="text-fresh">✓</span>
                            </>
                        )}
                    </h1>

                    {!isEmpty && (
                        <div className="mt-5 grid grid-cols-3 gap-2">
                            <Stat label="記録中" value={stats.total} />
                            <Stat label="ご無沙汰" value={stats.overdue} tone={stats.overdue > 0 ? 'text-over' : undefined} />
                            <Stat label="今日やった" value={stats.doneToday} tone={stats.doneToday > 0 ? 'text-fresh' : undefined} />
                        </div>
                    )}
                </section>

                {!isEmpty && (
                    <section className="space-y-3 mb-6">
                        <div className="relative">
                            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="検索"
                                className="w-full bg-surface border border-line rounded-xl pl-10 pr-10 py-2.5 text-ink placeholder:text-ink-3 focus:outline-none focus:border-ink/30 transition-colors text-[15px] [&::-webkit-search-cancel-button]:hidden"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    aria-label="検索をクリア"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-2 text-ink-2 flex items-center justify-center"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 flex gap-1.5 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                                <Chip active={filterCategory === 'all'} onClick={() => setFilterCategory('all')}>
                                    すべて
                                </Chip>
                                {CATEGORY_ENTRIES.filter(([key]) => categoryCounts[key]).map(([key, cfg]) => (
                                    <Chip key={key} active={filterCategory === key} onClick={() => setFilterCategory(key)}>
                                        <span>{cfg.emoji}</span>
                                        {cfg.label}
                                        <span className="opacity-50 tabular-nums">{categoryCounts[key]}</span>
                                    </Chip>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-ink-3">{filtered.length}件</p>
                            <div className="flex p-0.5 bg-surface-2 rounded-lg text-xs font-medium">
                                {(
                                    [
                                        ['elapsed', '経過順'],
                                        ['name', '名前順'],
                                    ] as [SortKey, string][]
                                ).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSortBy(key)}
                                        aria-pressed={sortBy === key}
                                        className={`px-3 py-1.5 rounded-md transition-all ${
                                            sortBy === key ? 'bg-surface text-ink shadow-sm' : 'text-ink-2 hover:text-ink'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Event list */}
                {loading ? (
                    <div className="space-y-2">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="h-[74px] rounded-2xl bg-surface border border-line animate-pulse" />
                        ))}
                    </div>
                ) : isEmpty ? (
                    <EmptyState onPick={(name) => setAddState({ name })} />
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-ink-2 font-medium">一致する項目がありません</p>
                        <button
                            onClick={() => {
                                setSearch('');
                                setFilterCategory('all');
                            }}
                            className="mt-3 text-sm font-semibold text-ink underline underline-offset-4"
                        >
                            条件をクリア
                        </button>
                    </div>
                ) : (
                    <div className="space-y-7">
                        {sections.map((section) => (
                            <section key={section.key}>
                                {section.title && (
                                    <div className="flex items-baseline gap-2 mb-2.5 px-1">
                                        <h2 className="text-[15px] font-bold text-ink">{section.title}</h2>
                                        <span className="text-xs text-ink-3">{section.caption}</span>
                                        <span className="ml-auto text-xs font-semibold text-ink-3 tabular-nums">
                                            {section.items.length}
                                        </span>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    {section.items.map((event) => (
                                        <EventCard
                                            key={event.id}
                                            event={event}
                                            now={now}
                                            onMark={handleMark}
                                            onOpen={(e) => setSelectedId(e.id)}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </main>

            {/* Add button */}
            <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
                <div className="max-w-2xl mx-auto px-4 flex justify-end">
                    <button
                        onClick={() => setAddState({ name: '' })}
                        id="add-event-fab"
                        className="pointer-events-auto flex items-center gap-2 h-14 pl-5 pr-6 bg-ink text-canvas rounded-full shadow-[0_12px_32px_-8px_rgba(0,0,0,0.45)] font-semibold transition-all hover:scale-[1.03] active:scale-95"
                    >
                        <Plus size={22} strokeWidth={2.5} />
                        追加
                    </button>
                </div>
            </div>

            <Toast toast={toast} onDismiss={dismissToast} />

            {addState && (
                <AddEventModal initialName={addState.name} onClose={() => setAddState(null)} onAdd={createEvent} />
            )}
            {selectedEvent && (
                <EventDetailModal
                    key={selectedEvent.id}
                    event={selectedEvent}
                    now={now}
                    onClose={() => setSelectedId(null)}
                    onMark={handleMark}
                    onDelete={handleDelete}
                    onUpdate={updateEvent}
                />
            )}
        </div>
    );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
    return (
        <div className="bg-surface border border-line rounded-2xl px-3.5 py-3">
            <p className={`text-2xl font-bold tabular-nums tracking-tight ${tone ?? 'text-ink'}`}>{value}</p>
            <p className="text-xs text-ink-3 mt-0.5">{label}</p>
        </div>
    );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            aria-pressed={active}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all ${
                active ? 'bg-ink text-canvas border-ink' : 'bg-surface border-line text-ink-2 hover:text-ink hover:border-ink/25'
            }`}
        >
            {children}
        </button>
    );
}

function EmptyState({ onPick }: { onPick: (name: string) => void }) {
    return (
        <div className="bg-surface border border-line rounded-3xl px-6 py-10 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center text-3xl">🗓️</div>
            <h2 className="mt-4 text-lg font-bold text-ink">やったことを記録しよう</h2>
            <p className="mt-1.5 text-sm text-ink-2 leading-relaxed">
                定期的にやりたいことを追加して、
                <br />
                やったらチェックするだけ。
            </p>
            <p className="mt-6 text-xs font-semibold text-ink-3">たとえば</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                    <button
                        key={s}
                        onClick={() => onPick(s)}
                        className="px-3.5 py-2 rounded-full border border-line text-sm font-medium text-ink hover:bg-surface-2 transition-colors"
                    >
                        + {s}
                    </button>
                ))}
            </div>
        </div>
    );
}
