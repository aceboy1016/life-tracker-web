'use client';

import { useState, useMemo } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import EventCard from '@/components/EventCard';
import AddEventModal from '@/components/AddEventModal';
import EventDetailModal from '@/components/EventDetailModal';
import { LifeEvent, EventCategory, CATEGORY_CONFIG } from '@/types';
import { Plus, LogOut, Activity, Search, ChevronDown } from 'lucide-react';

const ALL_CATEGORIES = 'all';

export default function Dashboard() {
    const { user, logOut } = useAuth();
    const { events, loading, createEvent, markAsExecuted, updateEvent, deleteEvent } = useEvents();
    const [showAdd, setShowAdd] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState<EventCategory | 'all'>(ALL_CATEGORIES);
    const [sortBy, setSortBy] = useState<'name' | 'elapsed'>('elapsed');

    const filtered = useMemo(() => {
        let list = [...events];

        // category filter
        if (filterCategory !== 'all') {
            list = list.filter((e) => e.category === filterCategory);
        }

        // search
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (e) => e.name.toLowerCase().includes(q) || e.notes.toLowerCase().includes(q)
            );
        }

        // sort
        if (sortBy === 'elapsed') {
            list.sort((a, b) => {
                if (!a.lastExecutedDate) return -1;
                if (!b.lastExecutedDate) return 1;
                return a.lastExecutedDate.getTime() - b.lastExecutedDate.getTime();
            });
        } else {
            list.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
        }

        return list;
    }, [events, filterCategory, search, sortBy]);

    // Stats
    const dangerCount = events.filter((e) => {
        if (!e.lastExecutedDate) return true;
        const hours = (Date.now() - e.lastExecutedDate.getTime()) / 3600000;
        return hours >= 168;
    }).length;

    const categories = Object.entries(CATEGORY_CONFIG) as [EventCategory, typeof CATEGORY_CONFIG[EventCategory]][];

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-60 -left-60 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-60 -right-60 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/8">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Activity size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-base leading-none">LifeTracker</h1>
                            <p className="text-white/35 text-xs mt-0.5 leading-none">{user?.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {dangerCount > 0 && (
                            <span className="px-2.5 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-full text-xs font-semibold">
                                ⚠️ {dangerCount}件
                            </span>
                        )}
                        <button
                            onClick={logOut}
                            className="w-9 h-9 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-white/40 hover:text-white/70 transition-all"
                            title="ログアウト"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 pb-28">
                {/* Stats bar */}
                <div className="py-5 flex items-center gap-4">
                    <div className="flex-1 bg-white/4 border border-white/8 rounded-2xl px-4 py-3">
                        <p className="text-white/40 text-xs">総イベント数</p>
                        <p className="text-white font-bold text-xl">{events.length}</p>
                    </div>
                    <div className="flex-1 bg-white/4 border border-white/8 rounded-2xl px-4 py-3">
                        <p className="text-white/40 text-xs">要注意</p>
                        <p className={`font-bold text-xl ${dangerCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {dangerCount}
                        </p>
                    </div>
                    <div className="flex-1 bg-white/4 border border-white/8 rounded-2xl px-4 py-3">
                        <p className="text-white/40 text-xs">今日実行済</p>
                        <p className="text-emerald-400 font-bold text-xl">
                            {events.filter((e) => {
                                if (!e.lastExecutedDate) return false;
                                const today = new Date();
                                const d = e.lastExecutedDate;
                                return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
                            }).length}
                        </p>
                    </div>
                </div>

                {/* Search & filters */}
                <div className="space-y-3 mb-5">
                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="イベントを検索..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-all text-sm"
                        />
                    </div>

                    {/* Category filter */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        <button
                            onClick={() => setFilterCategory('all')}
                            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${filterCategory === 'all'
                                    ? 'bg-indigo-500/30 border-indigo-400/50 text-indigo-300'
                                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white/70'
                                }`}
                        >
                            すべて
                        </button>
                        {categories.map(([key, cfg]) => (
                            <button
                                key={key}
                                onClick={() => setFilterCategory(key)}
                                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${filterCategory === key
                                        ? 'bg-indigo-500/30 border-indigo-400/50 text-indigo-300'
                                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white/70'
                                    }`}
                            >
                                <span>{cfg.emoji}</span>
                                <span>{cfg.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2">
                        <span className="text-white/30 text-xs flex-shrink-0">並び替え:</span>
                        <button
                            onClick={() => setSortBy(sortBy === 'elapsed' ? 'name' : 'elapsed')}
                            className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition-colors"
                        >
                            {sortBy === 'elapsed' ? '経過時間順' : '名前順'}
                            <ChevronDown size={12} />
                        </button>
                    </div>
                </div>

                {/* Event list */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-4xl mb-4">📋</p>
                        <p className="text-white/40 text-base font-medium">
                            {events.length === 0 ? 'まだイベントがありません' : '一致するイベントがありません'}
                        </p>
                        {events.length === 0 && (
                            <p className="text-white/25 text-sm mt-1">右下の＋ボタンから追加しましょう</p>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filtered.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                onMark={markAsExecuted}
                                onDelete={deleteEvent}
                                onClick={setSelectedEvent}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* FAB */}
            <div className="fixed bottom-6 right-4 sm:right-6 z-40">
                <button
                    onClick={() => setShowAdd(true)}
                    id="add-event-fab"
                    className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 transition-all active:scale-95 hover:scale-105"
                >
                    <Plus size={26} className="text-white" />
                </button>
            </div>

            {/* Modals */}
            {showAdd && (
                <AddEventModal
                    onClose={() => setShowAdd(false)}
                    onAdd={createEvent}
                />
            )}
            {selectedEvent && (
                <EventDetailModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onMark={markAsExecuted}
                    onDelete={deleteEvent}
                    onUpdate={updateEvent}
                />
            )}
        </div>
    );
}
