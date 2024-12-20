import { createApi, fetchBaseQuery, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { ApiOptions, ApiError } from './types';

export function createApiWithHooks<T>({ baseUrl, endpoints }: ApiOptions<T>) {
  return createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ 
      baseUrl,
      prepareHeaders: (headers) => {
        headers.set('Content-Type', 'application/json');
        return headers;
      },
    }) as BaseQueryFn,
    endpoints: (builder) => {
      const apiEndpoints: Record<string, any> = {};

      Object.entries(endpoints).forEach(([key, { method, path }]) => {
        if (method === 'GET') {
          apiEndpoints[`get${key.charAt(0).toUpperCase()}${key.slice(1)}`] = builder.query({
            query: (params?: Record<string, any>) => ({
              url: path.replace(/:([^/]+)/g, (_, param) => params?.[param] || ''),
              method,
              params: params,
            }),
          });
        } else {
          apiEndpoints[`${method.toLowerCase()}${key.charAt(0).toUpperCase()}${key.slice(1)}`] = builder.mutation({
            query: (body?: any) => ({
              url: path.replace(/:([^/]+)/g, (_, param) => body?.[param] || ''),
              method,
              body,
            }),
          });
        }
      });

      return apiEndpoints;
    },
    tagTypes: ['ApiData'],
  });
}
