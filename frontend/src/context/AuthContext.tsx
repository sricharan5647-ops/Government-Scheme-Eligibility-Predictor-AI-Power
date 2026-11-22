import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  role: string | null;
  email: string | null;
  isAuthenticated: boolean;
  login: (token: string, role: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('schemesathi_admin_token'));
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('schemesathi_admin_role'));
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem('schemesathi_admin_email'));

  const login = (newToken: string, newRole: string, newEmail: string) => {
    setToken(newToken);
    setRole(newRole);
    setEmail(newEmail);
    localStorage.setItem('schemesathi_admin_token', newToken);
    localStorage.setItem('schemesathi_admin_role', newRole);
    localStorage.setItem('schemesathi_admin_email', newEmail);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setEmail(null);
    localStorage.removeItem('schemesathi_admin_token');
    localStorage.removeItem('schemesathi_admin_role');
    localStorage.removeItem('schemesathi_admin_email');
  };

  return (
    <AuthContext.Provider value={{ token, role, email, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
