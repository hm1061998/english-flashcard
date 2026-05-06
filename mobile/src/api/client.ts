import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from 'expo-secure-store';

// Define the standard response structure from backend
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}

import Constants from 'expo-constants';

// Lấy apiUrl từ app.config.ts (đã được nạp từ .env)
const configApiUrl = Constants.expoConfig?.extra?.apiUrl;
const rawApiUrl = configApiUrl || process.env.EXPO_PUBLIC_API_URL;

const API_BASE_URL = rawApiUrl ? `${rawApiUrl}/api` : "http://localhost:3000/api";

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    this.initializeInterceptors();
  }

  private initializeInterceptors() {
    // Request Interceptor
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        try {
          const token = await SecureStore.getItemAsync('auth_token');
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (e) {
          console.log('Error getting token from SecureStore');
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response Interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // Return only the data part of our standard ApiResponse (consistent with frontend)
        return response.data.data;
      },
      async (error) => {
        const message = error.response?.data?.message || "Something went wrong";
        
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          try {
            await SecureStore.deleteItemAsync('auth_token');
            // Note: In mobile, navigation is handled via router or state
            // We can't easily redirect from here without a global router reference
          } catch (e) {
            console.log('Error deleting token');
          }
        }
        
        return Promise.reject(error); // Keep the error object for more context if needed
      },
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<any, T>(url, config);
    return response;
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.post<any, T>(url, data, config);
    return response;
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.put<any, T>(url, data, config);
    return response;
  }

  public async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.patch<any, T>(url, data, config);
    return response;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<any, T>(url, config);
    return response;
  }
}

export const apiService = new ApiService();
export default apiService;
