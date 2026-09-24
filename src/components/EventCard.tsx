'use client';

import { format } from 'date-fns';
import { LifeEvent } from '@/types';
import { IconTile } from '@/lib/icons';
import { daysBetween, spanParts, toYMD, upcomingOccasions } from '@/lib/time';
import { Pill, SpanText } from '@/components/ui';

/** One item: icon, name, date, and how long ago it was (years / months / days). */
export function EventRow({ event, now, onOpen }: { event: LifeEvent; now: number; onOpen: (e: LifeEvent) => void }) {
    const date = event.lastExecutedDate;
    const today = toYMD(now);
    const origin = date ? toYMD(date) : null;
    const days = origin ? daysBetween(origin, today) : null;
    const parts = origin && days !== null && days > 0 ? spanParts(origin, today) : [];
    const next = event.group === 'milestone' && date ? upcomingOccasions(date, now)[0] : undefined;

    return (
        <button
            type="button"
            onClick={() => onOpen(event)}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-surface-2/60 focus-visible:outline-none focus-visible:bg-surface-2"
        >
            <IconTile name={event.icon} size={42} />
            <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium text-ink truncate">{event.name}</p>
                <div className="mt-1 flex items-center gap-2 leading-none">
                    {days === null ? (
                        <span className="text-[13px] text-ink-3">日付なし</span>
                    ) : days < 0 ? (
                        <span className="text-[13px] text-ink-2">あと{-days}日</span>
                    ) : days === 0 ? (
                        <span className="text-[13px] text-ink-2">今日</span>
                    ) : (
                        <SpanText
                            parts={parts}
                            numberClass="text-[17px] font-semibold tracking-tight"
                            unitClass="text-[11px] text-ink-2 ml-px mr-0.5"
                        />
                    )}
                    {next && next.inDays <= 30 && (
                        <Pill tone="accent">{next.inDays === 0 ? `今日で${next.label}` : `あと${next.inDays}日で${next.label}`}</Pill>
                    )}
                </div>
                {date && (
                    <p className="mt-1 text-[12px] text-ink-3 tabular-nums">
                        {format(date, 'yyyy.M.d')}
                        {event.group === 'milestone' && days !== null && days >= 30 && ` · ${days.toLocaleString('ja-JP')}日`}
                    </p>
                )}
            </div>
        </button>
    );
}
