import React, { useState, useEffect, useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import { useParams } from "react-router-dom";
import CustomerEdit from "./CustomerEdit";
import CompanyInfo from "./CompanyInfo";
import HeaderAccount from "../HeaderAccount";
import FooterAccount from "../FooterAccount";
import { fetchWithAuth } from "../account/auth";
import UploadFile from "./UploadFile";
import DocumentsBlock from "./DocumentsBlock";
import NavButtons from "@/components/account/NavButtons";
import {Skeleton} from "@mui/material";
import AuthBlock from "@/components/customer/AuthBlock";

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
    const BASE_URL = import.meta.env.VITE_API_URL;

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

    return (
        <>
            <HeaderAccount customerId={customerId} />
            <div id="detail-page">
            <div className="container margin-top-90 wrapper">
                <div className="row message-block-76">
                    <div className="col-xl-1 col-sm-2 back-button">
                        <NavButtons />
                    </div>

                    <div className="col-xl-7 col-12">
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

                            <AuthBlock customerData={customerData} />

                        </>)}

                    </div>
                </div>
            </div>
            </div>
            <FooterAccount />
        </>
    );
};

export default CustomerDetailPage;