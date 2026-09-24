'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Check, CalendarClock, Pencil, Trash2 } from 'lucide-react';
import { LifeEvent, EventCategory, getCategory } from '@/types';
import { formatElapsed, getUrgency, toLocalInputValue, URGENCY_META } from '@/lib/time';
import {
    CategoryPicker,
    Eyebrow,
    Label,
    Sheet,
    cardClass,
    inputClass,
    primaryButtonClass,
    secondaryButtonClass,
} from '@/components/ui';

interface EventDetailModalProps {
    event: LifeEvent;
    now: number;
    onClose: () => void;
    onMark: (event: LifeEvent, date?: Date) => void;
    onDelete: (event: LifeEvent) => void;
    onUpdate: (
        id: string,
        data: { name?: string; category?: EventCategory; notes?: string; lastExecutedDate?: Date | null }
    ) => Promise<void>;
}

type Mode = 'view' | 'edit' | 'pickDate';

export default function EventDetailModal({ event, now, onClose, onMark, onDelete, onUpdate }: EventDetailModalProps) {
    const [mode, setMode] = useState<Mode>('view');
    const [name, setName] = useState(event.name);
    const [notes, setNotes] = useState(event.notes);
    const [category, setCategory] = useState<EventCategory>(event.category);
    const [dateStr, setDateStr] = useState(() => toLocalInputValue(event.lastExecutedDate ?? new Date()));
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [saving, setSaving] = useState(false);

    const cat = getCategory(mode === 'edit' ? category : event.category);
    const urgency = getUrgency(event.lastExecutedDate, now);
    const meta = URGENCY_META[urgency];
    const { value, unit } = formatElapsed(event.lastExecutedDate, now);

    const handleSave = async () => {
        if (!name.trim()) return;
        setSaving(true);
        try {
            await onUpdate(event.id, { name: name.trim(), notes: notes.trim(), category });
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const handleRecordDate = () => {
        if (!dateStr) return;
        onMark(event, new Date(dateStr));
        onClose();
    };

    const title = (
        <div className="min-w-0">
            <Eyebrow>{cat.en}</Eyebrow>
            <h2 className="mt-1 text-[24px] font-black tracking-tight text-ink leading-tight">
                <span className="mr-2">{cat.emoji}</span>
                {mode === 'edit' ? '編集' : event.name}
            </h2>
        </div>
    );

    if (mode === 'edit') {
        return (
            <Sheet title={title} onClose={onClose}>
                <div className="space-y-6">
                    <div>
                        <Label>名前</Label>
                        <input value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} text-base`} />
                    </div>
                    <div>
                        <Label>カテゴリ</Label>
                        <CategoryPicker value={category} onChange={setCategory} />
                    </div>
                    <div>
                        <Label hint="任意">メモ</Label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className={`${inputClass} resize-none`}
                        />
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

    return (
        <Sheet title={title} onClose={onClose}>
            <div className="space-y-2.5">
                <div className={`${cardClass} ${meta.bar} px-4 py-4`}>
                    <Eyebrow>Last Done</Eyebrow>
                    {event.lastExecutedDate ? (
                        <>
                            <p className={`mt-1.5 font-black tabular-nums tracking-tight leading-none ${meta.text}`}>
                                <span className={unit ? 'text-5xl' : 'text-3xl'}>{value}</span>
                                {unit && <span className="text-xl ml-1">{unit}前</span>}
                            </p>
                            <p className="text-[14px] font-medium text-ink-2 mt-2.5">
                                {format(event.lastExecutedDate, 'yyyy年M月d日(E) HH:mm', { locale: ja })}
                            </p>
                        </>
                    ) : (
                        <p className="mt-1.5 text-2xl font-black text-ink-3">未記録</p>
                    )}
                </div>

                {event.notes && (
                    <div className={`${cardClass} border-l-ink-3 px-4 py-4`}>
                        <Eyebrow>Note</Eyebrow>
                        <p className="mt-1.5 text-ink text-[15px] font-medium leading-relaxed whitespace-pre-wrap">{event.notes}</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-2">
                {mode === 'pickDate' ? (
                    <div className={`${cardClass} border-l-ink p-3 space-y-2`}>
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
                            <button onClick={handleRecordDate} className={primaryButtonClass}>
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
                        className={`${primaryButtonClass} w-full text-base`}
                    >
                        <Check size={20} strokeWidth={3} />
                        今やった
                    </button>
                )}

                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setMode('pickDate')} className={`${secondaryButtonClass} flex-col gap-1 text-xs`}>
                        <CalendarClock size={18} strokeWidth={2.5} />
                        日時を指定
                    </button>
                    <button onClick={() => setMode('edit')} className={`${secondaryButtonClass} flex-col gap-1 text-xs`}>
                        <Pencil size={18} strokeWidth={2.5} />
                        編集
                    </button>
                    <button
                        onClick={() => {
                            if (confirmDelete) {
                                onDelete(event);
                                onClose();
                            } else {
                                setConfirmDelete(true);
                            }
                        }}
                        className={`${secondaryButtonClass} flex-col gap-1 text-xs ${
                            confirmDelete ? '!bg-over !text-white !border-over' : 'hover:!text-over'
                        }`}
                    >
                        <Trash2 size={18} strokeWidth={2.5} />
                        {confirmDelete ? '本当に削除' : '削除'}
                    </button>
                </div>
            </div>
        </Sheet>
    );
}
