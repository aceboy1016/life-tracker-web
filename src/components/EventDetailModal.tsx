'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Check } from 'lucide-react';
import { LifeEvent, EventKind } from '@/types';
import type { EventInput } from '@/hooks/useEvents';
import { IconTile } from '@/lib/icons';
import {
    daysBetween,
    elapsedParts,
    formatSpan,
    formatYMD,
    fromDateInputValue,
    toDateInputValue,
    toLocalInputValue,
    toYMD,
    upcomingOccasions,
} from '@/lib/time';
import {
    IconPicker,
    Label,
    Segmented,
    Sheet,
    cardClass,
    inputClass,
    primaryButtonClass,
    secondaryButtonClass,
    SpanText,
} from '@/components/ui';

interface EventDetailModalProps {
    event: LifeEvent;
    now: number;
    onClose: () => void;
    onMark: (event: LifeEvent, date?: Date) => void;
    onDelete: (event: LifeEvent) => void;
    onUpdate: (id: string, data: Partial<EventInput>) => Promise<void>;
}

type Mode = 'view' | 'edit' | 'pickDate';

export default function EventDetailModal({ event, now, onClose, onMark, onDelete, onUpdate }: EventDetailModalProps) {
    const [mode, setMode] = useState<Mode>('view');
    const [name, setName] = useState(event.name);
    const [notes, setNotes] = useState(event.notes);
    const [icon, setIcon] = useState(event.icon);
    const [kind, setKind] = useState<EventKind>(event.kind);
    const [milestoneDate, setMilestoneDate] = useState(() => toDateInputValue(event.lastExecutedDate ?? new Date()));
    const [dateStr, setDateStr] = useState(() => toLocalInputValue(event.lastExecutedDate ?? new Date()));
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [saving, setSaving] = useState(false);

    const header = (
        <div className="flex items-center gap-3">
            <IconTile name={mode === 'edit' ? icon : event.icon} size={44} />
            <div className="min-w-0">
                <p className="text-[12px] text-ink-3">{event.kind === 'milestone' ? '記念日・できごと' : 'くり返すこと'}</p>
                <h2 className="text-[19px] font-bold text-ink truncate">{mode === 'edit' ? '編集' : event.name}</h2>
            </div>
        </div>
    );

    if (mode === 'edit') {
        const handleSave = async () => {
            if (!name.trim()) return;
            setSaving(true);
            try {
                await onUpdate(event.id, {
                    name: name.trim(),
                    notes: notes.trim(),
                    icon,
                    kind,
                    ...(kind === 'milestone' && milestoneDate ? { lastExecutedDate: fromDateInputValue(milestoneDate) } : {}),
                });
                onClose();
            } finally {
                setSaving(false);
            }
        };

        return (
            <Sheet title={header} onClose={onClose}>
                <div className="space-y-6">
                    <Segmented
                        value={kind}
                        onChange={setKind}
                        options={[
                            ['milestone', '記念日・できごと'],
                            ['routine', 'くり返すこと'],
                        ]}
                    />
                    <div>
                        <Label>名前</Label>
                        <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                    </div>
                    {kind === 'milestone' && (
                        <div>
                            <Label>日付</Label>
                            <input type="date" value={milestoneDate} onChange={(e) => setMilestoneDate(e.target.value)} className={inputClass} />
                        </div>
                    )}
                    <div>
                        <Label>アイコン</Label>
                        <IconPicker value={icon} onChange={setIcon} />
                    </div>
                    <div>
                        <Label hint="任意">メモ</Label>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setMode('view')} className={secondaryButtonClass}>
                            キャンセル
                        </button>
                        <button onClick={handleSave} disabled={saving || !name.trim()} className={primaryButtonClass}>
                            {saving ? '保存中…' : '保存'}
                        </button>
                    </div>
                </div>
            </Sheet>
        );
    }

    const deleteButton = (
        <button
            onClick={() => {
                if (confirmDelete) {
                    onDelete(event);
                    onClose();
                } else {
                    setConfirmDelete(true);
                }
            }}
            className={`${secondaryButtonClass} ${confirmDelete ? '!bg-alert-soft !text-alert !border-alert/30' : ''}`}
        >
            {confirmDelete ? '本当に削除' : '削除'}
        </button>
    );

    return (
        <Sheet title={header} onClose={onClose}>
            {event.kind === 'milestone' ? (
                <MilestoneSummary event={event} now={now} />
            ) : (
                <RoutineSummary event={event} now={now} />
            )}

            {event.notes && (
                <div className={`${cardClass} mt-2.5 px-4 py-3.5`}>
                    <p className="text-[12px] text-ink-3">メモ</p>
                    <p className="mt-1 text-[14px] text-ink leading-relaxed whitespace-pre-wrap">{event.notes}</p>
                </div>
            )}

            <div className="mt-6 space-y-2">
                {event.kind === 'routine' &&
                    (mode === 'pickDate' ? (
                        <div className={`${cardClass} p-3 space-y-2`}>
                            <Label>いつやった？</Label>
                            <input
                                type="datetime-local"
                                value={dateStr}
                                max={toLocalInputValue(new Date())}
                                onChange={(e) => setDateStr(e.target.value)}
                                className={inputClass}
                            />
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <button onClick={() => setMode('view')} className={secondaryButtonClass}>
                                    キャンセル
                                </button>
                                <button
                                    onClick={() => {
                                        if (!dateStr) return;
                                        onMark(event, new Date(dateStr));
                                        onClose();
                                    }}
                                    className={primaryButtonClass}
                                >
                                    この日時で記録
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                onMark(event);
                                onClose();
                            }}
                            className={`${primaryButtonClass} w-full`}
                        >
                            <Check size={18} strokeWidth={2} />
                            今やった
                        </button>
                    ))}

                <div className={`grid gap-2 ${event.kind === 'routine' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    {event.kind === 'routine' && (
                        <button onClick={() => setMode('pickDate')} className={secondaryButtonClass}>
                            日時を指定
                        </button>
                    )}
                    <button onClick={() => setMode('edit')} className={secondaryButtonClass}>
                        編集
                    </button>
                    {deleteButton}
                </div>

                {event.kind === 'routine' && event.lastExecutedDate && (
                    <button
                        onClick={async () => {
                            await onUpdate(event.id, { kind: 'milestone' });
                            onClose();
                        }}
                        className="w-full pt-3 text-[13px] text-ink-3 hover:text-ink"
                    >
                        一度きりの日なら「記念日・できごと」に変更
                    </button>
                )}
            </div>
        </Sheet>
    );
}

function MilestoneSummary({ event, now }: { event: LifeEvent; now: number }) {
    const date = event.lastExecutedDate;
    if (!date) return <p className="text-ink-3">日付が設定されていません</p>;
    const origin = toYMD(date);
    const today = toYMD(now);
    const days = daysBetween(origin, today);
    const occasions = upcomingOccasions(date, now);

    return (
        <div className="space-y-2.5">
            <div className={`${cardClass} px-5 py-5`}>
                <p className="text-[12px] text-ink-3">{days >= 0 ? 'この日から' : 'この日まで'}</p>
                <p className="mt-1 text-ink leading-none tabular-nums">
                    <span className="text-[44px] font-semibold tracking-tight">{Math.abs(days).toLocaleString('ja-JP')}</span>
                    <span className="text-[16px] text-ink-2 ml-1">日</span>
                </p>
                {days > 0 && <p className="text-[14px] text-ink-2 mt-2">{formatSpan(origin, today)}</p>}
                <p className="text-[13px] text-ink-3 mt-3">{format(date, 'yyyy年M月d日(E)', { locale: ja })}</p>
            </div>
            {occasions.length > 0 && (
                <div className={`${cardClass} divide-y divide-line`}>
                    {occasions.map((o) => (
                        <div key={o.kind} className="flex items-center justify-between px-4 py-3">
                            <div>
                                <p className="text-[14px] font-medium text-ink">{o.label}</p>
                                <p className="text-[12px] text-ink-3 mt-0.5">{formatYMD(o.date)}</p>
                            </div>
                            <p className="text-[13px] text-ink-2">{o.inDays === 0 ? '今日' : `あと ${o.inDays}日`}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function RoutineSummary({ event, now }: { event: LifeEvent; now: number }) {
    const parts = elapsedParts(event.lastExecutedDate, now);
    return (
        <div className={`${cardClass} px-5 py-5`}>
            <p className="text-[12px] text-ink-3">前回から</p>
            {event.lastExecutedDate && parts ? (
                <>
                    <p className="mt-2 leading-none">
                        {parts.length === 0 ? (
                            <span className="text-[28px] font-semibold text-ink">たった今</span>
                        ) : (
                            <SpanText
                                parts={parts}
                                numberClass={parts.length > 2 ? 'text-[34px] font-semibold tracking-tight' : 'text-[44px] font-semibold tracking-tight'}
                                unitClass="text-[15px] text-ink-2 ml-0.5 mr-1.5"
                            />
                        )}
                    </p>
                    <p className="text-[13px] text-ink-3 mt-3">{format(event.lastExecutedDate, 'yyyy年M月d日(E) HH:mm', { locale: ja })}</p>
                </>
            ) : (
                <p className="mt-1 text-[22px] font-medium text-ink-3">まだ記録がありません</p>
            )}
        </div>
    );
}
