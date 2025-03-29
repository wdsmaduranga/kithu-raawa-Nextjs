// stores/userStore.js
import { create } from 'zustand';
import { getCookie, getCookies, setCookie, deleteCookie, hasCookie } from 'cookies-next';

export const useUserStore = create((set) => ({
    user: null,
    setUser: (userData) => set({ user: userData }),
    clearUser: () => set({ user: null }),
    fetchUser: async () => {
      const token = getCookie('token');
      try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/get-user`, {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
          });
          if (response.ok) {
              const data = await response.json();
            //   console.log(data);
              set({ user: data.user }); // assuming `data.user` has the user information
          } else {
              console.error(`Failed to fetch user data: ${response.status}`);
              set({ user: null }); // Clear user on failure
          }
      } catch (error) {
          console.error('Error fetching user data:', error);
          set({ user: null });
      }
  },

}));
