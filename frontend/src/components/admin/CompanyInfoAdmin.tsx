import React, { useState, useEffect } from "react";
import CustomerFormAdmin from "../customer/CustomerFormAdmin";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLocationDot,
    faBuilding,
    faIdCard,
    faPhone,
    faEnvelope,
    faUserTie,
    faGear,
    faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { fetchWithAuth } from "../account/auth";
import { Tooltip as ReactTooltip } from "react-tooltip";
import {Skeleton} from "@mui/material";
import DarkTooltip from "@/components/utils/DarkTooltip";

interface CustomerData {
    company_name: string;
    company_address: string;
    company_ico: string;
    company_dic: string;
    company_phone: string;
    company_email?: string;
    company_person: string;
    user_id: string;
    error?: string;
}

interface CompanyInfoAdminProps {
    customerData: CustomerData | null;
    setCustomerData: React.Dispatch<React.SetStateAction<CustomerData | null>>;
    setSuccessMessage: (message: string) => void;
    setIsEditing?: (isEditing: boolean) => void; // Optional for edit functionality
}

const CompanyInfoAdmin: React.FC<CompanyInfoAdminProps> = ({
                                                     customerData,
                                                     setCustomerData,
                                                     setSuccessMessage,
                                                     setIsEditing,
                                                 }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const BASE_URL = import.meta.env.VITE_API_URL;
    const [userId, setUserId] = useState<string | null>(null);
    const location = useLocation();
    const isDetailPage = location.pathname.includes("/customer/");
    const customerId = customerData?.user_id || userId;

    const handleFormSubmit = (formData: Partial<CustomerData>) => {
        fetchWithAuth(`${BASE_URL}/customer/data/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })
            .then((response) => response.json())
            .then((data: CustomerData) => {
                setCustomerData(data);
                setSuccessMessage("Customer data successfully added!");
                setTimeout(() => setSuccessMessage(""), 5000);
            })
            .catch((error) => {
                console.error("Error submitting customer data:", error);
            });
    };

    console.log(customerData);
    useEffect(() => {
        if (customerData) {
            setLoading(false);
        }
    }, [customerData]);

    // useEffect(() => {
    //     if (!customerData || !customerData.company_email) {
    //         setLoading(true);
    //         fetchWithAuth(`${BASE_URL}/customer/data/`)
    //             .then((response) => {
    //                 if (!response.ok) {
    //                     if (response.status === 404) {
    //                         throw new Error("Customer not found"); // Явно обрабатываем 404
    //                     }
    //                     throw new Error("Failed to fetch customer data");
    //                 }
    //                 return response.json();
    //             })
    //             .then((data: CustomerData) => {
    //                 setCustomerData(data);
    //                 setUserId(data.user_id);
    //                 setLoading(false);
    //             })
    //             .catch((error) => {
    //                 console.error("Error fetching customer data:", error.message);
    //                 if (error.message === "Customer not found") {
    //                     setCustomerData(null); // Setting the absence of data
    //                 }
    //                 setLoading(false);
    //             });
    //     } else {
    //         setLoading(false);
    //     }
    // }, [customerData, setCustomerData]);

    if (loading) {
        return (
            <div>
                <Skeleton
                    variant="rectangular"
                    width="100%" height={120}
                    className="mb-3"
                    sx={{ borderRadius: "16px", marginBottom: 1 }}

                />
            </div>
        );
    }

    return (
        <div className="card company-card">
            {/* Conditional icon display based on the page */}

                <DarkTooltip title="Edit Customer Information" placement="top" arrow>
                    <FontAwesomeIcon
                        icon={faPenToSquare}
                        className="settings"
                        style={{ cursor: "pointer" }}
                        onClick={() => setIsEditing && setIsEditing(true)}
                    />
                </DarkTooltip>


            {/* Customer data display */}

                <div className="dop-info">
                    <h5 className="company-name">
                        <FontAwesomeIcon icon={faBuilding} className="icon" />{" "}
                        <span className="ms-1">{customerData?.company_name || "empty"}</span>
                    </h5>
                    <p className="company-info">
                        <FontAwesomeIcon icon={faLocationDot} className="icon" />{" "}
                        <span className="ms-2">{customerData?.company_address || "empty"}</span>
                    </p>
                    <p className="company-info">
                        <FontAwesomeIcon icon={faIdCard} className="icon" />{" "}
                        <span className="ms-1">IČO {customerData?.company_ico || "empty"}</span>
                    </p>
                    <p className="company-info">
                        <FontAwesomeIcon icon={faIdCard} className="icon" />{" "}
                        <span className="ms-1">DIČ {customerData?.company_dic || "empty"}</span>
                    </p>
                    <p className="company-info">
                        <FontAwesomeIcon icon={faPhone} className="icon" />{" "}
                        <span className="ms-1">{customerData?.company_phone || "empty"}</span>
                    </p>
                    <p className="company-info">
                        <FontAwesomeIcon icon={faEnvelope} className="icon" />{" "}
                        <span className="ms-1">
                  {customerData?.company_email || "empty"}
                </span>
                    </p>
                    <p className="company-info">
                        <FontAwesomeIcon icon={faUserTie} className="icon" />{" "}
                        <span className="ms-1">{customerData?.company_person || "empty"}</span>
                    </p>
                </div>
        </div>
    );
};

export default CompanyInfoAdmin;