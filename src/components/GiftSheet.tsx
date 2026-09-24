'use client';

import { useState } from 'react';
import { Gift, GiftInput, GIFT_OCCASIONS } from '@/types';
import { fromDateInputValue, toDateInputValue } from '@/lib/time';
import { Label, Sheet, SheetTitle, Switch, cardClass, inputClass, primaryButtonClass, secondaryButtonClass } from '@/components/ui';

interface GiftSheetProps {
    gift?: Gift;
    knownNames: string[];
    initialFrom?: string;
    onClose: () => void;
    onSave: (data: GiftInput) => Promise<void>;
    onDelete?: () => void;
}

export default function GiftSheet({ gift, knownNames, initialFrom = '', onClose, onSave, onDelete }: GiftSheetProps) {
    const [from, setFrom] = useState(gift?.from ?? initialFrom);
    const [occasion, setOccasion] = useState(gift?.occasion ?? '結婚');
    const [item, setItem] = useState(gift?.item ?? '');
    const [amount, setAmount] = useState(gift?.amount != null ? String(gift.amount) : '');
    const [date, setDate] = useState(toDateInputValue(gift?.date ?? new Date()));
    const [returned, setReturned] = useState(gift?.returned ?? false);
    const [returnNote, setReturnNote] = useState(gift?.returnNote ?? '');
    const [notes, setNotes] = useState(gift?.notes ?? '');
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [error, setError] = useState('');

    const canSave = from.trim() && date;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSave) return;
        const parsedAmount = amount.trim() ? Number(amount.replace(/[,，円\s]/g, '')) : null;
        if (parsedAmount !== null && Number.isNaN(parsedAmount)) {
            setError('金額は数字で入力してください');
            return;
        }
        setSaving(true);
        try {
            await onSave({
                from: from.trim(),
                occasion,
                item: item.trim(),
                amount: parsedAmount,
                date: fromDateInputValue(date),
                returned,
                returnNote: returnNote.trim(),
                notes: notes.trim(),
            });
            onClose();
        } catch {
            setError('保存できませんでした。もう一度お試しください');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Sheet
            title={<SheetTitle title={gift ? 'いただきものを編集' : 'いただきものを記録'} subtitle="誰に何をもらったか残しておく" />}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label>くれた人</Label>
                    <input
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        list="gift-known-names"
                        autoFocus={!gift && !initialFrom}
                        placeholder="例：田中 太郎"
                        className={inputClass}
                    />
                    <datalist id="gift-known-names">
                        {knownNames.map((n) => (
                            <option key={n} value={n} />
                        ))}
                    </datalist>
                </div>

                <div>
                    <Label>何のお祝い</Label>
                    <div className="flex flex-wrap gap-1.5">
                        {GIFT_OCCASIONS.map((o) => (
                            <button
                                key={o}
                                type="button"
                                onClick={() => setOccasion(o)}
                                aria-pressed={occasion === o}
                                className={`px-3.5 py-2 rounded-full text-[13px] border ${
                                    occasion === o ? 'bg-ink text-canvas border-ink' : 'bg-surface border-line text-ink-2 hover:text-ink'
                                }`}
                            >
                                {o}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-[1fr_8.5rem] gap-2">
                    <div>
                        <Label>いただいたもの</Label>
                        <input value={item} onChange={(e) => setItem(e.target.value)} placeholder="現金、食器など" className={inputClass} />
                    </div>
                    <div>
                        <Label hint="任意">金額</Label>
                        <input
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            inputMode="numeric"
                            placeholder="30000"
                            className={`${inputClass} tabular-nums`}
                        />
                    </div>
                </div>

                <div>
                    <Label>いただいた日</Label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
                </div>

                <div className={`${cardClass} px-4 py-3.5 space-y-3`}>
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <p className="text-[14px] font-medium text-ink">お返し済み</p>
                            <p className="text-[12px] text-ink-3 mt-0.5">内祝いやお祝い返しをしたらオン</p>
                        </div>
                        <Switch checked={returned} onChange={() => setReturned((v) => !v)} label="お返し済み" />
                    </div>
                    <input
                        value={returnNote}
                        onChange={(e) => setReturnNote(e.target.value)}
                        placeholder={returned ? '返したもの（例：カタログギフト）' : 'お返しの予定（例：結婚したら3万円）'}
                        className={`${inputClass} bg-surface-2/60`}
                    />
                </div>

                <div>
                    <Label hint="任意">メモ</Label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        placeholder="関係、連絡先、メッセージなど"
                        className={`${inputClass} resize-none`}
                    />
                </div>

                {error && <p className="text-alert text-[13px] px-1">{error}</p>}

                <div className={gift && onDelete ? 'grid grid-cols-[auto_1fr] gap-2' : ''}>
                    {gift && onDelete && (
                        <button
                            type="button"
                            onClick={() => {
                                if (confirmDelete) {
                                    onDelete();
                                    onClose();
                                } else setConfirmDelete(true);
                            }}
                            className={`${secondaryButtonClass} ${confirmDelete ? '!bg-alert-soft !text-alert !border-alert/30' : ''}`}
                        >
                            {confirmDelete ? '本当に削除' : '削除'}
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
