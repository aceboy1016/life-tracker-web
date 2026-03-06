'use client';

import { useState } from 'react';
import { LifeEvent, CATEGORY_CONFIG, EventCategory } from '@/types';
import { X, CheckCircle, Trash2, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { formatDistanceToNow } from 'date-fns';

interface EventDetailModalProps {
    event: LifeEvent;
    onClose: () => void;
    onMark: (id: string) => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, data: { name?: string; category?: EventCategory; notes?: string; lastExecutedDate?: Date | null }) => Promise<void>;
}

export default function EventDetailModal({ event, onClose, onMark, onDelete, onUpdate }: EventDetailModalProps) {
    const cat = CATEGORY_CONFIG[event.category] ?? CATEGORY_CONFIG['general'];
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(event.name);
    const [notes, setNotes] = useState(event.notes);
    const [category, setCategory] = useState<EventCategory>(event.category);
    const [loading, setLoading] = useState(false);

    const elapsed = event.lastExecutedDate
        ? formatDistanceToNow(event.lastExecutedDate, { addSuffix: true, locale: ja })
        : '未実行';

    const handleSave = async () => {
        setLoading(true);
        try {
            await onUpdate(event.id, { name, notes, category });
            setEditing(false);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        onDelete(event.id);
        onClose();
    };

    const handleMark = () => {
        onMark(event.id);
        onClose();
    };

    const CATEGORIES = Object.entries(CATEGORY_CONFIG) as [EventCategory, typeof CATEGORY_CONFIG[EventCategory]][];

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full sm:max-w-lg bg-gray-900 border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.emoji}</span>
                        <div>
                            <p className="text-xs text-white/40 uppercase tracking-widest">{cat.label}</p>
                            {editing ? (
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="text-white font-bold text-lg bg-white/5 border border-white/20 rounded-lg px-2 py-0.5 focus:outline-none focus:border-indigo-400"
                                />
                            ) : (
                                <h2 className="text-white font-bold text-lg">{event.name}</h2>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-all">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Last executed */}
                    <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                            <Clock size={12} />
                            <span>最終実行</span>
                        </div>
                        <p className="text-white font-semibold">{elapsed}</p>
                        {event.lastExecutedDate && (
                            <p className="text-white/40 text-xs mt-0.5">
                                {format(event.lastExecutedDate, 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                            </p>
                        )}
                    </div>

                    {/* Category (editing) */}
                    {editing && (
                        <div>
                            <p className="text-sm font-medium text-white/60 mb-2">カテゴリ</p>
                            <div className="grid grid-cols-3 gap-2">
                                {CATEGORIES.map(([key, cfg]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setCategory(key)}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${category === key
                                            ? 'bg-indigo-500/30 border-indigo-400/60 text-white'
                                            : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'
                                            }`}
                                    >
                                        <span>{cfg.emoji}</span>
                                        <span className="truncate">{cfg.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {(event.notes || editing) && (
                        <div>
                            <div className="flex items-center gap-2 text-white/50 text-xs mb-2">
                                <FileText size={12} />
                                <span>メモ</span>
                            </div>
                            {editing ? (
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-400/60 resize-none text-sm"
                                />
                            ) : (
                                <p className="text-white/70 text-sm leading-relaxed">{event.notes}</p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        {editing ? (
                            <>
                                <button onClick={() => setEditing(false)} className="flex-1 py-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/15 font-medium transition-all">
                                    キャンセル
                                </button>
                                <button onClick={handleSave} disabled={loading} className="flex-1 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-all disabled:opacity-50">
                                    {loading ? '保存中...' : '保存'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleMark}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 font-semibold transition-all"
                                >
                                    <CheckCircle size={16} />
                                    今やった！
                                </button>
                                <button
                                    onClick={() => setEditing(true)}
                                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-medium transition-all"
                                >
                                    編集
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-12 flex items-center justify-center rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
