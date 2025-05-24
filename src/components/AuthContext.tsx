import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

type AxiosError<T = any> = {
  isAxiosError: boolean;
  name: string;
  message: string;
  config: any;
  code?: string;
  request?: any;
  response?: {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: any;
  };
  toJSON: () => object;
};

function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as any).isAxiosError === true
  );
}

interface User {
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
          // @ts-ignore
          signal: controller.signal,
        };

        const res = await axios.get<User>('http://localhost:8000/api/auth/me', config);
        setUser(res.data);
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          if (err.name === 'CanceledError') {
            // request cancelled
          } else {
            console.error('Failed to fetch user', err);
            logout();
          }
        } else {
          console.error('Unexpected error', err);
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    return () => controller.abort();
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setLoading(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
