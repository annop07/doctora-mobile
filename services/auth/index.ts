import { apiClient } from '../api/client';
import { LoginRequest, RegisterRequest, AuthResponse, User, MessageResponse } from '@/types';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  }

  async logout(): Promise<MessageResponse> {
    try {
      const response = await apiClient.post<MessageResponse>('/auth/logout');
      return response.data;
    } catch (error) {
      console.warn('Logout API call failed, but continuing with local cleanup:', error);
      return { message: 'Logged out locally' };
    }
  }
}

export const authService = new AuthService();
