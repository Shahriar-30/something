import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Basic App Store using Zustand.
 * Includes devtools and persistence by default.
 */
const useAppStore = create(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        logout: () => set({ user: null, isAuthenticated: false }),
      }),
      {
        name: 'app-storage', // name of the item in storage (must be unique)
      }
    )
  )
);

export default useAppStore;
