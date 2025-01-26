import { useState, useEffect } from "react";
import { fetchWithAuth } from "./auth";
import HeaderAccount from "../HeaderAccount";
import Account from "./Account";
import Footer from "../Footer";

// Define the shape of the customer data
interface CustomerData {
    company_email?: string;
    [key: string]: any; // Allow for additional fields if necessary
}

function AccountPage(): JSX.Element {
    const [customerData, setCustomerData] = useState<CustomerData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const response = await fetchWithAuth("http://127.0.0.1:8000/api/customer/data/", {
                    method: "GET",
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("Unauthorized. Please log in again.");
                    }
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data: CustomerData = await response.json();

                if (!data.company_email) {
                    console.warn("No email found in customer data");
                }

                setCustomerData(data);
            } catch (error) {
                console.error("Error fetching customer data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <HeaderAccount />
            <Account
                customerData={customerData}
                setCustomerData={setCustomerData}
            />
            <Footer />
        </>
    );
}

export default AccountPage;