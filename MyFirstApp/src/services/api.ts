import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api.config';
import { Product } from '../data/products';

// ================= TYPES =================

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  is_admin?: boolean;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: ApiUser;
};

export type ApiAddress = {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  created_at?: string;
};

export type ApiOrderItem = {
  id?: string;
  product_id?: string;
  name: string;
  price: string;
  category?: string;
  image: string;
  quantity: number;
};

export type ApiOrder = {
  id: string;
  order_number?: string;
  date: string;
  status: 'Placed' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  subtotal: number;
  delivery: number;
  total: number;
  paymentMethod: 'Cash on Delivery' | 'UPI' | 'Card';
  payment_status?: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  items: ApiOrderItem[];
  created_at?: string;
};

export type ApiCartResponse = {
  items: {
    id: string;
    product_id: string;
    quantity: number;
    product: Product;
  }[];
  cart_count: number;
  total_price: number;
};

export type ProductListResponse = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

// ================= HTTP CLIENT =================

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      API_CONFIG.TIMEOUT_MS
    );

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      let data: any;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { message: responseText };
      }

      if (!response.ok) {
        const errorMsg =
          data?.detail ||
          data?.message ||
          `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      return data as T;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Network request timed out. Please check backend connection.');
      }
      throw error;
    }
  }
}

export const apiClient = new ApiClient(API_CONFIG.BASE_URL);

// ================= API ENDPOINTS =================

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return apiClient.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<AuthResponse> => {
    return apiClient.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    });
  },

  getMe: async (): Promise<ApiUser> => {
    return apiClient.request<ApiUser>('/auth/me');
  },

  updateProfile: async (data: {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
  }): Promise<ApiUser> => {
    return apiClient.request<ApiUser>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

export const productsApi = {
  getAll: async (params?: {
    category?: string;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<ProductListResponse> => {
    const queryParts: string[] = [];
    if (params?.category && params.category !== 'All') {
      queryParts.push(`category=${encodeURIComponent(params.category)}`);
    }
    if (params?.search) {
      queryParts.push(`search=${encodeURIComponent(params.search)}`);
    }
    if (params?.sort) {
      queryParts.push(`sort=${encodeURIComponent(params.sort)}`);
    }
    if (params?.page) {
      queryParts.push(`page=${params.page}`);
    }
    if (params?.limit) {
      queryParts.push(`limit=${params.limit}`);
    }

    const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return apiClient.request<ProductListResponse>(`/products${query}`);
  },

  getById: async (id: string): Promise<Product> => {
    return apiClient.request<Product>(`/products/${id}`);
  },

  addReview: async (
    productId: string,
    data: { userName: string; rating: number; comment: string }
  ): Promise<any> => {
    return apiClient.request(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const categoriesApi = {
  getAll: async (): Promise<{ id: string; name: string; product_count: number }[]> => {
    return apiClient.request('/categories');
  },
};

export const cartApi = {
  getCart: async (): Promise<ApiCartResponse> => {
    return apiClient.request<ApiCartResponse>('/cart');
  },

  addItem: async (productId: string, quantity: number = 1): Promise<ApiCartResponse> => {
    return apiClient.request<ApiCartResponse>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },

  updateItem: async (productId: string, quantity: number): Promise<ApiCartResponse> => {
    return apiClient.request<ApiCartResponse>(`/cart/items/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  },

  removeItem: async (productId: string): Promise<ApiCartResponse> => {
    return apiClient.request<ApiCartResponse>(`/cart/items/${productId}`, {
      method: 'DELETE',
    });
  },

  clearCart: async (): Promise<ApiCartResponse> => {
    return apiClient.request<ApiCartResponse>('/cart', {
      method: 'DELETE',
    });
  },
};

export const wishlistApi = {
  getWishlist: async (): Promise<{ items: Product[]; count: number }> => {
    return apiClient.request<{ items: Product[]; count: number }>('/wishlist');
  },

  toggleWishlist: async (productId: string): Promise<{ items: Product[]; count: number }> => {
    return apiClient.request<{ items: Product[]; count: number }>(`/wishlist/${productId}`, {
      method: 'POST',
    });
  },

  removeFromWishlist: async (productId: string): Promise<{ items: Product[]; count: number }> => {
    return apiClient.request<{ items: Product[]; count: number }>(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  },

  checkInWishlist: async (productId: string): Promise<{ in_wishlist: boolean }> => {
    return apiClient.request<{ in_wishlist: boolean }>(`/wishlist/check/${productId}`);
  },
};

export const ordersApi = {
  getAll: async (): Promise<ApiOrder[]> => {
    return apiClient.request<ApiOrder[]>('/orders');
  },

  getById: async (id: string): Promise<ApiOrder> => {
    return apiClient.request<ApiOrder>(`/orders/${id}`);
  },

  create: async (data: {
    items: ApiOrderItem[];
    subtotal: number;
    delivery: number;
    total: number;
    paymentMethod: string;
    customer: {
      name: string;
      phone: string;
      address: string;
      city: string;
      pincode: string;
    };
  }): Promise<ApiOrder> => {
    return apiClient.request<ApiOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (id: string, status: string): Promise<ApiOrder> => {
    return apiClient.request<ApiOrder>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

export const addressesApi = {
  getAll: async (): Promise<ApiAddress[]> => {
    return apiClient.request<ApiAddress[]>('/addresses');
  },

  create: async (data: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
  }): Promise<ApiAddress> => {
    return apiClient.request<ApiAddress>('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: Partial<{
      fullName: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      isDefault: boolean;
    }>
  ): Promise<ApiAddress> => {
    return apiClient.request<ApiAddress>(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.request<{ message: string }>(`/addresses/${id}`, {
      method: 'DELETE',
    });
  },

  setDefault: async (id: string): Promise<ApiAddress> => {
    return apiClient.request<ApiAddress>(`/addresses/${id}/default`, {
      method: 'PATCH',
    });
  },
};

export const healthApi = {
  check: async (): Promise<{ status: string; database: string; version: string }> => {
    // Health check is at root /health
    const rootUrl = API_CONFIG.BASE_URL.replace(/\/api\/?$/, '');
    const response = await fetch(`${rootUrl}/health`);
    if (!response.ok) throw new Error('Backend health check failed');
    return response.json();
  },
};
