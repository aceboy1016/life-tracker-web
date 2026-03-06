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
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-lg w-full">
                <h2 className="text-red-400 font-bold text-lg mb-3">エラーが発生しました</h2>
                <pre className="text-white/70 text-xs bg-black/30 rounded-xl p-4 overflow-auto mb-4 whitespace-pre-wrap">
                    {error.message}
                    {'\n\n'}
                    {error.stack}
                </pre>
                <button
                    onClick={reset}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-400 transition-colors"
                >
                    再試行
                </button>
            </div>
        </div>
    );
}
