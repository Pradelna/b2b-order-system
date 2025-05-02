import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:8000/api/', // URL your Django API
  baseURL: `${BASE_URL}`, // URL your Django API
  headers: {
    'Content-Type': 'application/json',
    // add headers
  },
  withCredentials: true, // if needs cookies
});

// Добавляем интерсептор для добавления заголовка Authorization
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем интерсептор для обработки 401 ошибок
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized from axios. Redirecting to login...");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;