'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Bell, Plus, LogOut, Search, X } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import EventCard from '@/components/EventCard';
import AddEventModal from '@/components/AddEventModal';
import EventDetailModal from '@/components/EventDetailModal';
import NotificationSheet from '@/components/NotificationSheet';
import { Chip, Eyebrow, SectionTitle, Segmented, Toast, ToastState, cardClass } from '@/components/ui';
import { LifeEvent, EventCategory, CATEGORY_ENTRIES } from '@/types';
import { getUrgency, isSameDay, Urgency } from '@/lib/time';
import { useNow } from '@/hooks/useNow';
import { getPushSupport } from '@/lib/notifications';

type SortKey = 'elapsed' | 'name';

const SECTIONS: { key: string; emoji: string; title: string; subtitle: string; match: Urgency[] }[] = [
    { key: 'long', emoji: '🚨', title: 'Overdue', subtitle: 'ご無沙汰 · 1週間以上 / 未記録', match: ['over', 'never'] },
    { key: 'soon', emoji: '⏳', title: 'Soon', subtitle: 'そろそろ · 3〜7日', match: ['warn'] },
    { key: 'recent', emoji: '✅', title: 'Recent', subtitle: '最近やった · 3日以内', match: ['ok', 'fresh'] },
];

const SUGGESTIONS = ['💪 ジム', '💇 散髪', '🦷 歯医者', '🛏️ シーツを洗う', '📞 実家に電話', '🚗 洗車'];

const NOTIFY_PROMPT_KEY = 'lifetracker.notifyPromptDismissed';

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
    const [showNotifications, setShowNotifications] = useState(false);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState<EventCategory | 'all'>('all');
    const [sortBy, setSortBy] = useState<SortKey>('elapsed');
    const [toast, setToast] = useState<ToastState | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showNotifyPrompt, setShowNotifyPrompt] = useState(false);
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

    // Suggest turning on notifications once, on devices that can receive them.
    useEffect(() => {
        let dismissed = false;
        try {
            dismissed = localStorage.getItem(NOTIFY_PROMPT_KEY) === '1';
        } catch {}
        if (dismissed || typeof Notification === 'undefined' || Notification.permission !== 'default') return;
        getPushSupport().then((s) => setShowNotifyPrompt(s === 'supported'));
    }, []);

    const dismissNotifyPrompt = () => {
        setShowNotifyPrompt(false);
        try {
            localStorage.setItem(NOTIFY_PROMPT_KEY, '1');
        } catch {}
    };

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
        if (sortBy !== 'elapsed') {
            return [{ key: 'all', emoji: '🗂️', title: 'All Items', subtitle: '名前順', items: filtered }];
        }
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
            <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-xl border-b border-line pt-[env(safe-area-inset-top)]">
                <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
                    <p className="text-ink font-black tracking-tight text-[18px]">⏱️ LifeTracker</p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowNotifications(true)}
                            aria-label="通知設定"
                            className="w-9 h-9 rounded-full bg-surface border border-line text-ink flex items-center justify-center hover:bg-surface-2"
                        >
                            <Bell size={17} strokeWidth={2.5} />
                        </button>
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen((v) => !v)}
                                aria-label="アカウントメニュー"
                                aria-expanded={menuOpen}
                                className="w-9 h-9 rounded-full bg-ink text-canvas font-black text-sm flex items-center justify-center"
                            >
                                {initial}
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-surface border border-line rounded-xl shadow-xl p-1.5">
                                    <p className="px-3 py-2 text-xs font-medium text-ink-3 truncate">{user?.email}</p>
                                    <button
                                        onClick={logOut}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold text-ink hover:bg-surface-2"
                                    >
                                        <LogOut size={16} strokeWidth={2.5} />
                                        ログアウト
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 pb-36">
                {/* Today */}
                <section className="pt-7 pb-6">
                    <SectionTitle emoji="📋" title="Today" subtitle={format(now, 'yyyy年M月d日(E)', { locale: ja })} size="lg" />

                    {!isEmpty && (
                        <div className="mt-5 grid grid-cols-3 gap-2.5">
                            <Stat eyebrow="Total" label="記録中" value={stats.total} bar="border-l-ink" />
                            <Stat
                                eyebrow="Overdue"
                                label="ご無沙汰"
                                value={stats.overdue}
                                bar="border-l-over"
                                tone={stats.overdue > 0 ? 'text-over' : undefined}
                            />
                            <Stat
                                eyebrow="Done"
                                label="今日やった"
                                value={stats.doneToday}
                                bar="border-l-fresh"
                                tone={stats.doneToday > 0 ? 'text-fresh' : undefined}
                            />
                        </div>
                    )}

                    {showNotifyPrompt && (
                        <div className={`${cardClass} border-l-ok mt-3 flex items-center gap-3 pl-4 pr-2 py-3`}>
                            <button onClick={() => setShowNotifications(true)} className="flex-1 min-w-0 text-left">
                                <p className="text-[15px] font-bold text-ink">🔔 毎朝の通知をオンにする</p>
                                <p className="text-[13px] text-ink-2 mt-0.5">ご無沙汰な項目を 8:00 ごろにお知らせ</p>
                            </button>
                            <button
                                onClick={dismissNotifyPrompt}
                                aria-label="閉じる"
                                className="w-8 h-8 shrink-0 rounded-full text-ink-3 hover:text-ink flex items-center justify-center"
                            >
                                <X size={16} strokeWidth={2.5} />
                            </button>
                        </div>
                    )}
                </section>

                {!isEmpty && (
                    <section className="space-y-3 mb-8">
                        <div className="relative">
                            <Search size={17} strokeWidth={2.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="検索"
                                className="w-full bg-surface border border-line rounded-xl pl-10 pr-10 py-3 text-ink font-medium placeholder:text-ink-3 focus:outline-none focus:border-ink/40 text-[15px] [&::-webkit-search-cancel-button]:hidden"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    aria-label="検索をクリア"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-2 text-ink-2 flex items-center justify-center"
                                >
                                    <X size={14} strokeWidth={2.5} />
                                </button>
                            )}
                        </div>

                        <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
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

                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-ink-3">{filtered.length}件</p>
                            <div className="w-40">
                                <Segmented
                                    value={sortBy}
                                    onChange={setSortBy}
                                    size="sm"
                                    options={[
                                        ['elapsed', '経過順'],
                                        ['name', '名前順'],
                                    ]}
                                />
                            </div>
                        </div>
                    </section>
                )}

                {/* Event list */}
                {loading ? (
                    <div className="space-y-2.5">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className={`${cardClass} border-l-line h-[86px]`} />
                        ))}
                    </div>
                ) : isEmpty ? (
                    <EmptyState onPick={(name) => setAddState({ name })} />
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-ink font-bold">一致する項目がありません</p>
                        <button
                            onClick={() => {
                                setSearch('');
                                setFilterCategory('all');
                            }}
                            className="mt-3 text-sm font-bold text-ink underline underline-offset-4"
                        >
                            条件をクリア
                        </button>
                    </div>
                ) : (
                    <div className="space-y-9">
                        {sections.map((section) => (
                            <section key={section.key}>
                                <SectionTitle
                                    emoji={section.emoji}
                                    title={section.title}
                                    subtitle={section.subtitle}
                                    trailing={
                                        <span className="text-[15px] font-black text-ink-3 tabular-nums">{section.items.length}</span>
                                    }
                                />
                                <div className="mt-3.5 space-y-2.5">
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
                        className="pointer-events-auto flex items-center gap-2 h-14 pl-5 pr-6 bg-ink text-canvas rounded-full shadow-[0_10px_28px_-8px_rgba(0,0,0,0.5)] font-bold"
                    >
                        <Plus size={22} strokeWidth={3} />
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
            {showNotifications && user && (
                <NotificationSheet
                    user={user}
                    onClose={() => {
                        setShowNotifications(false);
                        setShowNotifyPrompt(false);
                    }}
                />
            )}
        </div>
    );
}

function Stat({ eyebrow, label, value, bar, tone }: { eyebrow: string; label: string; value: number; bar: string; tone?: string }) {
    return (
        <div className={`${cardClass} ${bar} px-3.5 py-3`}>
            <Eyebrow className="text-[10px]">{eyebrow}</Eyebrow>
            <p className={`mt-1 text-[28px] leading-none font-black tabular-nums tracking-tight ${tone ?? 'text-ink'}`}>{value}</p>
            <p className="text-xs font-bold text-ink-2 mt-1.5">{label}</p>
        </div>
    );
}

function EmptyState({ onPick }: { onPick: (name: string) => void }) {
    return (
        <div className={`${cardClass} border-l-ink px-5 py-6`}>
            <Eyebrow>Get Started</Eyebrow>
            <p className="mt-1 text-[20px] font-black text-ink">最初の項目を追加</p>
            <p className="mt-1 text-[14px] text-ink-2">定期的にやることを登録し、やったらチェック。経過日数が自動で表示されます。</p>
            <div className="mt-5 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                    <button
                        key={s}
                        onClick={() => onPick(s.split(' ').slice(1).join(' '))}
                        className="px-3.5 py-2 rounded-full bg-surface-2 border border-line text-sm font-bold text-ink hover:bg-ink/5"
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
}
