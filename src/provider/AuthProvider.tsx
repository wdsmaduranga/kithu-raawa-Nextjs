'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchUser = useUserStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return <>{children}</>;
}