'use client';

import { useState } from 'react';
import { EventGroup, EVENT_GROUPS } from '@/types';
import type { EventInput } from '@/hooks/useEvents';
import { fromDateInputValue, toDateInputValue } from '@/lib/time';
import { IconPicker, Label, Sheet, SheetTitle, inputClass, primaryButtonClass } from '@/components/ui';

interface AddEventModalProps {
    initial?: { name: string; group: EventGroup; icon: string };
    onClose: () => void;
    onAdd: (data: EventInput) => Promise<void>;
}

export function GroupPicker({ value, onChange }: { value: EventGroup; onChange: (g: EventGroup) => void }) {
    const hint = EVENT_GROUPS.find((g) => g.key === value)?.hint;
    return (
        <div>
            <div className="flex flex-wrap gap-1.5">
                {EVENT_GROUPS.map((g) => (
                    <button
                        key={g.key}
                        type="button"
                        onClick={() => onChange(g.key)}
                        aria-pressed={value === g.key}
                        className={`px-3.5 py-2 rounded-full text-[13px] border ${
                            value === g.key ? 'bg-ink text-canvas border-ink' : 'bg-surface border-line text-ink-2 hover:text-ink'
                        }`}
                    >
                        {g.label}
                    </button>
                ))}
            </div>
            {hint && <p className="text-[12px] text-ink-3 mt-2 px-1">{hint}</p>}
        </div>
    );
}

export default function AddEventModal({ initial, onClose, onAdd }: AddEventModalProps) {
    const [group, setGroup] = useState<EventGroup>(initial?.group ?? 'milestone');
    const [name, setName] = useState(initial?.name ?? '');
    const [icon, setIcon] = useState(initial?.icon ?? EVENT_GROUPS.find((g) => g.key === (initial?.group ?? 'milestone'))!.icon);
    const [iconTouched, setIconTouched] = useState(!!initial?.icon);
    const [date, setDate] = useState(() => toDateInputValue(new Date()));
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const canSubmit = name.trim() && date;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setLoading(true);
        try {
            await onAdd({ name: name.trim(), group, icon, notes: notes.trim(), lastExecutedDate: fromDateInputValue(date) });
            onClose();
        } catch {
            setError('保存できませんでした。もう一度お試しください');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet title={<SheetTitle title="追加" />} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label>名前</Label>
                    <input
                        type="text"
                        value={name}
                        autoFocus
                        onChange={(e) => {
                            setName(e.target.value);
                            setError('');
                        }}
                        placeholder="例：プロポーズ、iPhone 購入"
                        className={inputClass}
                    />
                </div>

                <div>
                    <Label>日付</Label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
                </div>

                <div>
                    <Label>分類</Label>
                    <GroupPicker
                        value={group}
                        onChange={(g) => {
                            setGroup(g);
                            if (!iconTouched) setIcon(EVENT_GROUPS.find((x) => x.key === g)!.icon);
                        }}
                    />
                </div>

                <div>
                    <Label>アイコン</Label>
                    <IconPicker
                        value={icon}
                        onChange={(i) => {
                            setIcon(i);
                            setIconTouched(true);
                        }}
                    />
                </div>

                <div>
                    <Label hint="任意">メモ</Label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        placeholder="場所、型番、契約内容など"
                        className={`${inputClass} resize-none`}
                    />
                </div>

                {error && <p className="text-alert text-[13px] px-1">{error}</p>}

                <button type="submit" disabled={loading || !canSubmit} className={`${primaryButtonClass} w-full`}>
                    {loading ? '保存中…' : '追加する'}
                </button>
            </form>
        </Sheet>
    );
}
