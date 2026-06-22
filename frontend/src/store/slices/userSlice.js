import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../apiClient';

const initialState = {
  users: [],
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient('/users');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch users');
    }
  }
);

export const changeUserRole = createAsyncThunk(
  'users/changeRole',
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const response = await apiClient(`/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update user role');
    }
  }
);

export const removeUser = createAsyncThunk(
  'users/remove',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient(`/users/${id}`, {
        method: 'DELETE',
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete user');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsersState: (state) => {
      state.users = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Change Role
      .addCase(changeUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeUserRole.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload.data;
        state.users = state.users.map((u) => 
          u._id === updatedUser.id ? { ...u, role: updatedUser.role } : u
        );
      })
      .addCase(changeUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove User
      .addCase(removeUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        state.users = state.users.filter((u) => u._id !== id);
      })
      .addCase(removeUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUsersState } = userSlice.actions;
export default userSlice.reducer;
