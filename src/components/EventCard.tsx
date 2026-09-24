'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { LifeEvent, getCategory } from '@/types';
import { formatElapsed, getUrgency, URGENCY_META } from '@/lib/time';

interface EventCardProps {
    event: LifeEvent;
    now: number;
    onMark: (event: LifeEvent) => void;
    onOpen: (event: LifeEvent) => void;
}

export default function EventCard({ event, now, onMark, onOpen }: EventCardProps) {
    const cat = getCategory(event.category);
    const urgency = getUrgency(event.lastExecutedDate, now);
    const meta = URGENCY_META[urgency];
    const { value, unit } = formatElapsed(event.lastExecutedDate, now);
    const [justDone, setJustDone] = useState(false);

    const handleMark = (e: React.MouseEvent) => {
        e.stopPropagation();
        setJustDone(true);
        setTimeout(() => setJustDone(false), 1200);
        onMark(event);
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onOpen(event)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') onOpen(event);
            }}
            className="group relative flex items-center gap-3.5 bg-surface border border-line rounded-2xl p-3 pr-3 cursor-pointer transition-all hover:border-ink/15 hover:shadow-[0_6px_24px_-12px_rgba(0,0,0,0.25)] focus-visible:outline-2 focus-visible:outline-ink/40"
        >
            {/* Category tile with status dot */}
            <div className={`relative w-12 h-12 shrink-0 rounded-xl ${cat.tile} flex items-center justify-center text-2xl`}>
                {cat.emoji}
                <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ring-[2.5px] ring-surface ${meta.dot}`} />
            </div>

            {/* Name & notes */}
            <div className="min-w-0 flex-1">
                <h3 className="text-ink font-semibold text-[15px] leading-snug truncate">{event.name}</h3>
                <p className="text-ink-3 text-xs mt-0.5 truncate">
                    {cat.label}
                    {event.notes && <span> · {event.notes}</span>}
                </p>
            </div>

            {/* Elapsed */}
            <div className="text-right shrink-0">
                {event.lastExecutedDate ? (
                    <p className={`leading-none font-bold tabular-nums tracking-tight whitespace-nowrap ${meta.text}`}>
                        <span className={unit ? 'text-2xl' : 'text-sm'}>{value}</span>
                        {unit && <span className="text-xs font-semibold ml-0.5">{unit}前</span>}
                    </p>
                ) : (
                    <p className="text-xs font-medium text-ink-3">未記録</p>
                )}
            </div>

            {/* Mark as done */}
            <button
                onClick={handleMark}
                aria-label={`「${event.name}」を今やったことにする`}
                title="今やった！"
                className={`w-11 h-11 shrink-0 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${
                    justDone
                        ? 'bg-fresh border-fresh text-white animate-pop'
                        : 'border-line text-ink-3 hover:border-fresh hover:text-fresh hover:bg-fresh/10'
                }`}
            >
                <Check size={20} strokeWidth={2.75} />
            </button>
        </div>
    );
}
