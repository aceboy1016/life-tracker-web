'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Birthday, BirthdayInput, BIRTHDAY_RELATIONS, Gift, REMIND_OPTIONS } from '@/types';
import { Avatar } from '@/lib/icons';
import { formatYMD, nextBirthday } from '@/lib/time';
import {
    Label,
    Segmented,
    Sheet,
    SheetTitle,
    cardClass,
    inputClass,
    primaryButtonClass,
    secondaryButtonClass,
} from '@/components/ui';

interface BirthdaySheetProps {
    birthday?: Birthday;
    gifts: Gift[];
    now: number;
    onClose: () => void;
    onSave: (data: BirthdayInput) => Promise<void>;
    onDelete?: () => void;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function daysInMonth(month: number) {
    return new Date(2024, month, 0).getDate(); // leap year so Feb 29 is selectable
}

export default function BirthdaySheet({ birthday, gifts, now, onClose, onSave, onDelete }: BirthdaySheetProps) {
    const [editing, setEditing] = useState(!birthday);
    const [name, setName] = useState(birthday?.name ?? '');
    const [month, setMonth] = useState(birthday?.month ?? new Date(now).getMonth() + 1);
    const [day, setDay] = useState(birthday?.day ?? new Date(now).getDate());
    const [year, setYear] = useState(birthday?.year ? String(birthday.year) : '');
    const [relation, setRelation] = useState(birthday?.relation ?? '');
    const [remind, setRemind] = useState(String(birthday?.remindDaysBefore ?? 7));
    const [notes, setNotes] = useState(birthday?.notes ?? '');
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [error, setError] = useState('');

    if (birthday && !editing) {
        const next = nextBirthday(birthday, now);
        const theirGifts = gifts.filter((g) => g.from === birthday.name);
        return (
            <Sheet
                title={
                    <div className="flex items-center gap-3">
                        <Avatar name={birthday.name} size={44} />
                        <div className="min-w-0">
                            <p className="text-[12px] text-ink-3">{birthday.relation || '誕生日'}</p>
                            <h2 className="text-[19px] font-bold text-ink truncate">{birthday.name}</h2>
                        </div>
                    </div>
                }
                onClose={onClose}
            >
                <div className="space-y-2.5">
                    <div className={`${cardClass} px-5 py-5`}>
                        <p className="text-[12px] text-ink-3">{next.inDays === 0 ? '今日が誕生日' : '次の誕生日まで'}</p>
                        {next.inDays > 0 && (
                            <p className="mt-1 text-ink leading-none tabular-nums">
                                <span className="text-[44px] font-semibold tracking-tight">{next.inDays}</span>
                                <span className="text-[16px] text-ink-2 ml-1">日</span>
                            </p>
                        )}
                        <p className="text-[14px] text-ink-2 mt-2">
                            {formatYMD(next.date)}
                            {next.age !== null && ` · ${next.age}歳になります`}
                        </p>
                        {birthday.year && (
                            <p className="text-[13px] text-ink-3 mt-2">{birthday.year}年生まれ</p>
                        )}
                    </div>

                    <div className={`${cardClass} px-4 py-3.5 flex items-center justify-between`}>
                        <p className="text-[14px] text-ink">通知</p>
                        <p className="text-[13px] text-ink-2">
                            当日{birthday.remindDaysBefore > 0 && ` と ${REMIND_OPTIONS.find(([v]) => Number(v) === birthday.remindDaysBefore)?.[1]}`}
                        </p>
                    </div>

                    {theirGifts.length > 0 && (
                        <div className={`${cardClass} divide-y divide-line`}>
                            <p className="px-4 pt-3 pb-2 text-[12px] text-ink-3">この人からのいただきもの</p>
                            {theirGifts.map((g) => (
                                <div key={g.id} className="px-4 py-3 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-[14px] text-ink truncate">
                                            {g.occasion}
                                            {g.item && ` · ${g.item}`}
                                        </p>
                                        <p className="text-[12px] text-ink-3 mt-0.5">
                                            {format(g.date, 'yyyy.M.d')} · {g.returned ? 'お返し済み' : 'お返し前'}
                                        </p>
                                    </div>
                                    {g.amount != null && (
                                        <p className="text-[13px] text-ink-2 tabular-nums shrink-0">¥{g.amount.toLocaleString('ja-JP')}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {birthday.notes && (
                        <div className={`${cardClass} px-4 py-3.5`}>
                            <p className="text-[12px] text-ink-3">メモ</p>
                            <p className="mt-1 text-[14px] text-ink leading-relaxed whitespace-pre-wrap">{birthday.notes}</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-6">
                    <button onClick={() => setEditing(true)} className={secondaryButtonClass}>
                        編集
                    </button>
                    <button
                        onClick={() => {
                            if (confirmDelete) {
                                onDelete?.();
                                onClose();
                            } else setConfirmDelete(true);
                        }}
                        className={`${secondaryButtonClass} ${confirmDelete ? '!bg-alert-soft !text-alert !border-alert/30' : ''}`}
                    >
                        {confirmDelete ? '本当に削除' : '削除'}
                    </button>
                </div>
            </Sheet>
        );
    }

    const maxDay = daysInMonth(month);
    const canSave = name.trim() && day <= maxDay;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSave) return;
        const parsedYear = year.trim() ? Number(year) : null;
        if (parsedYear !== null && (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > new Date(now).getFullYear())) {
            setError('生まれ年は西暦4桁で入力してください');
            return;
        }
        setSaving(true);
        try {
            await onSave({
                name: name.trim(),
                month,
                day,
                year: parsedYear,
                relation,
                remindDaysBefore: Number(remind),
                notes: notes.trim(),
            });
            onClose();
        } catch {
            setError('保存できませんでした。もう一度お試しください');
        } finally {
            setSaving(false);
        }
    };

    const selectClass = `${inputClass} appearance-none text-center`;

    return (
        <Sheet title={<SheetTitle title={birthday ? '誕生日を編集' : '誕生日を追加'} />} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label>名前</Label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus={!birthday}
                        placeholder="例：田中 太郎"
                        className={inputClass}
                    />
                </div>

                <div>
                    <Label>誕生日</Label>
                    <div className="grid grid-cols-[1fr_1fr_1.3fr] gap-2">
                        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className={selectClass} aria-label="月">
                            {MONTHS.map((m) => (
                                <option key={m} value={m}>
                                    {m}月
                                </option>
                            ))}
                        </select>
                        <select
                            value={Math.min(day, maxDay)}
                            onChange={(e) => setDay(Number(e.target.value))}
                            className={selectClass}
                            aria-label="日"
                        >
                            {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
                                <option key={d} value={d}>
                                    {d}日
                                </option>
                            ))}
                        </select>
                        <input
                            value={year}
                            onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            inputMode="numeric"
                            placeholder="生まれ年"
                            aria-label="生まれ年（任意）"
                            className={`${inputClass} text-center tabular-nums`}
                        />
                    </div>
                    <p className="text-[12px] text-ink-3 mt-2 px-1">生まれ年を入れると、何歳になるかも表示されます</p>
                </div>

                <div>
                    <Label hint="任意">関係</Label>
                    <div className="flex flex-wrap gap-1.5">
                        {BIRTHDAY_RELATIONS.map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setRelation(relation === r ? '' : r)}
                                aria-pressed={relation === r}
                                className={`px-3.5 py-2 rounded-full text-[13px] border ${
                                    relation === r ? 'bg-ink text-canvas border-ink' : 'bg-surface border-line text-ink-2 hover:text-ink'
                                }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <Label>通知</Label>
                    <Segmented value={remind} onChange={setRemind} options={REMIND_OPTIONS} />
                    <p className="text-[12px] text-ink-3 mt-2 px-1">
                        {remind === '0' ? '誕生日の朝にお知らせします' : '選んだ日と、誕生日の朝にお知らせします'}
                    </p>
                </div>

                <div>
                    <Label hint="任意">メモ</Label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        placeholder="好きなもの、去年あげたものなど"
                        className={`${inputClass} resize-none`}
                    />
                </div>

                {error && <p className="text-alert text-[13px] px-1">{error}</p>}

                <div className={birthday ? 'grid grid-cols-2 gap-2' : ''}>
                    {birthday && (
                        <button type="button" onClick={() => setEditing(false)} className={secondaryButtonClass}>
                            キャンセル
                        </button>
                    )}
                    <button type="submit" disabled={saving || !canSave} className={`${primaryButtonClass} w-full`}>
                        {saving ? '保存中…' : '保存'}
                    </button>
                </div>
            </form>
        </Sheet>
    );
}
