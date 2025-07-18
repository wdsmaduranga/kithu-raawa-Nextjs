import { create } from 'zustand';
import { getCookie } from 'cookies-next';
import type { User } from '@/lib/types';

interface UserState {
  user: User | null;
  isReverendFather: boolean;
  // isAdmin: boolean;
  setUser: (userData: User | null) => void;
  clearUser: () => void;
  fetchUser: () => Promise<void>;
}


export const useUserStore = create<UserState>((set) => ({
  user: null,
  isReverendFather: false,
  // isAdmin: false,
  setUser: (userData) => set({ user: userData }),
  clearUser: () => set({ user: null }),
  fetchUser: async () => {
    const token = getCookie('token');
    if (!token) {
      set({ user: null });
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/get-user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        set({ user: data.user });
        set({ isReverendFather: data.isReverendFather });
      } else {
        console.error(`Failed to fetch user data: ${response.status}`);
        set({ user: null });
        set({ isReverendFather: false });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      set({ isReverendFather: false });
      set({ user: null });
    }
  },
}));