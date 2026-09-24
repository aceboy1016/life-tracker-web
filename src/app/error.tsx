'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('App Error:', error);
    }, [error]);

    return (
        <div className="min-h-dvh bg-canvas flex items-center justify-center p-4">
            <div className="bg-surface border border-line rounded-3xl p-6 max-w-lg w-full">
                <h2 className="text-alert font-bold text-lg mb-3">エラーが発生しました</h2>
                <pre className="text-ink-2 text-xs bg-surface-2 rounded-xl p-4 overflow-auto mb-4 whitespace-pre-wrap">
                    {error.message}
                    {'\n\n'}
                    {error.stack}
                </pre>
                <button
                    onClick={reset}
                    className="px-4 py-2.5 bg-ink text-canvas rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                    再試行
                </button>
            </div>
        </div>
    );
}
