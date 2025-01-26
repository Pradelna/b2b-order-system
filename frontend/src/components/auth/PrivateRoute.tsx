import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";

// Function to check if the user is authenticated
function isUserAuthenticated(): boolean {
  const token = localStorage.getItem("accessToken");
  return !!token; // Return true if the token exists
}

// Props type for the PrivateRoute component
interface PrivateRouteProps {
  children: ReactNode; // ReactNode allows any valid React children, including elements and strings
}

// Component for routes protected by authentication
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = isUserAuthenticated();

  // Render the children if authenticated, otherwise navigate to the login page
  return isAuthenticated ? <>{children}</> : <Navigate to="/account/login" />;
};

export default PrivateRoute;