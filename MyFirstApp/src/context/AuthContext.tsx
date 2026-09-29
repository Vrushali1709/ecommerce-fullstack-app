import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api.config';
import { authApi, ApiUser } from '../services/api';

export type User = {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  is_admin?: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (name: string, email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  updateProfile: (name: string, email: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load saved user & token when app starts
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem(
          API_CONFIG.TOKEN_STORAGE_KEY
        );
        const savedUser = await AsyncStorage.getItem(
          API_CONFIG.USER_STORAGE_KEY
        );

        if (savedToken) {
          setToken(savedToken);
        }

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        // Try to fetch fresh user profile from backend if token exists
        if (savedToken) {
          try {
            const freshUser = await authApi.getMe();
            if (freshUser) {
              const formattedUser: User = {
                id: freshUser.id,
                name: freshUser.name,
                email: freshUser.email,
                phone: freshUser.phone,
                avatar: freshUser.avatar,
                is_admin: freshUser.is_admin,
              };
              setUser(formattedUser);
              await AsyncStorage.setItem(
                API_CONFIG.USER_STORAGE_KEY,
                JSON.stringify(formattedUser)
              );
            }
          } catch (apiErr) {
            console.log('Backend sync offline, using cached user profile:', apiErr);
          }
        }
      } catch (error) {
        console.log('Failed to load auth session:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  // Login
  const login = async (
    name: string,
    email: string,
    password?: string
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || 'User';
    const pwd = password || 'Password123!';

    try {
      // 1. Try logging in via backend API
      let authResult;
      try {
        authResult = await authApi.login(cleanEmail, pwd);
      } catch (loginErr: any) {
        // If account not found or invalid credentials, auto-register for smooth UX
        if (
          loginErr.message?.includes('Incorrect') ||
          loginErr.message?.includes('not found') ||
          loginErr.message?.includes('401') ||
          loginErr.message?.includes('404')
        ) {
          authResult = await authApi.register(cleanName, cleanEmail, pwd);
        } else {
          throw loginErr;
        }
      }

      if (authResult?.access_token) {
        await AsyncStorage.setItem(
          API_CONFIG.TOKEN_STORAGE_KEY,
          authResult.access_token
        );
        setToken(authResult.access_token);

        const newUser: User = {
          id: authResult.user.id,
          name: authResult.user.name,
          email: authResult.user.email,
          phone: authResult.user.phone,
          avatar: authResult.user.avatar,
          is_admin: authResult.user.is_admin,
        };

        await AsyncStorage.setItem(
          API_CONFIG.USER_STORAGE_KEY,
          JSON.stringify(newUser)
        );
        setUser(newUser);
        return;
      }
    } catch (backendError) {
      console.log('Backend login failed, fallback to local storage:', backendError);
    }

    // Fallback if backend is unreachable
    const localUser: User = {
      name: cleanName,
      email: cleanEmail,
    };

    await AsyncStorage.setItem(
      API_CONFIG.USER_STORAGE_KEY,
      JSON.stringify(localUser)
    );

    setUser(localUser);
  };

  // Register
  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const authResult = await authApi.register(cleanName, cleanEmail, password, phone);
    if (authResult?.access_token) {
      await AsyncStorage.setItem(
        API_CONFIG.TOKEN_STORAGE_KEY,
        authResult.access_token
      );
      setToken(authResult.access_token);

      const newUser: User = {
        id: authResult.user.id,
        name: authResult.user.name,
        email: authResult.user.email,
        phone: authResult.user.phone,
        avatar: authResult.user.avatar,
        is_admin: authResult.user.is_admin,
      };

      await AsyncStorage.setItem(
        API_CONFIG.USER_STORAGE_KEY,
        JSON.stringify(newUser)
      );
      setUser(newUser);
    }
  };

  // Update profile
  const updateProfile = async (
    name: string,
    email: string,
    phone?: string
  ) => {
    if (!user) {
      return;
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Try backend update
    if (token) {
      try {
        const updatedApiUser = await authApi.updateProfile({
          name: cleanName,
          email: cleanEmail,
          phone,
        });

        const updatedUser: User = {
          id: updatedApiUser.id,
          name: updatedApiUser.name,
          email: updatedApiUser.email,
          phone: updatedApiUser.phone,
          avatar: updatedApiUser.avatar,
          is_admin: updatedApiUser.is_admin,
        };

        await AsyncStorage.setItem(
          API_CONFIG.USER_STORAGE_KEY,
          JSON.stringify(updatedUser)
        );
        setUser(updatedUser);
        return;
      } catch (err) {
        console.log('Backend profile update failed, updating local state:', err);
      }
    }

    const updatedUser: User = {
      ...user,
      name: cleanName,
      email: cleanEmail,
      phone: phone || user.phone,
    };

    await AsyncStorage.setItem(
      API_CONFIG.USER_STORAGE_KEY,
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);
  };

  // Logout
  const logout = async () => {
    await AsyncStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem(API_CONFIG.USER_STORAGE_KEY);

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}