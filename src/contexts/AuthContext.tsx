import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface AuthUser {
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (email: string, password: string, confirmPassword: string) => { success: boolean; error?: string };
  logout: () => void;
  resetPassword: (email: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  const login = useCallback((email: string, password: string) => {
    if (!email.trim() || !password.trim()) return { success: false, error: 'Preencha todos os campos' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: false, error: 'Email inválido' };
    if (password.length < 6) return { success: false, error: 'Senha deve ter pelo menos 6 caracteres' };
    setUser({ email: email.trim() });
    return { success: true };
  }, []);

  const signup = useCallback((email: string, password: string, confirmPassword: string) => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) return { success: false, error: 'Preencha todos os campos' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: false, error: 'Email inválido' };
    if (password.length < 6) return { success: false, error: 'Senha deve ter pelo menos 6 caracteres' };
    if (password !== confirmPassword) return { success: false, error: 'As senhas não coincidem' };
    setUser({ email: email.trim() });
    return { success: true };
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const resetPassword = useCallback((email: string) => {
    if (!email.trim()) return { success: false, error: 'Informe seu email' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: false, error: 'Email inválido' };
    return { success: true };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
