import axios from 'axios';
import Cookies from 'js-cookie';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.algomatrixai.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  let token = Cookies.get('waba_token');
  
  try {
    const { auth } = await import('@algo-matrix/shared');
    const user = auth.currentUser;
    if (user) {
      token = await user.getIdToken();
      // Keep cookie in sync
      Cookies.set('waba_token', token, { expires: 1 });
    }
  } catch (e) {
    // Ignore error if firebase is not initialized or not available
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g. redirect to login)
      Cookies.remove('waba_token');
      Cookies.remove('waba_user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
