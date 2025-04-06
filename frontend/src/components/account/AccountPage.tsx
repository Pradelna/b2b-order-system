import {useState, useEffect, JSX, useContext} from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../../context/LanguageContext";
import { fetchWithAuth } from "./auth";
import HeaderAccount from "../HeaderAccount";
import Header from "../Header";
import Account from "./Account";
import FooterAccount from "../FooterAccount";
import Cookies from "../Cookies";

// Define the shape of the customer data
interface CustomerData {
    company_email?: string;
    [key: string]: any; // Allow for additional fields if necessary
}

function AccountPage(): JSX.Element {
    const [customerData, setCustomerData] = useState<CustomerData | null>(null);
    const [ customerId, setCustomerId ] = useState<{ customerId: any }>();
    const [loading, setLoading] = useState<boolean>(true);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const BASE_URL = import.meta.env.VITE_API_URL;
    const [formCustomer, setFormCustomer] = useState<boolean>(true);
    const navigate = useNavigate();
    const { currentData } = useContext(LanguageContext);

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const response = await fetchWithAuth(`${BASE_URL}/customer/data/`, {
                    method: "GET",
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error(currentData?.auth?.login_again || "Neautorizováno. Prosím, přihlaste se znovu.");
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

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!customerData) {
                try {
                    const response = await fetchWithAuth(`${BASE_URL}/admin/adminpanel/is-admin/`, {
                        method: "GET",
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    const data = await response.json();

                    setIsAdmin(data.is_admin);
                    if (data.is_admin) {
                        setFormCustomer(false);
                        navigate('/admin/dashboard');
                    }
                } catch (error) {
                    console.error("Error checking admin status:", error);
                }
            }
        };

        checkAdminStatus();
    }, [customerData, BASE_URL]);

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
            <FooterAccount />
            <Cookies />
        </>
    );
}

export default AccountPage;