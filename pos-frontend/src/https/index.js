import api from "./axiosWrapper";
import { downloadFile } from "../utils/download";


// API Endpoints
export const login = (data) => api.post("/api/user/login", data);
export const register = async (data) => {
  const response = await api.post("/api/user/register", data);
  return response.data;
};

export const getUserData = () => api.get("/api/user");
export const logout = () => api.post("/api/user/logout");
// Auth Endpoints


// Table Endpoints
export const addTable = (data) => api.post("/api/table/", data);
export const getTables = () => api.get("/api/table");
export const updateTable = (id, tableData) => api.put(`/api/table/${id}`, tableData);

export const deleteTable = (id) => api.delete(`/api/table/${id}`);



// category
export const addCategory = (categoryData) => {
  return api.post("/api/category", categoryData);
};
export const getCategories = async () => {
  const res = await api.get("/api/category");
  return res.data?.data;
};
export const deleteCategory = (id) => api.delete(`/api/category/${id}`);
export const updateCategory = (id, categoryData) => api.put(`/api/category/${id}`, categoryData);


// dish
export const addDish = async (dishData) => {
  return api.post("/api/dish", dishData);
};
export const getDishes = async () => {
  const res = await api.get("/api/dish");
  console.log("Respon dari /api/dish:", res.data);
  return res.data?.data || [];
};
export const updateDish = (id, dishData) => api.put(`/api/dish/${id}`, dishData);
export const deleteDish = (id) => api.delete(`/api/dish/${id}`);

// Dish BOM Endpoints
export const getDishBOMs = (dishId) => api.get(`/api/dish-bom/${dishId}`);
export const addDishBOM = (dishId, data) => api.post(`/api/dish-bom/${dishId}`, data);
export const updateDishBOM = (id, data) => api.put(`/api/dish-bom/${id}`, data);
export const deleteDishBOM = (id) => api.delete(`/api/dish-bom/${id}`);


// Ambil ringkasan data dashboard
// Dashboard Metrics API
export const getDashboardMetrics = async (range = "month") => {
  const res = await api.get(`/api/metrics?range=${range}`);
  return res.data.data;
};








// Payment Endpoints
export const getPayments = () => api.get("/api/payments");
// Delete single payment
export const deletePayment = (id) => api.delete(`/api/payments/${id}`);

// Delete multiple payments
export const deleteMultiplePayments = (ids) =>
  api.delete("/api/payments/bulk", { data: { ids } });




// Order Endpoints
export const addOrder = (data) => api.post("/api/order/", data);
export const getOrders = () => api.get("/api/order");
export const updateOrderStatus = ({ orderId, orderStatus }) =>
  api.put(`/api/order/${orderId}`, { orderStatus });
export const getPopularDishes = () => api.get("/api/order/popular");

//Unit Endpoints
export const getUnits = () => api.get("api/unit");
export const deleteUnit = (id) => api.delete(`api/unit/${id}`);
export const createUnit = (data) => api.post("api/unit", data);
export const updateUnit = (id, data) => api.put(`api/unit/${id}`, data);

//Purchase Endpoints
export const getPurchases= () => api.get("api/purchase");
export const deletePurchase = (id) => api.delete(`api/purchase/${id}`);
export const createPurchase = (data) => api.post("api/purchase", data);
export const updatePurchase = (id, data) => api.put(`api/purchase/${id}`, data);

//Expense Endpoint

export const getExpenses = () => api.get("api/expenses");
export const deleteExpense = (id) => api.delete(`api/expenses/${id}`);
export const createExpense = (data) => api.post("api/expenses", data);
export const updateExpense = (id, data) => api.put(`api/expenses/${id}`, data);



// Product
export const getProducts = async () => {
  const res = await api.get("/api/product");
  return res.data;
};
export const addProduct = (data) => api.post("/api/product", data);
export const updateProduct = (id, data) => api.put(`/api/product/${id}`, data);
export const deleteProduct = (id) => api.delete(`/api/product/${id}`);


// Product Category
export const getProductCategories = () => api.get("api/product-category");
export const createProductCategory = (data) => api.post("api/product-category", data);
export const updateProductCategory = (id, data) => api.put(`api/product-category/${id}`, data);
export const deleteProductCategory = (id) => api.delete(`api/product-category/${id}`);

//Supplier Endpoints
export const getSuppliers = () => api.get("api/suppliers");
export const createSupplier = (data) => api.post("api/suppliers", data);
export const updateSupplier = (id, data) => api.put(`api/suppliers/${id}`, data);
export const deleteSupplier = (id) => api.delete(`api/suppliers/${id}`);

//Stock Endpoints
export const getStockTransactions = () => api.get("api/stock/transactions");
export const createStockTransaction = (data) =>
  api.post("api/stock/transactions", data);
export const getStockTransactionById = (id) =>
  api.get(`api/stock/transactions/${id}`);
export const deleteStockTransaction = (id) =>
  api.delete(`api/stock/transactions/${id}`);

export const getStockSummary = () => api.get("/api/stock/summary");
export const getStockSummaryByProduct = (productId) =>
  api.get(`api/stock/summary/${productId}`);
export const getAllStockSummary = () => api.get("/api/stock/summary");


export const getStockHistoryByProduct = (productId) =>
  api.get(`api/stock/history/${productId}`);

  // Export Excel
export const exportStock = async (type, productId) => {
  const res = await api.get("api/stock/export", {
    params: { type, productId },
    responseType: "blob",
  });

  let filename = `stock-${type}`;
  if (productId) filename += `-${productId}`;
  filename += ".xlsx";

  downloadFile(res.data, filename);
};







