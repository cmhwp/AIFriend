export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888';

interface ApiResponse<T = unknown> {
  code?: number;
  message?: string;
  data?: T;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const accessToken = this.getAccessToken();
    if (accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '请求失败');
    }

    return data;
  }

  // 认证相关
  async register(username: string, password: string, email?: string) {
    return this.request<ApiResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email }),
    });
  }

  async login(username: string, password: string) {
    const response = await this.request<ApiResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.access_token && response.refresh_token) {
      this.setTokens(response.access_token, response.refresh_token);
    }

    return response;
  }

  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await this.request<ApiResponse>('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.access_token && response.refresh_token) {
      this.setTokens(response.access_token, response.refresh_token);
    }

    return response;
  }

  logout() {
    this.clearTokens();
  }

  // 用户相关
  async getUserInfo() {
    return this.request<{
      id: number;
      username: string;
      email: string;
      avatar: string;
      created_at: string;
    }>('/api/v1/user/info');
  }

  async updateUserInfo(data: { username?: string; email?: string; avatar?: string }) {
    return this.request<ApiResponse>('/api/v1/user/info', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(oldPassword: string, newPassword: string) {
    return this.request<ApiResponse>('/api/v1/user/password', {
      method: 'POST',
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
  }

  async uploadAvatar(file: File) {
    const url = `${this.baseUrl}/api/v1/user/avatar`;
    const formData = new FormData();
    formData.append('avatar', file);

    const headers: HeadersInit = {};
    const accessToken = this.getAccessToken();
    if (accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '上传失败');
    }

    return data as ApiResponse;
  }

  // 角色相关
  async createCharacter(data: { name: string; profile?: string; photo?: File; background_image?: File }) {
    const url = `${this.baseUrl}/api/v1/character`;
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.profile) {
      formData.append('profile', data.profile);
    }
    if (data.photo) {
      formData.append('photo', data.photo);
    }
    if (data.background_image) {
      formData.append('background_image', data.background_image);
    }

    const headers: HeadersInit = {};
    const accessToken = this.getAccessToken();
    if (accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || '创建角色失败');
    }

    return responseData as ApiResponse;
  }

  async getCharacterList() {
    return this.request<ApiResponse>('/api/v1/character/list');
  }

  async getCharacter(id: number) {
    return this.request<ApiResponse>(`/api/v1/character/${id}`);
  }

  async updateCharacter(id: number, data: { name?: string; profile?: string; photo?: File; background_image?: File }) {
    const url = `${this.baseUrl}/api/v1/character/${id}`;
    const formData = new FormData();
    if (data.name) {
      formData.append('name', data.name);
    }
    if (data.profile !== undefined) {
      formData.append('profile', data.profile);
    }
    if (data.photo) {
      formData.append('photo', data.photo);
    }
    if (data.background_image) {
      formData.append('background_image', data.background_image);
    }

    const headers: HeadersInit = {};
    const accessToken = this.getAccessToken();
    if (accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || '更新角色失败');
    }

    return responseData as ApiResponse;
  }

  async removeCharacter(id: number) {
    return this.request<ApiResponse>(`/api/v1/character/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
