import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('petshop_token');
    const storedUser = localStorage.getItem('petshop_user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  function loginSuccess(user, token) {
    localStorage.setItem('petshop_token', token);
    localStorage.setItem('petshop_user', JSON.stringify(user));
    setUser(user);
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    loginSuccess(data.user, data.token);
    return data.user;
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);
    loginSuccess(data.user, data.token);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('petshop_token');
    localStorage.removeItem('petshop_user');
    setUser(null);
  }

  function updateStoredUser(updated) {
    localStorage.setItem('petshop_user', JSON.stringify(updated));
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateStoredUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function dashboardPathForRole(role) {
  if (role === 'ADMINISTRADOR') return '/admin';
  if (role === 'VETERINARIO') return '/vet';
  return '/cliente';
}
