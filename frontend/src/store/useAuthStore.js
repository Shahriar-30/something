import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

/**
 * Auth Store using Zustand for managing authentication state.
 * Handles user info, tokens, and business context.
 */
const useAuthStore = create(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        activeBusiness: null,
        businesses: [],
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        setAuth: (data) =>
          set({
            user: data.user,
            token: data.token,
            activeBusiness: data.activeBusiness,
            businesses: data.businesses || [],
            isAuthenticated: true,
            error: null,
          }),

        updateToken: (token) => set({ token }),

        setBusinesses: (businesses) => set({ businesses }),

        setActiveBusiness: (activeBusiness) => set({ activeBusiness }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        logout: () =>
          set({
            user: null,
            token: null,
            activeBusiness: null,
            businesses: [],
            isAuthenticated: false,
            error: null,
          }),
      }),
      {
        name: "auth-storage",
      },
    ),
  ),
);

export default useAuthStore;
