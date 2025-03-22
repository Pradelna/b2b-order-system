import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchWithAuth } from "../account/auth";
import Loader from "../Loader";

interface AdminRouteProps {
    children: React.ReactNode;
}

const BASE_URL = import.meta.env.VITE_API_URL;

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const response = await fetchWithAuth(`${BASE_URL}/admin/adminpanel/is-admin/`);
                const data = await response.json();
                setIsAdmin(data.is_admin);
            } catch (error) {
                console.error("Admin check failed:", error);
                setIsAdmin(false);
            }
        };

        checkAdmin();
    }, []);

    if (isAdmin === null) return <Loader />;

    return isAdmin ? children : <Navigate to="/account/login" />;
};

export default AdminRoute;