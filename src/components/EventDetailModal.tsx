'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { LifeEvent, EventGroup, EVENT_GROUPS, tracksAnniversaries } from '@/types';
import type { EventInput } from '@/hooks/useEvents';
import { IconTile } from '@/lib/icons';
import { daysBetween, formatYMD, fromDateInputValue, spanParts, toDateInputValue, toYMD, upcomingOccasions } from '@/lib/time';
import { GroupPicker } from '@/components/AddEventModal';
import {
    IconPicker,
    Label,
    Sheet,
    SpanText,
    cardClass,
    inputClass,
    primaryButtonClass,
    secondaryButtonClass,
} from '@/components/ui';

interface EventDetailModalProps {
    event: LifeEvent;
    now: number;
    onClose: () => void;
    /** Moves the item's date to today (e.g. got a haircut again), with undo. */
    onUpdateToToday: (event: LifeEvent) => void;
    onDelete: (event: LifeEvent) => void;
    onUpdate: (id: string, data: Partial<EventInput>) => Promise<void>;
}

export default function EventDetailModal({ event, now, onClose, onUpdateToToday, onDelete, onUpdate }: EventDetailModalProps) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(event.name);
    const [notes, setNotes] = useState(event.notes);
    const [icon, setIcon] = useState(event.icon);
    const [group, setGroup] = useState<EventGroup>(event.group);
    const [date, setDate] = useState(() => toDateInputValue(event.lastExecutedDate ?? new Date()));
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [saving, setSaving] = useState(false);

    const groupLabel = EVENT_GROUPS.find((g) => g.key === (editing ? group : event.group))?.label;

    const header = (
        <div className="flex items-center gap-3">
            <IconTile name={editing ? icon : event.icon} size={44} />
            <div className="min-w-0">
                <p className="text-[12px] text-ink-3">{groupLabel}</p>
                <h2 className="text-[19px] font-bold text-ink truncate">{editing ? '編集' : event.name}</h2>
            </div>
        </div>
    );

    if (editing) {
        const handleSave = async () => {
            if (!name.trim() || !date) return;
            setSaving(true);
            try {
                await onUpdate(event.id, {
                    name: name.trim(),
                    notes: notes.trim(),
                    icon,
                    group,
                    lastExecutedDate: fromDateInputValue(date),
                });
                onClose();
            } finally {
                setSaving(false);
            }
        };

        return (
            <Sheet title={header} onClose={onClose}>
                <div className="space-y-6">
                    <div>
                        <Label>名前</Label>
                        <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <Label>日付</Label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <Label>分類</Label>
                        <GroupPicker value={group} onChange={setGroup} />
                    </div>
                    <div>
                        <Label>アイコン</Label>
                        <IconPicker value={icon} onChange={setIcon} />
                    </div>
                    <div>
                        <Label hint="任意">メモ</Label>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setEditing(false)} className={secondaryButtonClass}>
                            キャンセル
                        </button>
                        <button onClick={handleSave} disabled={saving || !name.trim() || !date} className={primaryButtonClass}>
                            {saving ? '保存中…' : '保存'}
                        </button>
                    </div>
                </div>
            </Sheet>
        );
    }

    const d = event.lastExecutedDate;
    const origin = d ? toYMD(d) : null;
    const today = toYMD(now);
    const days = origin ? daysBetween(origin, today) : null;
    const occasions = tracksAnniversaries(event.group) && d ? upcomingOccasions(d, now) : [];

    return (
        <Sheet title={header} onClose={onClose}>
            <div className="space-y-2.5">
                <div className={`${cardClass} px-5 py-5`}>
                    {origin && days !== null ? (
                        <>
                            <p className="text-[12px] text-ink-3">{days >= 0 ? 'この日から' : 'この日まで'}</p>
                            <p className="mt-2 leading-none">
                                {days > 0 ? (
                                    <SpanText
                                        parts={spanParts(origin, today)}
                                        numberClass="text-[38px] font-semibold tracking-tight"
                                        unitClass="text-[15px] text-ink-2 ml-0.5 mr-1.5"
                                    />
                                ) : (
                                    <span className="text-[30px] font-semibold text-ink">
                                        {days === 0 ? '今日' : `あと${-days}日`}
                                    </span>
                                )}
                            </p>
                            {days >= 30 && <p className="text-[14px] text-ink-2 mt-3 tabular-nums">{days.toLocaleString('ja-JP')}日</p>}
                            <p className="text-[13px] text-ink-3 mt-1">{format(d!, 'yyyy年M月d日(E)', { locale: ja })}</p>
                        </>
                    ) : (
                        <p className="text-[18px] text-ink-3">日付が設定されていません</p>
                    )}
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

                {event.notes && (
                    <div className={`${cardClass} px-4 py-3.5`}>
                        <p className="text-[12px] text-ink-3">メモ</p>
                        <p className="mt-1 text-[14px] text-ink leading-relaxed whitespace-pre-wrap">{event.notes}</p>
                    </div>
                )}
            </div>

            <div className="mt-6 space-y-2">
                {!tracksAnniversaries(event.group) && (
                    <button
                        onClick={() => {
                            onUpdateToToday(event);
                            onClose();
                        }}
                        className={`${primaryButtonClass} w-full`}
                    >
                        日付を今日に更新
                    </button>
                )}
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setEditing(true)} className={secondaryButtonClass}>
                        編集
                    </button>
                    <button
                        onClick={() => {
                            if (confirmDelete) {
                                onDelete(event);
                                onClose();
                            } else setConfirmDelete(true);
                        }}
                        className={`${secondaryButtonClass} ${confirmDelete ? '!bg-alert-soft !text-alert !border-alert/30' : ''}`}
                    >
                        {confirmDelete ? '本当に削除' : '削除'}
                    </button>
                </div>
            </div>
        </Sheet>
    );
}
