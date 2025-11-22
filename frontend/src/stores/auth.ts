import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authService, type LoginData, type RegisterData, type User } from '@/services/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(authService.getUser());
  const isAuthenticated = ref(authService.isAuthenticated());
  const loading = ref(false);
  const error = ref<string | null>(null);

  const login = async (credentials: LoginData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await authService.login(credentials);
      authService.saveToken(data.jwt);
      authService.saveUser(data.user);
      
      user.value = data.user;
      isAuthenticated.value = true;
      
      return data;
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Ошибка входа';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const register = async (userData: RegisterData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await authService.register(userData);
      authService.saveToken(data.jwt);
      authService.saveUser(data.user);
      
      user.value = data.user;
      isAuthenticated.value = true;
      
      return data;
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Ошибка регистрации';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    authService.logout();
    user.value = null;
    isAuthenticated.value = false;
    error.value = null;
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    clearError
  };
});