export interface ApiOptions<T> {
  baseUrl: string;
  endpoints: {
    [key: string]: {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      path: string;
    };
  };
}

export interface SliceOptions<T> {
  name: string;
  initialState: T;
}

export interface EndpointConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}
