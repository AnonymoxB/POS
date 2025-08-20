import api from "./axiosWrapper";


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
export const addDish = (dishData) => api.post("/api/dish", dishData);
export const getDishes = async () => {
  const res = await api.get("/api/dish");
  console.log("Respon dari /api/dish:", res.data);
  return res.data?.data || [];
};
export const updateDish = (id, dishData) => api.put(`/api/dish/${id}`, dishData);
export const deleteDish = (id) => api.delete(`/api/dish/${id}`);

//Menu






// Payment Endpoints
export const getPayments = () => api.get("/api/payments");




// Order Endpoints
export const addOrder = (data) => api.post("/api/order/", data);
export const getOrders = () => api.get("/api/order");
export const updateOrderStatus = ({ orderId, orderStatus }) =>
  api.put(`/api/order/${orderId}`, { orderStatus });
export const getPopularDishes = () => api.get("/api/order/popular");

//Unit Endpoints
export const getUnits = () => api.get("/units");
export const deleteUnit = (id) => api.delete(`/units/${id}`);
export const createUnit = (data) => api.post("/units", data);
export const updateUnit = (id, data) => api.put(`/units/${id}`, data);


