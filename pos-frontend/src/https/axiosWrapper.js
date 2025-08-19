import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("Request ke:", (config.baseURL || "") + config.url, "pakai token:", token);
  console.log("👉 Base URL API:", import.meta.env.VITE_BACKEND_URL);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default api;
