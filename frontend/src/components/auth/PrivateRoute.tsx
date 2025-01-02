import React from "react";
import { Navigate } from "react-router-dom";

// Допустим, вы где-то храните информацию о том, что пользователь залогинен.
// Для простоты — localStorage / или Context / или Redux.
function isUserAuthenticated() {
  // Например, проверим наличие JWT в localStorage:
  const token = localStorage.getItem("accessToken");
  return !!token; // true, если token не пуст
}

type PrivateRouteProps = {
  children: JSX.Element;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const auth = isUserAuthenticated();
  return auth ? children : <Navigate to="/account/auth" />;
};

export default PrivateRoute;