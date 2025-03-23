import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchWithAuth } from "../account/auth";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser} from "@fortawesome/free-solid-svg-icons";

interface Customer {
    id: number;
    full_name: string;
    email: string;
    date_joined: string;
}

function NewCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await fetchWithAuth(`${BASE_URL}/admin/adminpanel/customers/new/`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setCustomers(data.customers);
            } catch (error) {
                console.error("Error fetching recent customers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, [BASE_URL]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="recent-customers mt-4">
            <h3>Recent Customers</h3>
            <div className="row">
                {customers.map((customer) => (
                    <div key={customer.user_id} className="col-lg-8 col-12 mb-3">
                        <Link to={`/admin/customer-detail/${customer.user_id}`}>
                        <div className="card dashboard-button user-card">
                            <div className="users-icon">
                                <FontAwesomeIcon icon={faUser} className="icon" />
                            </div>
                            <p className="">
                                id {customer.user_id} - <strong>{customer.new_company_name}</strong>
                            </p>
                            <p className="">
                                {customer.company_address}
                            </p>
                        </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default NewCustomers;