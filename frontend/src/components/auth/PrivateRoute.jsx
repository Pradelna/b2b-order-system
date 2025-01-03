import React from "react";
import { Navigate } from "react-router-dom";

// Функция для проверки аутентификации пользователя
function isUserAuthenticated() {
  const token = localStorage.getItem("accessToken");
  return !!token; // true, если токен существует
}

// Компонент для маршрутов, защищённых авторизацией
const PrivateRoute = ({ children }) => {
  const auth = isUserAuthenticated();
  
  // Если пользователь аутентифицирован, рендерим дочерние элементы
  // Если нет, перенаправляем на страницу логина
  return auth ? children : <Navigate to="/account/login" />;
};

export default PrivateRoute;