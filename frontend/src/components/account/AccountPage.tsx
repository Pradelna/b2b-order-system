import {useState, useEffect, JSX} from "react";
import { fetchWithAuth } from "./auth";
import HeaderAccount from "../HeaderAccount";
import Header from "../Header";
import Account from "./Account";
import Footer from "../Footer";
import {useParams} from "react-router-dom";

// Define the shape of the customer data
interface CustomerData {
    company_email?: string;
    [key: string]: any; // Allow for additional fields if necessary
}

function AccountPage(): JSX.Element {
    const [customerData, setCustomerData] = useState<CustomerData | null>(null);
    const [ customerId, setCustomerId ] = useState<{ customerId: any }>();
    const [loading, setLoading] = useState<boolean>(true);
    const BASE_URL = import.meta.env.VITE_API_URL;
    const [formCustomer, setFormCustomer] = useState<boolean>(true);

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const response = await fetchWithAuth(`${BASE_URL}/customer/data/`, {
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
                setFormCustomer(false);
                setCustomerData(data);
                setCustomerId(data.user_id);
            } catch (error) {
                console.error("Error fetching customer data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerData();
    }, []);

    return (
        <>
            { customerId ? (
                <HeaderAccount customerId={customerId} />
            ) : (
                <Header formCustomer={formCustomer} />
            )}

            <Account
                customerData={customerData}
                setCustomerData={setCustomerData}
            />
            <Footer />
        </>
    );
}

export default AccountPage;