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
export const addTable = (data) => api.post("/api/table", data);
export const deleteTable = (tableId) =>
  api.delete(`/api/table/delete/${tableId}`);

// Order Endpoints
export const addOrder = (data) => api.post("/api/order", data);
export const getOrders = () => api.get("/api/order");
export const getRecentOrders = () => api.get("/api/order/recentOrders");
export const updateOrderStatus = ({ orderId, orderStatus }) =>
  api.put(`/api/order/${orderId}`, { orderStatus });
export const getOrderEarning = (data) => api.post(`/api/order/earnings`, data);
export const getOrdersCount = (data) => api.post(`/api/order/count`, data);
export const getfindOrders = (data) => api.post(`/api/order/findOrders`, data);
export const exportIncomeRecord = async (type) => {
  const response = await api.get(`/api/report/income/${type}`, {
    responseType: "blob", //This tells axios to expect binary data
  });

  return response;
};

// category Endpoints
export const addCategory = (data) => api.post("/api/category", data);
export const getCategories = () => api.get("/api/category");
export const deleteCategory = (categoryId) =>
  api.delete(`/api/category/delete/${categoryId}`);
export const updateCategory = ({ categoryId, ...categoryData }) =>
  api.put(`/api/category/${categoryId}`, categoryData);

// product Endpoints
export const addProduct = (data) => api.post("/api/product", data);
export const deleteProduct = (productId) =>
  api.delete(`/api/product/delete/${productId}`);
export const updateProduct = ({ productId, ...productData }) =>
  api.put(`/api/product/${productId}`, productData);
export const searchProduct = (data) => api.post(`/api/product/search`, data);

// dashboard Endpoints
export const getDashboardItemsData = () =>
  api.get("/api/dashboard/item-details");
export const getWeeklyData = () => api.get("/api/dashboard/getWeeklyData");
export const getBestSellingProducts = (period) =>
  api.get(`/api/dashboard/best-selling`, { params: { period } });

// Expenses Record Endpoints
export const getExpenseRecords = () => api.get("/api/expenses");
export const addExpenseRecord = (data) => api.post("/api/expenses", data);
export const deleteExpenseRecord = (recordId) =>
  api.delete(`/api/expenses/delete/${recordId}`);
export const updateExpenseRecord = ({ recordId, ...recordData }) =>
  api.put(`/api/expenses/${recordId}`, recordData);
export const searchExpenseRecord = (query) =>
  api.get(`/api/expenses/search`, { params: { query } });
export const exportExpenseRecord = async (type) => {
  const response = await api.get(`/api/report/expenses/${type}`, {
    responseType: "blob", //This tells axios to expect binary data
  });

  return response;
};

export const getTotalExpenses = (data) =>
  api.post(`/api/expenses/totalExpenses`, data);

// //print invoice endpoit
// export const printInvoice = (data) =>
//   api
//     .post(`/api/print`, data, {
//       responseType: "blob", // Tell axios to expect a PDF blob
//     })
//     .then((response) => response.data); // Return just the blob

// Print server URL (local computer with printer)
const PRINT_SERVER_URL =
  import.meta.env.VITE_PRINT_SERVER_URL || "http://192.168.1.100:3001";

// Modified printInvoice function
export const printInvoice = async (data) => {
  try {
    // Get PDF from your backend
    const response = await api.post(`/api/print`, data, {
      responseType: "blob",
    });

    const pdfBlob = response.data;

    // Convert blob to base64
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    // Send to print server
    const printResponse = await fetch(`${PRINT_SERVER_URL}/print`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pdfBase64: base64,
        printerName: "XP-80C", // Your printer name (optional)
      }),
    });

    if (!printResponse.ok) {
      throw new Error("Print server request failed");
    }

    const result = await printResponse.json();
    return result;
  } catch (error) {
    console.error("Print error:", error);
    throw error;
  }
};
