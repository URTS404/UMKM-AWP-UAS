const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

class ApiClient {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    });
    return response.json();
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: data ? JSON.stringify(data) : undefined
    });
    return response.json();
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: data ? JSON.stringify(data) : undefined
    });
    return response.json();
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    });
    return response.json();
  }

  async uploadFile<T = any>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('image', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader()
      },
      body: formData
    });
    return response.json();
  }
}

export const api = new ApiClient();

// Auth API
export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (email: string, password: string, name: string) => api.post('/auth/register', { email, password, name }),
  getProfile: () => api.get('/auth/profile')
};

// Products API
export const productsAPI = {
  getAll: (params?: { type?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.search) queryParams.append('search', params.search);
    return api.get(`/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  },
  getById: (id: number) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: number, data: any) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`)
};

// Orders API
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id: number) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: number, status: string) => api.put(`/orders/${id}/status`, { status }),
  getMyOrders: () => api.get('/orders/user/my-orders')
};

// Finance API
export const financeAPI = {
  getAll: (params?: { type?: string; start_date?: string; end_date?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    return api.get(`/finance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  },
  create: (data: { type: 'income' | 'expense'; description?: string; amount: number }) => api.post('/finance', data),
  getSummary: (params?: { start_date?: string; end_date?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    return api.get(`/finance/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  },
  delete: (id: number) => api.delete(`/finance/${id}`)
};

// Unboxing API
export const unboxingAPI = {
  getAll: () => api.get('/unboxing'),
  upload: (file: File, caption?: string) => api.uploadFile('/unboxing/upload', file, { caption, type: 'unboxing' }),
  delete: (id: number) => api.delete(`/unboxing/${id}`)
};

// Invoices API
export const invoicesAPI = {
  getAll: () => api.get('/invoices'),
  getById: (id: number) => api.get(`/invoices/${id}`),
  generate: (order_id: number, customer_phone: string) => api.post('/invoices/generate', { order_id, customer_phone }),
  updateWhatsAppLink: (id: number, customer_phone: string) => api.put(`/invoices/${id}/whatsapp-link`, { customer_phone })
};