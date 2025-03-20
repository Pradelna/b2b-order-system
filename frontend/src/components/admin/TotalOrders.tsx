import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "../account/auth";
import {Skeleton} from "@mui/material";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTruck} from "@fortawesome/free-solid-svg-icons";

interface TotalCustomersProps {
    apiUrl?: string; // если нужно указать кастомный URL
}

function TotalOrders({ apiUrl }: TotalCustomersProps) {
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const BASE_URL = import.meta.env.VITE_API_URL;
    const endpoint = apiUrl || `${BASE_URL}/admin/adminpanel/orders/total/`;

    useEffect(() => {
        const fetchTotal = async () => {
            try {
                const response = await fetchWithAuth(endpoint);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                setTotal(data.total_orders);
            } catch (error) {
                console.error("Error fetching total orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTotal();
    }, [endpoint]);

    return (
        <div className="col-4">
            {(total && (loading)) ? (
                <>
                    <div className="card dashboard-button">
                        <div className="card-body button-history">
                            <Skeleton
                                variant="rectangular"
                                width={36} height={36}
                                sx={{ borderRadius: "18px", marginBottom: 2 }}
                            />

                        </div>
                    </div>
                </>
            ) : (

                <div className="card dashboard-button user-card">
                    <div className="order-admin-icon">
                        <FontAwesomeIcon icon={faTruck} className="icon" />
                    </div>
                    <p className="">
                        All orders: {total}
                    </p>
                </div>

            )}
        </div>
    );
}

export default TotalOrders;