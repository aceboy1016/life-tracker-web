'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Check } from 'lucide-react';
import { LifeEvent } from '@/types';
import { IconTile } from '@/lib/icons';
import { daysBetween, formatElapsed, formatSpan, getUrgency, toYMD, upcomingOccasions } from '@/lib/time';
import { Pill } from '@/components/ui';

const rowClass = 'w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-surface-2/60 focus-visible:outline-none focus-visible:bg-surface-2';

export function MilestoneRow({ event, now, onOpen }: { event: LifeEvent; now: number; onOpen: (e: LifeEvent) => void }) {
    const date = event.lastExecutedDate;
    const today = toYMD(now);
    const origin = date ? toYMD(date) : null;
    const days = origin ? daysBetween(origin, today) : null;
    const next = date ? upcomingOccasions(date, now)[0] : undefined;

    return (
        <button type="button" onClick={() => onOpen(event)} className={rowClass}>
            <IconTile name={event.icon} size={42} />
            <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium text-ink truncate">{event.name}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-3">
                    <span className="truncate">{date ? format(date, 'yyyy.M.d') : '日付なし'}</span>
                    {next && next.inDays <= 30 && (
                        <Pill tone="accent">{next.inDays === 0 ? `今日で${next.label}` : `あと${next.inDays}日で${next.label}`}</Pill>
                    )}
                </p>
            </div>
            {days !== null && days >= 0 && origin && (
                <div className="shrink-0 text-right">
                    <p className="text-ink leading-none tabular-nums">
                        <span className="text-[22px] font-semibold tracking-tight">{days.toLocaleString('ja-JP')}</span>
                        <span className="text-[12px] text-ink-2 ml-0.5">日</span>
                    </p>
                    <p className="text-[11px] text-ink-3 mt-1">{formatSpan(origin, today)}</p>
                </div>
            )}
            {days !== null && days < 0 && (
                <div className="shrink-0 text-right">
                    <p className="text-[12px] text-ink-3">あと</p>
                    <p className="text-ink leading-none tabular-nums">
                        <span className="text-[22px] font-semibold tracking-tight">{(-days).toLocaleString('ja-JP')}</span>
                        <span className="text-[12px] text-ink-2 ml-0.5">日</span>
                    </p>
                </div>
            )}
        </button>
    );
}

export function RoutineRow({
    event,
    now,
    onOpen,
    onMark,
}: {
    event: LifeEvent;
    now: number;
    onOpen: (e: LifeEvent) => void;
    onMark: (e: LifeEvent) => void;
}) {
    const urgency = getUrgency(event.lastExecutedDate, now);
    const { value, unit } = formatElapsed(event.lastExecutedDate, now);
    const [justDone, setJustDone] = useState(false);

    return (
        <div className="flex items-center hover:bg-surface-2/60">
            <button type="button" onClick={() => onOpen(event)} className={`${rowClass} hover:bg-transparent pr-2`}>
                <IconTile name={event.icon} size={42} />
                <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-medium text-ink truncate">{event.name}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-3">
                        <span className="truncate">
                            {event.lastExecutedDate ? `前回 ${format(event.lastExecutedDate, 'M月d日', { locale: ja })}` : 'まだ記録なし'}
                        </span>
                        {urgency === 'over' && <Pill tone="alert">ご無沙汰</Pill>}
                    </p>
                </div>
                <p className="shrink-0 text-right text-ink leading-none tabular-nums whitespace-nowrap">
                    {event.lastExecutedDate ? (
                        unit ? (
                            <>
                                <span className="text-[22px] font-semibold tracking-tight">{value}</span>
                                <span className="text-[12px] text-ink-2 ml-0.5">{unit}前</span>
                            </>
                        ) : (
                            <span className="text-[13px] text-ink-2">{value}</span>
                        )
                    ) : (
                        <span className="text-[13px] text-ink-3">—</span>
                    )}
                </p>
            </button>
            <button
                type="button"
                onClick={() => {
                    setJustDone(true);
                    setTimeout(() => setJustDone(false), 1200);
                    onMark(event);
                }}
                aria-label={`「${event.name}」を今やったことにする`}
                title="今やった"
                className={`mr-3.5 w-9 h-9 shrink-0 rounded-full border flex items-center justify-center ${
                    justDone ? 'bg-accent border-accent text-white' : 'border-line text-ink-3 hover:text-accent hover:border-accent'
                }`}
            >
                <Check size={17} strokeWidth={2} />
            </button>
        </div>
    );
}
