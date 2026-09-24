'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Check } from 'lucide-react';
import { LifeEvent, getCategory } from '@/types';
import { formatElapsed, getUrgency, URGENCY_META } from '@/lib/time';
import { Eyebrow, cardClass } from '@/components/ui';

interface EventCardProps {
    event: LifeEvent;
    now: number;
    onMark: (event: LifeEvent) => void;
    onOpen: (event: LifeEvent) => void;
}

export default function EventCard({ event, now, onMark, onOpen }: EventCardProps) {
    const cat = getCategory(event.category);
    const meta = URGENCY_META[getUrgency(event.lastExecutedDate, now)];
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
            className={`${cardClass} ${meta.bar} flex items-center gap-3 pl-4 pr-3 py-3.5 cursor-pointer hover:border-ink/15 focus-visible:outline-2 focus-visible:outline-ink/40`}
        >
            <div className="min-w-0 flex-1">
                <Eyebrow>{cat.en}</Eyebrow>
                <h3 className="mt-1 text-[17px] font-bold text-ink leading-snug truncate">
                    <span className="mr-1.5">{cat.emoji}</span>
                    {event.name}
                </h3>
                <p className="mt-1 text-[13px] text-ink-2 truncate">
                    {event.lastExecutedDate ? format(event.lastExecutedDate, 'M/d HH:mm') : '記録なし'}
                    {event.notes && <span className="text-ink-3"> · {event.notes}</span>}
                </p>
            </div>

            <p className={`shrink-0 text-right leading-none font-black tabular-nums tracking-tight whitespace-nowrap ${meta.text}`}>
                {event.lastExecutedDate ? (
                    <>
                        <span className={unit ? 'text-[26px]' : 'text-sm'}>{value}</span>
                        {unit && <span className="text-xs font-bold ml-0.5">{unit}前</span>}
                    </>
                ) : (
                    <span className="text-xs font-bold">未記録</span>
                )}
            </p>

            <button
                onClick={handleMark}
                aria-label={`「${event.name}」を今やったことにする`}
                title="今やった"
                className={`w-11 h-11 shrink-0 rounded-full border-2 flex items-center justify-center ${
                    justDone
                        ? 'bg-fresh border-fresh text-white'
                        : 'border-line text-ink-3 hover:border-fresh hover:text-fresh'
                }`}
            >
                <Check size={20} strokeWidth={3} />
            </button>
        </div>
    );
}
