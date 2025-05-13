import axios from "axios";

//api instance for making requests to the backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

//api endpoints for making requests to the backend

// Auth Endpoints
export const login = (data) => api.post("/api/user/login", data);
export const register = (data) => api.post("/api/user/register", data);
export const getUserData = () => api.get("/api/user");
export const logout = () => api.post("/api/user/logout");

// Table Endpoints
export const updateTable = ({ tableId, ...tableData }) =>
  api.put(`/api/table/${tableId}`, tableData);
export const getTables = () => api.get("/api/table");

// Order Endpoints
export const addOrder = (data) => api.post("/api/order", data);
export const getOrders = () => api.get("/api/order");
export const updateOrderStatus = ({ orderId, orderStatus }) =>
  api.put(`/api/order/${orderId}`, { orderStatus });
export const orderEarning = ({ period }) =>
  api.get(`/api/order/earnings?period=${period}`);

// category Endpoints
export const addCategory = (data) => api.post("/api/category", data);
export const getCategories = () => api.get("/api/category");

// product Endpoints
export const addProduct = (data) => api.post("/api/product", data);
export const getProducts = () => api.get("/api/product");
