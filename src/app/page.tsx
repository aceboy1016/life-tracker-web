'use client';

import { useAuth } from '@/contexts/AuthContext';
import AuthPage from '@/components/AuthPage';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh bg-canvas flex items-center justify-center">
        <p className="text-2xl font-black tracking-tight text-ink">⏱️ LifeTracker</p>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthPage />;
}
