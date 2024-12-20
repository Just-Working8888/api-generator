import axios, { AxiosRequestConfig } from 'axios';
import { ApiOptions, ApiResponse, ApiError } from './types';

export function createApi<T>({ baseUrl, endpoints }: ApiOptions<T>) {
  const api: Record<string, Function> = {};
  const axiosInstance = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add response interceptor for consistent error handling
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const apiError: ApiError = {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      };
      return Promise.reject(apiError);
    }
  );

  Object.entries(endpoints).forEach(([key, { method, path }]) => {
    api[key] = async <P = any, R = T>(params?: P, config?: Partial<AxiosRequestConfig>): Promise<ApiResponse<R>> => {
      try {
        const url = path.replace(/:([^/]+)/g, (_, param: string) => {
          if (params && typeof params === 'object' && param in params) {
            const value = params[param as keyof typeof params];
            return String(value);
          }
          return '';
        });

        const requestConfig: AxiosRequestConfig = {
          method,
          url,
          ...(method === 'GET' || method === 'DELETE'
            ? { params }
            : { data: params }),
          ...config,
        };

        const response = await axiosInstance.request<R>(requestConfig);

        return {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
        };
      } catch (error) {
        throw error;
      }
    };
  });

  return api;
}
