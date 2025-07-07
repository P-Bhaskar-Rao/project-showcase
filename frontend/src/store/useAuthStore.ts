import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axiosInstance from '@/api/axiosInstance'

export interface User {
  id: string
  name: string
  email: string
  isVerified: boolean
  avatar?: string | null
  oauthProvider?: 'google' | 'github' | null
}

export interface Profile {
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  skills?: string[];
  education?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear: number;
  }>;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  joinDate?: string;
  // Add any other fields as needed
}

interface AuthState {
  user: User | null
  accessToken: string | null
  profile: Profile | null
  profileCompleteness: boolean
  isInitialized: boolean
  setAuth: (user: User, accessToken: string) => void
  clearAuth: () => void
  setProfile: (profile: Profile) => void
  setProfileCompleteness: (isComplete: boolean) => void
  setInitialized: (initialized: boolean) => void
  fetchProfile: () => Promise<void>
  updateProfile: (profileData: Partial<Profile>) => Promise<boolean>
  fetchProfileCompleteness: () => Promise<void>
}

const API_URL = import.meta.env.VITE_API_URL;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      profile: null,
      profileCompleteness: false,
      isInitialized: false,
      setAuth: (user, accessToken) => {
        console.log('[Zustand] setAuth called', user, accessToken);
        set({ user, accessToken });
      },
      clearAuth: () => {
        console.log('[Zustand] clearAuth called');
        set({ user: null, accessToken: null, profile: null, profileCompleteness: false });
      },
      setProfile: (profile) => set({ profile }),
      setProfileCompleteness: (isComplete) => set({ profileCompleteness: isComplete }),
      setInitialized: (initialized) => set({ isInitialized: initialized }),
      fetchProfile: async () => {
        const token = get().accessToken;
        if (!token) return;
        const user = get().user;
        const isInitialized = get().isInitialized;
        if (!user || !isInitialized) return;
        console.log('[Zustand] fetchProfile called', { token, user, isInitialized });
        try {
          const res = await axiosInstance.get(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          set({ profile: res.data.user });
          set({ profileCompleteness: res.data.isProfileComplete });

          // Sync user with profile for name and avatar
          if (get().user) {
            const updatedUser = { ...get().user! };
            if (res.data.user.name) {
              updatedUser.name = res.data.user.name;
            }
            if (res.data.user.avatar !== undefined) {
              updatedUser.avatar = res.data.user.avatar;
            }
            set({ user: updatedUser });
          }
          
          console.log('[Zustand] fetchProfile success', res.data.user);
        } catch (e) {
          console.log('[Zustand] fetchProfile error', e);
          if (e && typeof e === 'object' && 'response' in e) {
            const error = e as { response?: { status?: number; data?: { code?: string } } };
            if (error.response?.status === 401 && error.response?.data?.code === 'USER_NOT_FOUND') {
              set({ user: null, accessToken: null, profile: null, profileCompleteness: false });
            }
          }
        }
      },
      updateProfile: async (profileData) => {
        const token = get().accessToken;
        if (!token) return false;
        console.log('[Zustand] updateProfile called', profileData);
        try {
          const res = await axiosInstance.put(`${API_URL}/profile`, profileData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          set({ profile: res.data.user });
          set({ profileCompleteness: res.data.isProfileComplete });
          
          // Update user state if name or avatar was changed
          if (get().user) {
            const updatedUser = { ...get().user! };
            if (profileData.name) {
              updatedUser.name = profileData.name;
            }
            if (profileData.avatar !== undefined) {
              updatedUser.avatar = profileData.avatar;
            }
            set({ user: updatedUser });
          }
          
          console.log('[Zustand] updateProfile success', res.data.user);
          return true;
        } catch (e) {
          console.log('[Zustand] updateProfile error', e);
          if (e && typeof e === 'object' && 'response' in e) {
            const error = e as { response?: { status?: number; data?: { code?: string } } };
            if (error.response?.status === 401 && error.response?.data?.code === 'USER_NOT_FOUND') {
              set({ user: null, accessToken: null, profile: null, profileCompleteness: false });
            }
          }
          return false;
        }
      },
      fetchProfileCompleteness: async () => {
        const token = get().accessToken;
        if (!token) return;
        const user = get().user;
        const isInitialized = get().isInitialized;
        if (!user || !isInitialized) return;
        console.log('[Zustand] fetchProfileCompleteness called', { token, user, isInitialized });
        try {
          const res = await axiosInstance.get(`${API_URL}/profile/completeness`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          set({ profileCompleteness: res.data.isProfileComplete });
          console.log('[Zustand] fetchProfileCompleteness success', res.data.isProfileComplete);
        } catch (e) {
          console.log('[Zustand] fetchProfileCompleteness error', e);
          if (e && typeof e === 'object' && 'response' in e) {
            const error = e as { response?: { status?: number; data?: { code?: string } } };
            if (error.response?.status === 401 && error.response?.data?.code === 'USER_NOT_FOUND') {
              set({ user: null, accessToken: null, profile: null, profileCompleteness: false });
            }
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        profile: state.profile,
        profileCompleteness: state.profileCompleteness,
        isInitialized: state.isInitialized
      })
    }
  )
)
