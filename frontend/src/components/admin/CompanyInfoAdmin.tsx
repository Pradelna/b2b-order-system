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
    faUserCheck,
    faPenToSquare,
    faCalendarWeek,
    faWeightScale
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
    monthly_estimate: number;
    change_data: boolean;
    active: boolean;
    weekend_able: boolean;
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

    // console.log(customerData);
    useEffect(() => {
        if (customerData) {
            setLoading(false);
        }
    }, [customerData]);

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
                        {customerData?.change_data && <span className="needs-changes"> NEEDS CHANGES</span>}
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
                        <span className="ms-1">{customerData?.company_email || "empty"}</span>
                    </p>
                    <p className="company-info">
                        <FontAwesomeIcon icon={faUserTie} className="icon" />{" "}
                        <span className="ms-1">{customerData?.company_person || "empty"}</span>
                    </p>
                    <p className="company-info">
                        <FontAwesomeIcon icon={faWeightScale} className="icon" />{" "}
                        <span className="ms-1">{customerData?.monthly_estimate || 0} kg</span>
                    </p>
                    <p className="company-info">
                        <FontAwesomeIcon icon={faUserCheck} className="icon" />{" "}
                        {customerData?.active ? <span className="ms-1">Active</span> : <span className="ms-1">Not active</span>}
                    </p>
                    <p className="company-info">
                        <FontAwesomeIcon icon={faCalendarWeek} className="icon" />{" "}
                        {customerData?.weekend_able ? <span className="ms-1">Weekend able</span> : <span className="ms-1">Not weekend</span>}
                    </p>
                </div>
        </div>
    );
};

export default CompanyInfoAdmin;