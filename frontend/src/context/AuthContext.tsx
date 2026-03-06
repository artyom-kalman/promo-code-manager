import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import api from '../lib/axios';
import { getAccessToken, setTokens, clearTokens } from '../lib/token';
import { showErrorNotification } from '../lib/error';
import type { User, AuthTokens, LoginDto, RegisterDto } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get<User>('/auth/me');
      return data;
    },
    enabled: !!getAccessToken(),
    retry: false,
  });

  const login = useCallback(
    async (dto: LoginDto) => {
      try {
        const { data } = await api.post<AuthTokens>('/auth/login', dto);
        setTokens(data.accessToken, data.refreshToken);
        await queryClient.fetchQuery({
          queryKey: ['auth', 'me'],
          queryFn: async () => {
            const { data } = await api.get<User>('/auth/me');
            return data;
          },
        });
        notifications.show({
          title: 'Success',
          message: 'Logged in successfully',
          color: 'green',
        });
      } catch (error) {
        showErrorNotification(error);
        throw error;
      }
    },
    [queryClient],
  );

  const register = useCallback(
    async (dto: RegisterDto) => {
      try {
        const { data } = await api.post<AuthTokens>('/auth/register', dto);
        setTokens(data.accessToken, data.refreshToken);
        await queryClient.fetchQuery({
          queryKey: ['auth', 'me'],
          queryFn: async () => {
            const { data } = await api.get<User>('/auth/me');
            return data;
          },
        });
        notifications.show({
          title: 'Success',
          message: 'Account created successfully',
          color: 'green',
        });
      } catch (error) {
        showErrorNotification(error);
        throw error;
      }
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    clearTokens();
    queryClient.setQueryData(['auth', 'me'], null);
    queryClient.clear();
    notifications.show({
      title: 'Info',
      message: 'Logged out',
      color: 'blue',
    });
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
