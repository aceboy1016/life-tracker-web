'use client';

import { useAuth } from '@/contexts/AuthContext';
import AuthPage from '@/components/AuthPage';
import Dashboard from '@/components/Dashboard';
import { Logo } from '@/components/ui';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh bg-canvas flex items-center justify-center">
        <div className="animate-pulse">
          <Logo size={56} />
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthPage />;
}
