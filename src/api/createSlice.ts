import { createSlice, createAsyncThunk, PayloadAction, Draft } from '@reduxjs/toolkit';
import { SliceOptions, ApiError } from './types';

interface GenericState<T> {
  data: T;
  loading: boolean;
  error: ApiError | null;
}

export function createApiSlice<T extends object>({ name, initialState }: SliceOptions<T>) {
  const baseState: GenericState<T> = {
    data: initialState,
    loading: false,
    error: null,
  };

  // Create async thunks
  const fetchData = createAsyncThunk(
    `${name}/fetchData`,
    async (api: () => Promise<T>, { rejectWithValue }) => {
      try {
        return await api();
      } catch (error: any) {
        return rejectWithValue(error);
      }
    }
  );

  const updateData = createAsyncThunk(
    `${name}/updateData`,
    async ({ api, data }: { api: (data: Partial<T>) => Promise<T>; data: Partial<T> }, { rejectWithValue }) => {
      try {
        return await api(data);
      } catch (error: any) {
        return rejectWithValue(error);
      }
    }
  );

  const slice = createSlice({
    name,
    initialState: baseState,
    reducers: {
      setData: (state, action: PayloadAction<T>) => {
        state.data = action.payload as Draft<T>;
      },
      clearError: (state) => {
        state.error = null;
      },
      reset: (state) => {
        state.data = initialState as Draft<T>;
        state.loading = false;
        state.error = null;
      },
    },
    extraReducers: (builder) => {
      // Handle fetchData
      builder
        .addCase(fetchData.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchData.fulfilled, (state, action) => {
          state.loading = false;
          state.data = action.payload as Draft<T>;
        })
        .addCase(fetchData.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as ApiError;
        });

      // Handle updateData
      builder
        .addCase(updateData.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(updateData.fulfilled, (state, action) => {
          state.loading = false;
          state.data = action.payload as Draft<T>;
        })
        .addCase(updateData.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as ApiError;
        });
    },
  });

  return {
    reducer: slice.reducer,
    actions: {
      ...slice.actions,
      fetchData,
      updateData,
    },
  };
}
