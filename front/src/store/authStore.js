// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: true,
      pendingEmail: null,

      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),

      setLoading: (isLoading) => set({ isLoading }),

      setPendingEmail: (email) => set({ pendingEmail: email }),

      // Login
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login(email, password);
          
          if (response.success && response.data) {
            Cookies.set('accessToken', response.data.accessToken, { expires: 1 });
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
            return response;
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Register
      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register(data);
          
          if (response.success && response.data) {
            set({
              pendingEmail: response.data.email,
              isLoading: false,
            });
            return response;
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Verify OTP
      verifyOTP: async (email, otp) => {
        set({ isLoading: true });
        try {
          const response = await authApi.verifyOTP(email, otp);
          
          if (response.success && response.data) {
            Cookies.set('accessToken', response.data.accessToken, { expires: 1 });
            set({
              user: response.data.user,
              isAuthenticated: true,
              pendingEmail: null,
              isLoading: false,
            });
            return response;
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          Cookies.remove('accessToken');
          set({
            user: null,
            isAuthenticated: false,
            pendingEmail: null,
          });
        }
      },

      // Fetch current user
      fetchUser: async () => {
        const token = Cookies.get('accessToken');
        
        if (!token) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        try {
          const response = await authApi.getMe();
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error) {
          Cookies.remove('accessToken');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // Update profile
      updateProfile: async (data) => {
        const response = await authApi.updateProfile(data);
        
        if (response.success && response.data) {
          set({ user: response.data.user });
        }
        
        return response;
      },

      // Update avatar
      updateAvatar: async (file) => {
        const response = await authApi.updateAvatar(file);
        
        if (response.success && response.data) {
          const currentUser = get().user;
          set({ 
            user: { ...currentUser, avatar: response.data.avatar } 
          });
        }
        
        return response;
      },

      // Clear auth state
      clearAuth: () => {
        Cookies.remove('accessToken');
        set({
          user: null,
          isAuthenticated: false,
          pendingEmail: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        pendingEmail: state.pendingEmail,
      }),
    }
  )
);