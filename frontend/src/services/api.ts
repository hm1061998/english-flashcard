import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

// Define the standard response structure from backend
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:3000/api";

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    this.initializeInterceptors();
  }

  private initializeInterceptors() {
    // Request Interceptor
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("token");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response Interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // Return only the data part of our standard ApiResponse
        return response.data.data;
      },
      (error) => {
        const message = error.response?.data?.message || "Something went wrong";
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          if (window.location.pathname.includes("/admin")) {
            window.location.href = "/admin/login";
          }
        }
        return Promise.reject(message);
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
