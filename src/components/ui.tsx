'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { Glyph, ICON_KEYS, ICONS } from '@/lib/icons';

export const inputClass =
    'w-full bg-surface border border-line rounded-2xl px-4 py-3 text-[15px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-ink/25';

export const primaryButtonClass =
    'inline-flex items-center justify-center gap-2 h-12 px-5 bg-ink text-canvas text-[15px] font-medium rounded-2xl hover:opacity-90 disabled:opacity-30 disabled:pointer-events-none';

export const secondaryButtonClass =
    'inline-flex items-center justify-center gap-2 h-12 px-4 bg-surface border border-line text-ink text-[14px] font-medium rounded-2xl hover:bg-surface-2 disabled:opacity-30';

export const cardClass = 'bg-surface border border-line rounded-[20px]';

/** Grouped-list header: small muted title with an optional count. */
export function GroupHeader({ title, count, action }: { title: string; count?: number; action?: ReactNode }) {
    return (
        <div className="flex items-baseline gap-2 px-1 mb-2.5">
            <h2 className="text-[13px] font-medium text-ink-2">{title}</h2>
            {count !== undefined && <span className="text-[12px] text-ink-3 tabular-nums">{count}</span>}
            {action && <div className="ml-auto">{action}</div>}
        </div>
    );
}

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
    return (
        <p className="text-[12px] font-medium text-ink-2 mb-2 px-1">
            {children}
            {hint && <span className="text-ink-3 ml-1.5">{hint}</span>}
        </p>
    );
}

export function Pill({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'alert' | 'accent' }) {
    const cls =
        tone === 'alert' ? 'bg-alert-soft text-alert' : tone === 'accent' ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-ink-2';
    return <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${cls}`}>{children}</span>;
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
            <div className="absolute inset-0 bg-black/25" onClick={onClose} />
            <div className="relative w-full sm:max-w-md max-h-[92dvh] overflow-y-auto bg-canvas rounded-t-[28px] sm:rounded-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]">
                <div className="sm:hidden flex justify-center pt-2.5">
                    <div className="w-9 h-1 rounded-full bg-ink/10" />
                </div>
                <div className="flex items-start justify-between gap-3 px-5 pt-4 sm:pt-6">
                    <div className="min-w-0 flex-1">{title}</div>
                    <button
                        onClick={onClose}
                        aria-label="閉じる"
                        className="w-8 h-8 shrink-0 rounded-full bg-surface-2 flex items-center justify-center text-ink-2 hover:text-ink"
                    >
                        <X size={16} strokeWidth={2} />
                    </button>
                </div>
                <div className="px-5 pt-5 pb-7">{children}</div>
            </div>
        </div>
    );
}

export function SheetTitle({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div>
            <h2 className="text-[20px] font-bold text-ink leading-tight">{title}</h2>
            {subtitle && <p className="text-[13px] text-ink-3 mt-1">{subtitle}</p>}
        </div>
    );
}

export function Segmented<T extends string>({
    value,
    options,
    onChange,
    size = 'md',
}: {
    value: T;
    options: [T, ReactNode][];
    onChange: (v: T) => void;
    size?: 'sm' | 'md';
}) {
    return (
        <div className="flex p-[3px] bg-surface-2 rounded-[14px]">
            {options.map(([key, label]) => (
                <button
                    key={key}
                    type="button"
                    onClick={() => onChange(key)}
                    aria-pressed={value === key}
                    className={`flex-1 rounded-[11px] font-medium ${size === 'sm' ? 'px-3 py-1.5 text-[12px]' : 'py-2 text-[13px]'} ${
                        value === key ? 'bg-surface text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'text-ink-3 hover:text-ink-2'
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
            className={`relative w-[50px] h-[30px] shrink-0 rounded-full disabled:opacity-40 ${checked ? 'bg-accent' : 'bg-ink/12'}`}
        >
            <span className={`absolute top-[3px] w-6 h-6 rounded-full bg-white shadow-sm ${checked ? 'left-[23px]' : 'left-[3px]'}`} />
        </button>
    );
}

export function IconPicker({ value, onChange }: { value: string; onChange: (icon: string) => void }) {
    return (
        <div className="grid grid-cols-7 gap-1.5">
            {ICON_KEYS.map((key) => (
                <button
                    key={key}
                    type="button"
                    onClick={() => onChange(key)}
                    aria-pressed={value === key}
                    aria-label={ICONS[key].label}
                    title={ICONS[key].label}
                    className={`aspect-square rounded-[14px] flex items-center justify-center border ${
                        value === key ? 'bg-ink text-canvas border-ink' : 'bg-surface border-line text-ink-2 hover:text-ink'
                    }`}
                >
                    <Glyph name={key} size={20} />
                </button>
            ))}
        </div>
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
        <div className="fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 pointer-events-none">
            <div
                key={toast.id}
                role="status"
                className="pointer-events-auto flex items-center gap-4 bg-ink/90 backdrop-blur text-canvas rounded-2xl pl-4 pr-2 py-2 shadow-lg max-w-md"
            >
                <span className="text-[13px] py-1.5">{toast.message}</span>
                {toast.onUndo && (
                    <button
                        onClick={() => {
                            toast.onUndo?.();
                            onDismiss();
                        }}
                        className="text-[13px] font-medium px-3 py-1.5 rounded-xl bg-canvas/15 hover:bg-canvas/25"
                    >
                        元に戻す
                    </button>
                )}
            </div>
        </div>
    );
}
