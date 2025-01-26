import { useState, useEffect, useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import { useParams } from "react-router-dom";
import CustomerEdit from "./CustomerEdit.js";
import CompanyInfo from "./CompanyInfo";
import HeaderAccount from "../HeaderAccount";
import Footer from "../Footer";
import { fetchWithAuth } from "../account/auth";
import UploadFile from "./UploadFile.js";
import DocumentsBlock from "./DocumentsBlock.js";

interface CustomerData {
    company_name: string;
    company_address: string;
    company_ico: string;
    company_dic: string;
    company_phone: string;
    company_email?: string;
    company_person: string;
    user_id: string;
}

const CustomerDetailPage: React.FC = () => {
    const { currentData } = useContext(LanguageContext);
    const { customerId } = useParams<{ customerId: string }>(); // `customerId` is actually `user_id`
    const [customerData, setCustomerData] = useState<CustomerData | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    const fetchCustomerData = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("You are not logged in!");
            window.location.href = "/login";
            return;
        }

        try {
            const response = await fetchWithAuth(`http://127.0.0.1:8000/api/customer/data/`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch customer data");
            }

            const data: CustomerData = await response.json();
            setCustomerData(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching customer data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomerData();
    }, [customerId]);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        alert("You have been logged out.");
        window.location.href = "/account/login";
    };

    if (loading) {
        return <div>Loading customer details...</div>;
    }

    return (
        <>
            <HeaderAccount />
            <div className="container margin-top-130 wrapper">
                <div className="row">
                    <div className="col-lg-8 col-12">
                        <div className="row detail-page">
                            {successMessage && <p className="alert alert-success">{successMessage}</p>}

                            {isEditing ? (
                                <CustomerEdit
                                    customerData={customerData}
                                    setCustomerData={setCustomerData}
                                    setSuccessMessage={setSuccessMessage}
                                    onLogout={handleLogout}
                                    setIsEditing={setIsEditing}
                                />
                            ) : (
                                <CompanyInfo
                                    customerData={customerData}
                                    setCustomerData={setCustomerData}
                                    setSuccessMessage={setSuccessMessage}
                                    setIsEditing={setIsEditing}
                                />
                            )}
                        </div>

                        <UploadFile />

                        <DocumentsBlock />

                        <div className="row mt-3 mb-5">
                            {/* Logout Button */}
                            <button className="btn-red" onClick={handleLogout}>
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CustomerDetailPage;