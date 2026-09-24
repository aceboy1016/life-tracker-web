'use client';

import { useEffect, useState } from 'react';

/** Current timestamp that re-renders every minute so relative times stay fresh. */
export function useNow(intervalMs = 60_000): number {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);
    return now;
}
