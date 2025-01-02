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
  
  // Обёртка для запросов с автоматическим обновлением токена
  export const fetchWithAuth = async (url, options = {}) => {
    const accessToken = localStorage.getItem("accessToken");
  
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
  
    if (response.status === 401) {
      // Пытаемся обновить токен
      const newToken = await refreshToken();
      if (newToken) {
        // Повторяем запрос с новым токеном
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
            "Content-Type": "application/json",
          },
        });
        return retryResponse;
      }
    }
  
    return response;
  };