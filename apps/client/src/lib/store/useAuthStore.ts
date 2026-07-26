import { create } from 'zustand';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null, token: string | null, rememberMe?: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: Cookies.get('waba_token') || null,
  setUser: (user, token, rememberMe = false) => {
    if (token) {
      if (rememberMe) {
        Cookies.set('waba_token', token, { expires: 30 }); // 30 days
      } else {
        Cookies.set('waba_token', token); // Session cookie
      }
    } else {
      Cookies.remove('waba_token');
    }
    set({ user, token });
  },
  logout: () => {
    Cookies.remove('waba_token');
    Cookies.remove('waba_user');
    set({ user: null, token: null });
    window.location.href = '/login';
  },
}));
