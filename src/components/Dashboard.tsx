'use client';

import { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Plus, Search, Settings2, X } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useGifts } from '@/hooks/useGifts';
import { useAuth } from '@/contexts/AuthContext';
import { useNow } from '@/hooks/useNow';
import { MilestoneRow, RoutineRow } from '@/components/EventCard';
import AddEventModal from '@/components/AddEventModal';
import EventDetailModal from '@/components/EventDetailModal';
import GiftsTab from '@/components/GiftsTab';
import GiftSheet from '@/components/GiftSheet';
import SettingsTab from '@/components/SettingsTab';
import { GroupHeader, Segmented, Toast, ToastState, cardClass } from '@/components/ui';
import { Glyph, IconTile } from '@/lib/icons';
import { LifeEvent, EventKind, Gift } from '@/types';
import { getUrgency, Occasion, upcomingOccasions } from '@/lib/time';

type Tab = 'home' | 'gifts' | 'settings';

const SUGGESTIONS: Record<EventKind, { name: string; icon: string }[]> = {
    milestone: [
        { name: '付き合った日', icon: 'heart' },
        { name: 'プロポーズした日', icon: 'ring' },
        { name: '結婚式', icon: 'ring' },
        { name: '今の家に引っ越した日', icon: 'home' },
        { name: '入社した日', icon: 'briefcase' },
        { name: '子どもが生まれた日', icon: 'baby' },
    ],
    routine: [
        { name: '髪を切る', icon: 'scissors' },
        { name: '歯医者', icon: 'tooth' },
        { name: 'ジム', icon: 'dumbbell' },
        { name: '実家に電話', icon: 'phone' },
        { name: '洗車', icon: 'car' },
        { name: '植物に水をやる', icon: 'leaf' },
    ],
};

/** Oldest (or never done) first. */
function compareByElapsed(a: LifeEvent, b: LifeEvent): number {
    const at = a.lastExecutedDate?.getTime() ?? -Infinity;
    const bt = b.lastExecutedDate?.getTime() ?? -Infinity;
    return at === bt ? a.name.localeCompare(b.name, 'ja') : at - bt;
}

export default function Dashboard() {
    const { user, logOut } = useAuth();
    const { events, loading, createEvent, markAsExecuted, updateEvent, deleteEvent } = useEvents();
    const { gifts, loading: giftsLoading, createGift, updateGift, deleteGift } = useGifts();
    const now = useNow();

    const [tab, setTab] = useState<Tab>('home');
    const [kind, setKind] = useState<EventKind>('milestone');
    const [search, setSearch] = useState('');
    const [addEvent, setAddEvent] = useState<{ name: string; kind: EventKind; icon: string } | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [giftSheet, setGiftSheet] = useState<{ gift?: Gift; from?: string } | null>(null);
    const [toast, setToast] = useState<ToastState | null>(null);

    const selectedEvent = events.find((e) => e.id === selectedId) ?? null;

    const showToast = useCallback((message: string, onUndo?: () => void) => {
        setToast({ id: Date.now(), message, onUndo });
    }, []);
    const dismissToast = useCallback(() => setToast(null), []);

    const handleMark = useCallback(
        (event: LifeEvent, date?: Date) => {
            const previous = event.lastExecutedDate;
            markAsExecuted(event.id, date).catch(() => showToast('記録できませんでした'));
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
                .catch(() => showToast('削除できませんでした'));
        },
        [deleteEvent, showToast]
    );

    const milestones = useMemo(
        () =>
            events
                .filter((e) => e.kind === 'milestone')
                .sort((a, b) => (b.lastExecutedDate?.getTime() ?? 0) - (a.lastExecutedDate?.getTime() ?? 0)),
        [events]
    );
    const routines = useMemo(() => events.filter((e) => e.kind === 'routine').sort(compareByElapsed), [events]);

    // Today's anniversaries / round-number days, and what's coming up soon.
    const { todays, upcoming } = useMemo(() => {
        const all: { event: LifeEvent; occasion: Occasion }[] = [];
        for (const e of milestones) {
            if (!e.lastExecutedDate) continue;
            for (const o of upcomingOccasions(e.lastExecutedDate, now)) all.push({ event: e, occasion: o });
        }
        all.sort((a, b) => a.occasion.inDays - b.occasion.inDays);
        return {
            todays: all.filter((x) => x.occasion.inDays === 0),
            upcoming: all.filter((x) => x.occasion.inDays > 0 && x.occasion.inDays <= 60).slice(0, 3),
        };
    }, [milestones, now]);

    const overdue = routines.filter((e) => getUrgency(e.lastExecutedDate, now) === 'over').length;

    const q = search.trim().toLowerCase();
    const matches = (e: LifeEvent) => !q || e.name.toLowerCase().includes(q) || e.notes.toLowerCase().includes(q);
    const visibleMilestones = milestones.filter(matches);
    const visibleRoutines = routines.filter(matches);
    const staleRoutines = visibleRoutines.filter((e) => {
        const u = getUrgency(e.lastExecutedDate, now);
        return u === 'over' || u === 'never';
    });
    const recentRoutines = visibleRoutines.filter((e) => !staleRoutines.includes(e));

    const knownNames = useMemo(() => [...new Set(gifts.map((g) => g.from))], [gifts]);
    const openRow = (e: LifeEvent) => setSelectedId(e.id);

    const title = tab === 'home' ? 'ホーム' : tab === 'gifts' ? 'いただきもの' : '設定';

    return (
        <div className="min-h-dvh bg-canvas">
            <header className="sticky top-0 z-30 bg-canvas/85 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
                <div className="max-w-xl mx-auto px-5 h-14 flex items-center justify-between">
                    <h1 className="text-[17px] font-bold text-ink">{title}</h1>
                    {tab !== 'settings' && (
                        <button
                            onClick={() =>
                                tab === 'gifts' ? setGiftSheet({}) : setAddEvent({ name: '', kind, icon: kind === 'milestone' ? 'heart' : 'star' })
                            }
                            aria-label="追加"
                            className="w-9 h-9 rounded-full bg-ink text-canvas flex items-center justify-center hover:opacity-90"
                        >
                            <Plus size={18} strokeWidth={2} />
                        </button>
                    )}
                </div>
            </header>

            <main className="max-w-xl mx-auto px-5 pt-2 pb-[calc(7rem+env(safe-area-inset-bottom))]">
                {tab === 'home' && (
                    <>
                        {/* Today */}
                        <section className="mb-7">
                            <p className="text-[34px] font-bold text-ink leading-none tracking-tight">{format(now, 'M月d日', { locale: ja })}</p>
                            <p className="text-[13px] text-ink-3 mt-2">{format(now, 'yyyy年 · EEEE', { locale: ja })}</p>

                            <div className={`${cardClass} mt-5 overflow-hidden`}>
                                {todays.length > 0 ? (
                                    <div className="bg-accent-soft divide-y divide-line">
                                        {todays.map(({ event, occasion }) => (
                                            <button
                                                key={event.id + occasion.kind}
                                                onClick={() => openRow(event)}
                                                className="w-full flex items-center gap-3.5 px-4 py-4 text-left"
                                            >
                                                <IconTile name={event.icon} size={42} />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[12px] text-accent">今日は</p>
                                                    <p className="text-[15px] font-medium text-ink truncate">{event.name}から</p>
                                                </div>
                                                <p className="text-[22px] font-semibold text-ink tracking-tight">{occasion.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="px-4 py-4">
                                        <p className="text-[14px] text-ink-2">今日は記念日ではありません</p>
                                    </div>
                                )}
                                {upcoming.length > 0 && (
                                    <div className="border-t border-line px-4 py-3 space-y-2">
                                        <p className="text-[12px] text-ink-3">もうすぐ</p>
                                        {upcoming.map(({ event, occasion }) => (
                                            <button
                                                key={event.id + occasion.kind}
                                                onClick={() => openRow(event)}
                                                className="w-full flex items-center gap-2.5 text-left"
                                            >
                                                <Glyph name={event.icon} size={16} className="text-ink-3 shrink-0" />
                                                <span className="flex-1 min-w-0 truncate text-[14px] text-ink">
                                                    {event.name}
                                                    <span className="text-ink-3"> · {occasion.label}</span>
                                                </span>
                                                <span className="text-[13px] text-ink-2 tabular-nums shrink-0">あと{occasion.inDays}日</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {overdue > 0 && (
                                    <button
                                        onClick={() => setKind('routine')}
                                        className="w-full border-t border-line px-4 py-3 flex items-center justify-between text-left"
                                    >
                                        <span className="text-[14px] text-ink">しばらくやっていないこと</span>
                                        <span className="text-[13px] text-alert tabular-nums">{overdue}件</span>
                                    </button>
                                )}
                            </div>
                        </section>

                        <div className="space-y-2.5 mb-6">
                            <Segmented
                                value={kind}
                                onChange={setKind}
                                options={[
                                    ['milestone', `記念日・できごと ${milestones.length}`],
                                    ['routine', `くり返すこと ${routines.length}`],
                                ]}
                            />
                            {events.length > 5 && (
                                <div className="relative">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" />
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="検索"
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
                            )}
                        </div>

                        {loading ? (
                            <div className={`${cardClass} h-48`} />
                        ) : kind === 'milestone' ? (
                            visibleMilestones.length > 0 ? (
                                <RowGroup>
                                    {visibleMilestones.map((e) => (
                                        <MilestoneRow key={e.id} event={e} now={now} onOpen={openRow} />
                                    ))}
                                </RowGroup>
                            ) : (
                                <Suggestions
                                    kind="milestone"
                                    empty={!q}
                                    onPick={(s) => setAddEvent({ ...s, kind: 'milestone' })}
                                />
                            )
                        ) : visibleRoutines.length > 0 ? (
                            <div className="space-y-6">
                                {staleRoutines.length > 0 && (
                                    <section>
                                        <GroupHeader title="しばらくやっていない" count={staleRoutines.length} />
                                        <RowGroup>
                                            {staleRoutines.map((e) => (
                                                <RoutineRow key={e.id} event={e} now={now} onOpen={openRow} onMark={handleMark} />
                                            ))}
                                        </RowGroup>
                                    </section>
                                )}
                                {recentRoutines.length > 0 && (
                                    <section>
                                        <GroupHeader title="最近" count={recentRoutines.length} />
                                        <RowGroup>
                                            {recentRoutines.map((e) => (
                                                <RoutineRow key={e.id} event={e} now={now} onOpen={openRow} onMark={handleMark} />
                                            ))}
                                        </RowGroup>
                                    </section>
                                )}
                            </div>
                        ) : (
                            <Suggestions kind="routine" empty={!q} onPick={(s) => setAddEvent({ ...s, kind: 'routine' })} />
                        )}
                    </>
                )}

                {tab === 'gifts' && (
                    <GiftsTab
                        gifts={gifts}
                        loading={giftsLoading}
                        onOpen={(gift) => setGiftSheet({ gift })}
                        onAddFor={(from) => setGiftSheet({ from })}
                    />
                )}

                {tab === 'settings' && user && <SettingsTab user={user} onLogOut={logOut} />}
            </main>

            {/* Tab bar */}
            <nav className="fixed inset-x-0 bottom-0 z-40 bg-canvas/90 backdrop-blur-xl border-t border-line pb-[env(safe-area-inset-bottom)]">
                <div className="max-w-xl mx-auto grid grid-cols-3">
                    {(
                        [
                            ['home', 'ホーム', <Glyph key="h" name="calendar" size={22} />],
                            ['gifts', 'いただきもの', <Glyph key="g" name="gift" size={22} />],
                            ['settings', '設定', <Settings2 key="s" size={22} strokeWidth={1.6} />],
                        ] as [Tab, string, React.ReactNode][]
                    ).map(([key, label, icon]) => (
                        <button
                            key={key}
                            onClick={() => {
                                setTab(key);
                                window.scrollTo(0, 0);
                            }}
                            aria-current={tab === key ? 'page' : undefined}
                            className={`flex flex-col items-center gap-1 pt-2.5 pb-2 text-[10px] font-medium ${
                                tab === key ? 'text-ink' : 'text-ink-3 hover:text-ink-2'
                            }`}
                        >
                            {icon}
                            {label}
                        </button>
                    ))}
                </div>
            </nav>

            <Toast toast={toast} onDismiss={dismissToast} />

            {addEvent && <AddEventModal initial={addEvent} onClose={() => setAddEvent(null)} onAdd={createEvent} />}
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
            {giftSheet && (
                <GiftSheet
                    key={giftSheet.gift?.id ?? 'new'}
                    gift={giftSheet.gift}
                    initialFrom={giftSheet.from}
                    knownNames={knownNames}
                    onClose={() => setGiftSheet(null)}
                    onSave={(data) => (giftSheet.gift ? updateGift(giftSheet.gift.id, data) : createGift(data))}
                    onDelete={
                        giftSheet.gift
                            ? () => {
                                  const g = giftSheet.gift!;
                                  deleteGift(g.id).then(() => showToast(`${g.from}さんの記録を削除しました`));
                              }
                            : undefined
                    }
                />
            )}
        </div>
    );
}

function RowGroup({ children }: { children: React.ReactNode }) {
    return <div className={`${cardClass} divide-y divide-line overflow-hidden`}>{children}</div>;
}

function Suggestions({
    kind,
    empty,
    onPick,
}: {
    kind: EventKind;
    empty: boolean;
    onPick: (s: { name: string; icon: string }) => void;
}) {
    if (!empty) return <p className="text-center text-[14px] text-ink-3 py-12">一致するものはありません</p>;
    return (
        <div>
            <p className="text-[13px] text-ink-2 px-1 mb-3">
                {kind === 'milestone' ? '覚えておきたい日を追加しましょう' : '定期的にやることを追加しましょう'}
            </p>
            <RowGroup>
                {SUGGESTIONS[kind].map((s) => (
                    <button
                        key={s.name}
                        onClick={() => onPick(s)}
                        className="w-full flex items-center gap-3.5 px-4 py-3 text-left hover:bg-surface-2/60"
                    >
                        <IconTile name={s.icon} size={36} />
                        <span className="flex-1 text-[15px] text-ink">{s.name}</span>
                        <Plus size={16} className="text-ink-3" />
                    </button>
                ))}
            </RowGroup>
        </div>
    );
}
