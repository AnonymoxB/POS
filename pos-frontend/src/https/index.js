import axios from "axios";
// import { axiosWrapper } from "./axiosWrapper";


const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});

console.log("API Base URL:", import.meta.env.VITE_BACKEND_URL);


// API Endpoints
export const login = (data) => api.post("/user/login", data);
export const register = async (data) => {
  const response = await api.post("/user/register", data);
  return response.data;
};

export const getUserData = () => api.get("/user");
export const logout = () => api.post("/user/logout");
// Auth Endpoints


// Table Endpoints
export const addTable = (data) => api.post("/table/", data);
export const getTables = () => api.get("/table");
export const updateTable = (id, tableData) => api.put(`/table/${id}`, tableData);

export const deleteTable = (id) => api.delete(`/table/${id}`);



// category
export const addCategory = (categoryData) => {
  return api.post("/category", categoryData);
};
export const getCategories = async () => {
  const res = await api.get("/category");
  return res.data?.data;
};
export const deleteCategory = (id) => api.delete(`/category/${id}`);
export const updateCategory = (id, categoryData) => api.put(`/category/${id}`, categoryData);


// dish
export const addDish = (dishData) => api.post("/dish", dishData);
export const getDishes = async () => {
  const res = await api.get("/dish");
  console.log("Respon dari /dish:", res.data);
  return res.data?.data || [];
};
export const updateDish = (id, dishData) => api.put(`/dish/${id}`, dishData);
export const deleteDish = (id) => api.delete(`/dish/${id}`);

//Menu






// Payment Endpoints
export const getPayments = () => api.get("/payments");




// Order Endpoints
export const addOrder = (data) => api.post("/order/", data);
export const getOrders = () => api.get("/order");
export const updateOrderStatus = ({ orderId, orderStatus }) =>
  api.put(`/order/${orderId}`, { orderStatus });
export const getPopularDishes = () => api.get("/order/popular");


