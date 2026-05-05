import { create } from 'zustand';

export interface UserProfile {
  fullName: string;
  email: string;
  role: string;
  department: string;
  phone: string;
}

interface AuthStoreState {
  user: UserProfile;
}

interface AuthStoreActions {
  updateProfile: (data: Partial<UserProfile>) => void;
}

type AuthStore = AuthStoreState & AuthStoreActions;

export function getAvatarInitials(name: string): string {
  if (!name || name.trim() === '') return 'U';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  
  if (name.length >= 2) {
    return name.substring(0, 2).toUpperCase();
  }
  
  return name[0].toUpperCase();
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: {
    fullName: 'Reeshu S.',
    email: 'reeshu@safeguard.io',
    role: 'Admin',
    department: 'Safety & Compliance',
    phone: '+91 98765 43210',
  },
  updateProfile: (data) => set((state) => ({ user: { ...state.user, ...data } })),
}));
