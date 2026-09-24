'use client';

import { useState } from 'react';
import { EventKind } from '@/types';
import type { EventInput } from '@/hooks/useEvents';
import { fromDateInputValue, toDateInputValue, toLocalInputValue } from '@/lib/time';
import { IconPicker, Label, Segmented, Sheet, SheetTitle, inputClass, primaryButtonClass } from '@/components/ui';

interface AddEventModalProps {
    initial?: { name: string; kind: EventKind; icon: string };
    onClose: () => void;
    onAdd: (data: EventInput) => Promise<void>;
}

type LastDone = 'never' | 'now' | 'yesterday' | 'custom';

const LAST_DONE_OPTIONS: [LastDone, string][] = [
    ['never', 'まだ'],
    ['now', '今日'],
    ['yesterday', '昨日'],
    ['custom', '日付指定'],
];

export default function AddEventModal({ initial, onClose, onAdd }: AddEventModalProps) {
    const [kind, setKind] = useState<EventKind>(initial?.kind ?? 'milestone');
    const [name, setName] = useState(initial?.name ?? '');
    const [icon, setIcon] = useState(initial?.icon ?? 'star');
    const [notes, setNotes] = useState('');
    const [milestoneDate, setMilestoneDate] = useState(() => toDateInputValue(new Date()));
    const [lastDone, setLastDone] = useState<LastDone>('never');
    const [dateStr, setDateStr] = useState(() => toLocalInputValue(new Date()));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const resolveDate = (): Date | null => {
        if (kind === 'milestone') return milestoneDate ? fromDateInputValue(milestoneDate) : null;
        if (lastDone === 'now') return new Date();
        if (lastDone === 'yesterday') return new Date(Date.now() - 24 * 3600_000);
        if (lastDone === 'custom' && dateStr) return new Date(dateStr);
        return null;
    };

    const canSubmit = name.trim() && (kind === 'routine' || milestoneDate);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setLoading(true);
        try {
            await onAdd({ name: name.trim(), kind, icon, notes: notes.trim(), lastExecutedDate: resolveDate() });
            onClose();
        } catch {
            setError('保存できませんでした。もう一度お試しください');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet title={<SheetTitle title="新しく追加" />} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Segmented
                        value={kind}
                        onChange={setKind}
                        options={[
                            ['milestone', '記念日・できごと'],
                            ['routine', 'くり返すこと'],
                        ]}
                    />
                    <p className="text-[12px] text-ink-3 mt-2 px-1">
                        {kind === 'milestone'
                            ? 'プロポーズ、結婚式、引っ越しなど。その日からの日数と記念日がわかります。'
                            : '散髪、歯医者など。前回からの日数がわかり、やったらチェックします。'}
                    </p>
                </div>

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
                        placeholder={kind === 'milestone' ? '例：プロポーズした日' : '例：髪を切る'}
                        className={inputClass}
                    />
                </div>

                {kind === 'milestone' ? (
                    <div>
                        <Label>日付</Label>
                        <input
                            type="date"
                            value={milestoneDate}
                            onChange={(e) => setMilestoneDate(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                ) : (
                    <div>
                        <Label>最後にやった日</Label>
                        <Segmented value={lastDone} onChange={setLastDone} options={LAST_DONE_OPTIONS} />
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
                )}

                <div>
                    <Label>アイコン</Label>
                    <IconPicker value={icon} onChange={setIcon} />
                </div>

                <div>
                    <Label hint="任意">メモ</Label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        placeholder="場所、一緒にいた人など"
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
