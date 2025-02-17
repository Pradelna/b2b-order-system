const BASE_URL = import.meta.env.VITE_API_URL;
import React, { useState, useEffect, useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import { useParams } from "react-router-dom";
import CustomerEdit from "./CustomerEdit.js";
import CompanyInfo from "./CompanyInfo";
import HeaderAccount from "../HeaderAccount.js";
import Footer from "../Footer.tsx";
import { fetchWithAuth } from "../account/auth.ts";
import UploadFile from "./UploadFile.js";
import DocumentsBlock from "./DocumentsBlock.js";
import NavButtons from "@/components/account/NavButtons.js";
import {Skeleton} from "@mui/material";

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
    const [forceWait, setForceWait] = useState<boolean>(true);

    const fetchCustomerData = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("You are not logged in!");
            window.location.href = "/login";
            return;
        }

        try {
            const response = await fetchWithAuth(`${BASE_URL}/customer/data/`, {
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
        // Ensure skeleton is shown for at least 2 seconds
        const timer = setTimeout(() => setForceWait(false), 1000);
        return () => clearTimeout(timer); // Cleanup
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
            <HeaderAccount customerId={customerId} />
            <div className="container margin-top-90 wrapper">
                <div className="row message-block-76">
                    <div className="col-1 back-button">
                        <NavButtons />
                    </div>
                    <div className="col-lg-7 col-md-9 col-11">
                        {successMessage && (
                            <p className="alert alert-success">{successMessage}</p>
                        )}
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-8 col-12">
                        <div className="row detail-page">

                            {loading || forceWait ? (

                                <div className="card place-details mb-3">
                                    <Skeleton
                                        variant="rectangular"
                                        width={130} height={30}
                                        sx={{ borderRadius: "6px", marginBottom: 2 }}
                                    />
                                    {[...Array(5)].map((_, index) => (
                                        <Skeleton
                                            variant="rectangular"
                                            width={150} height={21}
                                            sx={{borderRadius: "6px", marginBottom: 1}}
                                            key={index}
                                        />
                                    ))}
                                </div>

                            ) : ( <>

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
                            </> )}

                        </div>

                        {loading || forceWait ? (<>
                        <div className="row detail-page mt-1">
                            <div className="card place-details">
                                <Skeleton
                                    variant="rectangular"
                                    width={190} height={36}
                                    sx={{ borderRadius: "18px", marginBottom: 2 }}
                                />
                                <Skeleton
                                    variant="rectangular"
                                    width={150} height={30}
                                    sx={{borderRadius: "6px", marginBottom: 1}}
                                />
                                <Skeleton
                                    variant="rectangular"
                                    width="100%" height={28}
                                    sx={{borderRadius: "16px", marginBottom: 1}}
                                />
                                <Skeleton
                                    variant="rectangular"
                                    width="100%" height={28}
                                    sx={{borderRadius: "16px", marginBottom: 3}}
                                />
                            </div>
                        </div>
                        <div className="row detail-page mt-3">
                            <div className="card place-details mt-2">
                                <Skeleton
                                    variant="rectangular"
                                    width={150} height={30}
                                    sx={{ borderRadius: "6px", marginBottom: 2 }}
                                />
                                <Skeleton
                                    variant="rectangular"
                                    width="100%" height={28}
                                    sx={{borderRadius: "16px", marginBottom: 1}}
                                />
                                <Skeleton
                                    variant="rectangular"
                                    width="100%" height={28}
                                    sx={{borderRadius: "16px", marginBottom: 1}}
                                />
                                <Skeleton
                                    variant="rectangular"
                                    width="100%" height={28}
                                    sx={{borderRadius: "16px", marginBottom: 1}}
                                />
                            </div>
                        </div>
                        </>) : (<>


                        <UploadFile />

                        <DocumentsBlock />

                        <div className="row mt-3 mb-5">
                            {/* Logout Button */}
                            <button className="btn-red" onClick={handleLogout}>
                                Log Out
                            </button>
                        </div>

                        </>)}

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CustomerDetailPage;