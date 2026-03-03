'use client';

import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { LifeEvent, CATEGORY_CONFIG } from '@/types';
import { CheckCircle, Trash2, Clock } from 'lucide-react';

interface EventCardProps {
    event: LifeEvent;
    onMark: (id: string) => void;
    onDelete: (id: string) => void;
    onClick: (event: LifeEvent) => void;
}

function getElapsedStyle(date: Date | null): { text: string; urgency: 'fresh' | 'ok' | 'warn' | 'danger' } {
    if (!date) return { text: '未実行', urgency: 'danger' };
    const hours = (Date.now() - date.getTime()) / 1000 / 3600;
    const text = formatDistanceToNow(date, { addSuffix: true, locale: ja });
    if (hours < 24) return { text, urgency: 'fresh' };
    if (hours < 72) return { text, urgency: 'ok' };
    if (hours < 168) return { text, urgency: 'warn' };
    return { text, urgency: 'danger' };
}

const urgencyRing: Record<string, string> = {
    fresh: 'ring-1 ring-emerald-400/40',
    ok: 'ring-1 ring-blue-400/30',
    warn: 'ring-1 ring-amber-400/40',
    danger: 'ring-1 ring-rose-400/40',
};

const urgencyDot: Record<string, string> = {
    fresh: 'bg-emerald-400',
    ok: 'bg-blue-400',
    warn: 'bg-amber-400',
    danger: 'bg-rose-500',
};

const urgencyTimeColor: Record<string, string> = {
    fresh: 'text-emerald-400',
    ok: 'text-blue-400',
    warn: 'text-amber-400',
    danger: 'text-rose-400',
};

export default function EventCard({ event, onMark, onDelete, onClick }: EventCardProps) {
    const cat = CATEGORY_CONFIG[event.category];
    const { text: elapsed, urgency } = getElapsedStyle(event.lastExecutedDate);

    return (
        <div
            className={`relative group bg-gray-900/60 backdrop-blur-sm border border-white/8 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:bg-gray-800/70 hover:border-white/15 hover:-translate-y-0.5 hover:shadow-xl ${urgencyRing[urgency]}`}
            onClick={() => onClick(event)}
        >
            {/* Category badge */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl flex-shrink-0">{cat.emoji}</span>
                    <div className="min-w-0">
                        <span className="text-xs font-medium text-white/40 uppercase tracking-widest block">
                            {cat.label}
                        </span>
                        <h3 className="text-white font-semibold text-base leading-tight truncate">
                            {event.name}
                        </h3>
                    </div>
                </div>
                {/* Urgency dot */}
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${urgencyDot[urgency]} shadow-lg`} />
            </div>

            {/* Time elapsed */}
            <div className={`flex items-center gap-1.5 text-sm font-medium ${urgencyTimeColor[urgency]}`}>
                <Clock size={13} className="flex-shrink-0" />
                <span>{elapsed}</span>
            </div>

            {/* Notes */}
            {event.notes && (
                <p className="mt-2 text-xs text-white/40 line-clamp-2 leading-relaxed">
                    {event.notes}
                </p>
            )}

            {/* Actions */}
            <div className="absolute right-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onMark(event.id);
                    }}
                    className="w-9 h-9 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 transition-all active:scale-95"
                    title="今やった！"
                >
                    <CheckCircle size={16} />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(event.id);
                    }}
                    className="w-9 h-9 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/30 rounded-xl flex items-center justify-center text-rose-400 transition-all active:scale-95"
                    title="削除"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}
