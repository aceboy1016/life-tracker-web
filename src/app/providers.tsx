'use client';

import { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { registerServiceWorker } from '@/lib/notifications';

export default function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        registerServiceWorker();
    }, []);

    return <AuthProvider>{children}</AuthProvider>;
}
