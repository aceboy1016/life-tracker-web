'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { CATEGORY_ENTRIES, EventCategory } from '@/types';

export const inputClass =
    'w-full bg-surface-2/60 border border-line rounded-xl px-4 py-3 text-ink placeholder:text-ink-3 focus:outline-none focus:border-ink/30 focus:bg-surface transition-colors';

export const primaryButtonClass =
    'inline-flex items-center justify-center gap-2 bg-ink text-canvas font-semibold rounded-xl px-4 py-3.5 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none';

export const secondaryButtonClass =
    'inline-flex items-center justify-center gap-2 bg-surface-2 text-ink font-medium rounded-xl px-4 py-3 transition-all hover:bg-ink/10 active:scale-[0.98] disabled:opacity-40';

/** App mark: an elapsed-time arc with a "fresh" dot at its end. */
export function Logo({ size = 36 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
            <rect width="40" height="40" rx="11" className="fill-ink" />
            <path
                d="M20 9.5a10.5 10.5 0 1 1-10.5 10.5"
                fill="none"
                strokeWidth="3.2"
                strokeLinecap="round"
                className="stroke-canvas"
            />
            <circle cx="9.5" cy="20" r="3" className="fill-fresh" />
            <path d="M20 14.5V20l3.5 2.5" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="stroke-canvas" />
        </svg>
    );
}

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
    return (
        <p className="text-[13px] font-semibold text-ink-2 mb-2">
            {children}
            {hint && <span className="font-normal text-ink-3 ml-1.5">{hint}</span>}
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
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
            <div className="relative w-full sm:max-w-md max-h-[92dvh] overflow-y-auto bg-surface rounded-t-[28px] sm:rounded-[28px] shadow-2xl animate-sheet-up pb-[env(safe-area-inset-bottom)]">
                <div className="sm:hidden flex justify-center pt-2.5">
                    <div className="w-10 h-1 rounded-full bg-ink/15" />
                </div>
                <div className="flex items-center justify-between gap-3 px-5 pt-4 sm:pt-5">
                    <div className="min-w-0 flex-1">{title}</div>
                    <button
                        onClick={onClose}
                        aria-label="閉じる"
                        className="w-9 h-9 shrink-0 rounded-full bg-surface-2 flex items-center justify-center text-ink-2 hover:text-ink transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="px-5 pt-4 pb-6">{children}</div>
            </div>
        </div>
    );
}

export function CategoryPicker({ value, onChange }: { value: EventCategory; onChange: (c: EventCategory) => void }) {
    return (
        <div className="flex flex-wrap gap-2">
            {CATEGORY_ENTRIES.map(([key, cfg]) => {
                const active = value === key;
                return (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onChange(key)}
                        aria-pressed={active}
                        className={`flex items-center gap-1.5 pl-2.5 pr-3.5 py-2 rounded-full border text-sm font-medium transition-all ${
                            active
                                ? 'bg-ink text-canvas border-ink'
                                : 'bg-surface border-line text-ink-2 hover:border-ink/25 hover:text-ink'
                        }`}
                    >
                        <span className="text-base leading-none">{cfg.emoji}</span>
                        {cfg.label}
                    </button>
                );
            })}
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
        <div className="fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 pointer-events-none">
            <div
                key={toast.id}
                role="status"
                className="pointer-events-auto flex items-center gap-4 bg-ink text-canvas rounded-2xl pl-4 pr-2 py-2 shadow-2xl animate-sheet-up max-w-md"
            >
                <span className="text-sm font-medium py-1.5">{toast.message}</span>
                {toast.onUndo && (
                    <button
                        onClick={() => {
                            toast.onUndo?.();
                            onDismiss();
                        }}
                        className="text-sm font-semibold px-3 py-1.5 rounded-xl bg-canvas/15 hover:bg-canvas/25 transition-colors"
                    >
                        元に戻す
                    </button>
                )}
            </div>
        </div>
    );
}
