// Функция для обновления токена
export const refreshToken = async () => {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) {
      console.error("No refresh token available");
      return null;
    }
  
    try {
      const response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh }),
      });
  
      if (!response.ok) {
        console.error("Failed to refresh token:", response.status);
        return null;
      }
  
      const data = await response.json();
      localStorage.setItem("accessToken", data.access); // Обновляем токен
      return data.access;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  };
  

// Исправленная версия fetchWithAuth
export const fetchWithAuth = async (url, options = {}) => {
  let accessToken = localStorage.getItem("accessToken");
  
  // Проверка, является ли тело FormData
  const isFormData = options.body instanceof FormData;

  // Добавление заголовков
  const headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
  };

  // Если это не FormData, добавляем application/json
  if (!isFormData) {
      headers["Content-Type"] = "application/json";
  }

  // Основной запрос
  const response = await fetch(url, {
      ...options,
      headers: headers,
  });

  // Если токен истек
  if (response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
          accessToken = newToken;
          const retryHeaders = {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
          };
          if (!isFormData) {
              retryHeaders["Content-Type"] = "application/json";
          }
          return fetch(url, {
              ...options,
              headers: retryHeaders,
          });
      }
  }

  return response;
};