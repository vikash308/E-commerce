import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../apiClient';

const initialState = {
  products: [],
  product: null,
  categories: [],
  totalProducts: 0,
  page: 1,
  pages: 1,
  filters: {
    keyword: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt',
  },
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { products: productState } = getState();
      const { filters, page } = productState;
      
      const queryParams = new URLSearchParams();
      if (filters.keyword) queryParams.append('keyword', filters.keyword);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.sort) queryParams.append('sort', filters.sort);
      queryParams.append('page', page);
      queryParams.append('limit', 12);

      const response = await apiClient(`/products?${queryParams.toString()}`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchDetails',
  async (idOrSlug, { rejectWithValue }) => {
    try {
      const response = await apiClient(`/products/${idOrSlug}`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch product details');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient('/categories');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch categories');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiClient('/products', {
        method: 'POST',
        body: formData,
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await apiClient(`/products/${id}`, {
        method: 'PUT',
        body: formData,
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient(`/products/${id}`, {
        method: 'DELETE',
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete product');
    }
  }
);

export const createCategory = createAsyncThunk(
  'products/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await apiClient('/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'products/updateCategory',
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const response = await apiClient(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData),
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'products/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient(`/categories/${id}`, {
        method: 'DELETE',
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete category');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // Reset page when filters change
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.page = 1;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    clearProductDetails: (state) => {
      state.product = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.totalProducts = action.payload.totalProducts;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Product Details
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload.data;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload.data;
      })

      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload.data);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data;
        state.products = state.products.map(p => p._id === updated._id ? updated : p);
        if (state.product && state.product._id === updated._id) {
          state.product = updated;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        state.products = state.products.filter(p => p._id !== id);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Category
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.unshift(action.payload.data);
      })

      // Update Category
      .addCase(updateCategory.fulfilled, (state, action) => {
        const updated = action.payload.data;
        state.categories = state.categories.map(c => c._id === updated._id ? updated : c);
      })

      // Delete Category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        const id = action.payload;
        state.categories = state.categories.filter(c => c._id !== id);
      });
  },
});

export const { setFilter, clearFilters, setPage, clearProductDetails } = productSlice.actions;
export default productSlice.reducer;
