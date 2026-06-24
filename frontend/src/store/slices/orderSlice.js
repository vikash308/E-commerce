import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../apiClient';

const initialState = {
  orders: [],
  orderDetails: null,
  loading: false,
  error: null,
  success: false,
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient('/orders');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await apiClient('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to place order');
    }
  }
);

export const payOrder = createAsyncThunk(
  'orders/pay',
  async ({ id, paymentDetails }, { rejectWithValue }) => {
    try {
      const response = await apiClient(`/orders/${id}/pay`, {
        method: 'PUT',
        body: JSON.stringify({ paymentDetails }),
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to complete payment');
    }
  }
);


export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient(`/orders/${id}`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch order details');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient(`/orders/${id}/cancel`, {
        method: 'PUT',
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to cancel order');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await apiClient(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update order status');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.success = false;
      state.error = null;
    },
    clearOrdersState: (state) => {
      state.orders = [];
      state.orderDetails = null;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.orders.unshift(action.payload.data);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Pay Order
      .addCase(payOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(payOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const paidOrder = action.payload.data;
        // Update in list
        state.orders = state.orders.map((o) =>
          o._id === paidOrder._id ? paidOrder : o
        );
        // Update in details
        if (state.orderDetails && state.orderDetails._id === paidOrder._id) {
          state.orderDetails = paidOrder;
        }
      })
      .addCase(payOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })


      // Fetch Order Details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        const cancelledOrder = action.payload.data;
        // Update in list
        state.orders = state.orders.map((o) =>
          o._id === cancelledOrder._id ? cancelledOrder : o
        );
        // Update in details
        if (state.orderDetails && state.orderDetails._id === cancelledOrder._id) {
          state.orderDetails = cancelledOrder;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload.data;
        state.orders = state.orders.map((o) =>
          o._id === updatedOrder._id ? updatedOrder : o
        );
        if (state.orderDetails && state.orderDetails._id === updatedOrder._id) {
          state.orderDetails = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetOrderState, clearOrdersState } = orderSlice.actions;
export default orderSlice.reducer;
