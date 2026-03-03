'use client';

import { useState } from 'react';
import { EventCategory, CATEGORY_CONFIG } from '@/types';
import { X } from 'lucide-react';

interface AddEventModalProps {
    onClose: () => void;
    onAdd: (data: {
        name: string;
        category: EventCategory;
        notes: string;
        lastExecutedDate: Date | null;
    }) => Promise<void>;
}

const CATEGORIES = Object.entries(CATEGORY_CONFIG) as [EventCategory, typeof CATEGORY_CONFIG[EventCategory]][];

export default function AddEventModal({ onClose, onAdd }: AddEventModalProps) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState<EventCategory>('general');
    const [notes, setNotes] = useState('');
    const [dateStr, setDateStr] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError('名前を入力してください'); return; }
        setLoading(true);
        try {
            await onAdd({
                name: name.trim(),
                category,
                notes: notes.trim(),
                lastExecutedDate: dateStr ? new Date(dateStr) : null,
            });
            onClose();
        } catch {
            setError('保存に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Modal */}
            <div className="relative w-full sm:max-w-lg bg-gray-900 border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8">
                    <h2 className="text-xl font-bold text-white">新規イベント追加</h2>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-1.5">
                            イベント名 <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="例：ジム、読書、薬を飲む..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-400/60 focus:bg-white/8 transition-all"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">
                            カテゴリ
                        </label>
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

                    {/* Last executed date */}
                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-1.5">
                            最終実行日時（任意）
                        </label>
                        <input
                            type="datetime-local"
                            value={dateStr}
                            onChange={(e) => setDateStr(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 focus:outline-none focus:border-indigo-400/60 transition-all [color-scheme:dark]"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-1.5">
                            メモ（任意）
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            placeholder="補足情報などを入力..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-400/60 focus:bg-white/8 transition-all resize-none"
                        />
                    </div>

                    {error && (
                        <p className="text-rose-400 text-sm">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all active:scale-98 shadow-lg shadow-indigo-500/25"
                    >
                        {loading ? '保存中...' : '追加する'}
                    </button>
                </form>
            </div>
        </div>
    );
}
