'use client';

import { useState } from 'react';
import { EventCategory } from '@/types';
import { toLocalInputValue } from '@/lib/time';
import { CategoryPicker, Label, Sheet, inputClass, primaryButtonClass } from '@/components/ui';

interface AddEventModalProps {
    initialName?: string;
    onClose: () => void;
    onAdd: (data: {
        name: string;
        category: EventCategory;
        notes: string;
        lastExecutedDate: Date | null;
    }) => Promise<void>;
}

type LastDone = 'never' | 'now' | 'yesterday' | 'custom';

const LAST_DONE_OPTIONS: { key: LastDone; label: string }[] = [
    { key: 'never', label: 'まだ' },
    { key: 'now', label: '今日' },
    { key: 'yesterday', label: '昨日' },
    { key: 'custom', label: '日付を指定' },
];

export default function AddEventModal({ initialName = '', onClose, onAdd }: AddEventModalProps) {
    const [name, setName] = useState(initialName);
    const [category, setCategory] = useState<EventCategory>('general');
    const [notes, setNotes] = useState('');
    const [lastDone, setLastDone] = useState<LastDone>('never');
    const [dateStr, setDateStr] = useState(() => toLocalInputValue(new Date()));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const resolveDate = (): Date | null => {
        if (lastDone === 'now') return new Date();
        if (lastDone === 'yesterday') return new Date(Date.now() - 24 * 3600_000);
        if (lastDone === 'custom' && dateStr) return new Date(dateStr);
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('名前を入力してください');
            return;
        }
        setLoading(true);
        try {
            await onAdd({
                name: name.trim(),
                category,
                notes: notes.trim(),
                lastExecutedDate: resolveDate(),
            });
            onClose();
        } catch {
            setError('保存に失敗しました。もう一度お試しください');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet title={<h2 className="text-xl font-bold text-ink">新しく記録する</h2>} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label>なにを記録する？</Label>
                    <input
                        type="text"
                        value={name}
                        autoFocus
                        onChange={(e) => {
                            setName(e.target.value);
                            setError('');
                        }}
                        placeholder="ジム、散髪、実家に電話…"
                        className={`${inputClass} text-base`}
                    />
                </div>

                <div>
                    <Label>カテゴリ</Label>
                    <CategoryPicker value={category} onChange={setCategory} />
                </div>

                <div>
                    <Label>最後にやったのは？</Label>
                    <div className="grid grid-cols-4 gap-1 p-1 bg-surface-2 rounded-xl">
                        {LAST_DONE_OPTIONS.map((opt) => (
                            <button
                                key={opt.key}
                                type="button"
                                onClick={() => setLastDone(opt.key)}
                                aria-pressed={lastDone === opt.key}
                                className={`py-2 rounded-lg text-[13px] font-medium transition-all ${
                                    lastDone === opt.key ? 'bg-surface text-ink shadow-sm' : 'text-ink-2 hover:text-ink'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    {lastDone === 'custom' && (
                        <input
                            type="datetime-local"
                            value={dateStr}
                            max={toLocalInputValue(new Date())}
                            onChange={(e) => setDateStr(e.target.value)}
                            className={`${inputClass} mt-2`}
                        />
                    )}
                </div>

                <div>
                    <Label hint="任意">メモ</Label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        placeholder="お店の名前、次回の目安など"
                        className={`${inputClass} resize-none`}
                    />
                </div>

                {error && <p className="text-over text-sm font-medium">{error}</p>}

                <button type="submit" disabled={loading || !name.trim()} className={`${primaryButtonClass} w-full`}>
                    {loading ? '保存中…' : '追加する'}
                </button>
            </form>
        </Sheet>
    );
}
