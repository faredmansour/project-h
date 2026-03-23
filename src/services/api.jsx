import axios from "axios";
import { mockProducts, mockCategories } from "../data/mockData";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (name, email, password) =>
    api.post("/api/auth/register", { name, email, password }).catch(() => {
      // Mock: simulate successful registration
      const mockUser = { id: Date.now(), name, email };
      const mockToken = "mock-token-" + Date.now();
      return { data: { token: mockToken, user: mockUser } };
    }),
  login: (email, password) =>
    api.post("/api/auth/login", { email, password }).catch(() => {
      // Mock: simulate successful login
      const mockUser = { id: 1, name: "User", email };
      const mockToken = "mock-token-" + Date.now();
      return { data: { token: mockToken, user: mockUser } };
    }),
  getMe: () => api.get("/api/auth/me"),
};

// Products (with mock fallback)
export const productsAPI = {
  getAll: (category, search) =>
    api.get("/api/products", { params: { category, search } }).catch(() => {
      let filtered = [...mockProducts];
      if (category) {
        filtered = filtered.filter((p) => p.category === category);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
      }
      return { data: filtered };
    }),
  getById: (id) =>
    api.get(`/api/products/${id}`).catch(() => {
      const product = mockProducts.find((p) => p.id === id);
      if (product) return { data: product };
      return Promise.reject(new Error("Product not found"));
    }),
};

// Categories (with mock fallback)
export const categoriesAPI = {
  getAll: () =>
    api.get("/api/categories").catch(() => {
      return { data: mockCategories };
    }),
};

// Cart (mock in-memory)
let mockCart = [];

export const cartAPI = {
  getAll: () =>
    api.get("/api/cart").catch(() => {
      return { data: mockCart };
    }),
  add: (productId, quantity = 1) =>
    api.post("/api/cart", { product_id: productId, quantity }).catch(() => {
      const product = mockProducts.find((p) => p.id === productId);
      if (product) {
        const existing = mockCart.find((item) => item.product_id === productId);
        if (existing) {
          existing.quantity += quantity;
        } else {
          mockCart.push({
            id: Date.now(),
            product_id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity,
          });
        }
      }
      return { data: { success: true } };
    }),
  update: (itemId, quantity) =>
    api.put(`/api/cart/${itemId}`, { quantity }).catch(() => {
      mockCart = mockCart.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      return { data: { success: true } };
    }),
  remove: (itemId) =>
    api.delete(`/api/cart/${itemId}`).catch(() => {
      mockCart = mockCart.filter((item) => item.id !== itemId);
      return { data: { success: true } };
    }),
};

// Wishlist (mock in-memory)
let mockWishlist = [];

export const wishlistAPI = {
  getAll: () =>
    api.get("/api/wishlist").catch(() => {
      return { data: mockWishlist };
    }),
  toggle: (productId) =>
    api.post(`/api/wishlist/${productId}`).catch(() => {
      const idx = mockWishlist.findIndex((item) => item.product_id === productId);
      if (idx >= 0) {
        mockWishlist.splice(idx, 1);
        return { data: { added: false } };
      } else {
        const product = mockProducts.find((p) => p.id === productId);
        if (product) {
          mockWishlist.push({
            id: Date.now(),
            product_id: product.id,
            name: product.name,
            price: product.price,
            original_price: product.original_price,
            image: product.image,
            category: product.category,
          });
        }
        return { data: { added: true } };
      }
    }),
};

export default api;
