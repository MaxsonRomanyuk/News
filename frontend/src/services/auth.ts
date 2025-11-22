import api from './api';

export interface LoginData {
  identifier: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export const authService = {
  async login(credentials: LoginData) {
    const response = await api.post('/auth/local', credentials);
    return response.data;
  },

  async register(userData: RegisterData) {
    const response = await api.post('/auth/local/register', userData);
    return response.data;
  },

  async getMe() {
    const response = await api.get('/users/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  },

  saveToken(jwt: string) {
    localStorage.setItem('jwt', jwt);
  },

  getToken(): string | null {
    return localStorage.getItem('jwt');
  },

  saveUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};