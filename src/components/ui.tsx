'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { CATEGORY_ENTRIES, EventCategory } from '@/types';

export const inputClass =
    'w-full bg-surface-2 border border-line rounded-xl px-4 py-3 text-ink font-medium placeholder:text-ink-3 placeholder:font-normal focus:outline-none focus:border-ink/40 focus:bg-surface';

export const primaryButtonClass =
    'inline-flex items-center justify-center gap-2 bg-ink text-canvas font-bold rounded-xl px-4 py-3.5 hover:opacity-90 disabled:opacity-35 disabled:pointer-events-none';

export const secondaryButtonClass =
    'inline-flex items-center justify-center gap-2 bg-surface-2 border border-line text-ink font-bold rounded-xl px-4 py-3 hover:bg-ink/5 disabled:opacity-35';

/** Card with a colored left rule, as used throughout the app. */
export const cardClass = 'bg-surface border border-line border-l-4 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)]';

/** Small uppercase label, e.g. "HEALTH" above a title. */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <p className={`text-[11px] font-bold tracking-[0.16em] uppercase text-ink-3 ${className}`}>{children}</p>;
}

/** Emoji + bold English title + small Japanese subtitle. */
export function SectionTitle({
    emoji,
    title,
    subtitle,
    trailing,
    size = 'md',
}: {
    emoji: string;
    title: string;
    subtitle?: string;
    trailing?: ReactNode;
    size?: 'md' | 'lg';
}) {
    return (
        <div className="flex items-center gap-3">
            <span className={size === 'lg' ? 'text-4xl' : 'text-3xl'} aria-hidden="true">
                {emoji}
            </span>
            <div className="min-w-0 flex-1">
                <h2 className={`font-black tracking-tight text-ink leading-tight ${size === 'lg' ? 'text-[28px]' : 'text-[22px]'}`}>
                    {title}
                </h2>
                {subtitle && <p className="text-[13px] font-medium text-ink-3 mt-0.5">{subtitle}</p>}
            </div>
            {trailing}
        </div>
    );
}

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
    return (
        <p className="text-[13px] font-bold text-ink mb-2">
            {children}
            {hint && <span className="font-medium text-ink-3 ml-1.5">{hint}</span>}
        </p>
    );
}

/** Bottom sheet on mobile, centered dialog on larger screens. Closes on Escape or backdrop tap. */
export function Sheet({ title, onClose, children }: { title?: ReactNode; onClose: () => void; children: ReactNode }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/45" onClick={onClose} />
            <div className="relative w-full sm:max-w-md max-h-[92dvh] overflow-y-auto bg-canvas rounded-t-3xl sm:rounded-3xl shadow-2xl pb-[env(safe-area-inset-bottom)]">
                <div className="sm:hidden flex justify-center pt-2.5">
                    <div className="w-10 h-1 rounded-full bg-ink/20" />
                </div>
                <div className="flex items-start justify-between gap-3 px-5 pt-4 sm:pt-6">
                    <div className="min-w-0 flex-1">{title}</div>
                    <button
                        onClick={onClose}
                        aria-label="閉じる"
                        className="w-9 h-9 shrink-0 rounded-full bg-surface border border-line flex items-center justify-center text-ink-2 hover:text-ink"
                    >
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>
                <div className="px-5 pt-5 pb-6">{children}</div>
            </div>
        </div>
    );
}

export function CategoryPicker({ value, onChange }: { value: EventCategory; onChange: (c: EventCategory) => void }) {
    return (
        <div className="flex flex-wrap gap-2">
            {CATEGORY_ENTRIES.map(([key, cfg]) => (
                <Chip key={key} active={value === key} onClick={() => onChange(key)}>
                    <span>{cfg.emoji}</span>
                    {cfg.label}
                </Chip>
            ))}
        </div>
    );
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-bold border ${
                active ? 'bg-ink text-canvas border-ink' : 'bg-surface border-line text-ink-2 hover:text-ink'
            }`}
        >
            {children}
        </button>
    );
}

export function Segmented<T extends string>({
    value,
    options,
    onChange,
    size = 'md',
}: {
    value: T;
    options: [T, string][];
    onChange: (v: T) => void;
    size?: 'sm' | 'md';
}) {
    return (
        <div className="flex p-1 bg-ink/[0.06] rounded-xl">
            {options.map(([key, label]) => (
                <button
                    key={key}
                    type="button"
                    onClick={() => onChange(key)}
                    aria-pressed={value === key}
                    className={`flex-1 rounded-lg font-bold ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'py-2.5 text-[13px]'} ${
                        value === key ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink'
                    }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

export function Switch({ checked, onChange, disabled, label }: { checked: boolean; onChange: () => void; disabled?: boolean; label: string }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={onChange}
            className={`relative w-[52px] h-8 shrink-0 rounded-full disabled:opacity-40 ${checked ? 'bg-fresh' : 'bg-ink/15'}`}
        >
            <span
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow ${checked ? 'left-[24px]' : 'left-1'}`}
            />
        </button>
    );
}

export interface ToastState {
    id: number;
    message: string;
    onUndo?: () => void;
}

export function Toast({ toast, onDismiss }: { toast: ToastState | null; onDismiss: () => void }) {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(onDismiss, 4500);
        return () => clearTimeout(t);
    }, [toast, onDismiss]);

    if (!toast) return null;
    return (
        <div className="fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 pointer-events-none">
            <div
                key={toast.id}
                role="status"
                className="pointer-events-auto flex items-center gap-4 bg-ink text-canvas rounded-xl pl-4 pr-2 py-2 shadow-2xl max-w-md"
            >
                <span className="text-sm font-bold py-1.5">{toast.message}</span>
                {toast.onUndo && (
                    <button
                        onClick={() => {
                            toast.onUndo?.();
                            onDismiss();
                        }}
                        className="text-sm font-bold px-3 py-1.5 rounded-lg bg-canvas/15 hover:bg-canvas/25"
                    >
                        元に戻す
                    </button>
                )}
            </div>
        </div>
    );
}
