import React, { useState, useEffect, useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import CustomerForm from "./CustomerForm.js";
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
import Loader from "../Loader";

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

interface CompanyInfoProps {
    customerData: CustomerData | null;
    setCustomerData: React.Dispatch<React.SetStateAction<CustomerData | null>>;
    setSuccessMessage: (message: string) => void;
    setIsEditing?: (isEditing: boolean) => void; // Optional for edit functionality
}

const CompanyInfo: React.FC<CompanyInfoProps> = ({
                                                     customerData,
                                                     setCustomerData,
                                                     setSuccessMessage,
                                                     setIsEditing,
                                                 }) => {
    const { currentData } = useContext(LanguageContext);
    const [loading, setLoading] = useState<boolean>(true);
    const [userId, setUserId] = useState<string | null>(null);
    const location = useLocation();
    const isDetailPage = location.pathname.includes("/customer/");

    useEffect(() => {
        if (!customerData || !customerData.company_email) {
            setLoading(true);
            fetchWithAuth("http://127.0.0.1:8000/api/customer/data/")
                .then((response) => response.json())
                .then((data: CustomerData) => {
                    setCustomerData(data);
                    setLoading(false);
                    setUserId(data.user_id);
                })
                .catch((error) => {
                    console.error("Error fetching customer data:", error);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [customerData, setCustomerData]);

    const handleFormSubmit = (formData: Partial<CustomerData>) => {
        fetchWithAuth("http://localhost:8000/api/customer/data/", {
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

    const customerId = customerData?.user_id || userId;

    if (loading) {
        return (
            <div>
                <Loader />
            </div>
        );
    }

    if (!customerData || customerData.error === "Customer not found") {
        return (
            <div>
                <p className="alert alert-danger">Add Customer Information</p>
                <CustomerForm onSubmit={handleFormSubmit} currentData={currentData} />
            </div>
        );
    }

    return (
        <div className="card company-card">
            {/* Conditional icon display based on the page */}
            {isDetailPage ? (
                <FontAwesomeIcon
                    icon={faPenToSquare}
                    className="settings"
                    style={{ cursor: "pointer" }}
                    onClick={() => setIsEditing && setIsEditing(true)}
                    data-tooltip-id="edit-tooltip"
                />
            ) : customerId ? (
                <Link to={`/customer/${customerId}`}>
                    <FontAwesomeIcon
                        icon={faGear}
                        className="settings"
                        data-tooltip-id="settings-tooltip"
                    />
                </Link>
            ) : (
                <FontAwesomeIcon
                    icon={faGear}
                    className="settings"
                    style={{ opacity: 0.5, cursor: "not-allowed" }}
                />
            )}

            <ReactTooltip
                id="settings-tooltip"
                place="top"
                content="Account settings"
                className="custom-tooltip"
            />
            <ReactTooltip
                id="edit-tooltip"
                place="top"
                content="Edit Customer Information"
                className="custom-tooltip"
            />

            {/* Customer data display */}
            <h5 className="company-name">
                <FontAwesomeIcon icon={faBuilding} className="icon" />{" "}
                <span className="ms-1">{customerData.company_name}</span>
            </h5>
            <p className="company-info">
                <FontAwesomeIcon icon={faLocationDot} className="icon" />{" "}
                <span className="ms-2">{customerData.company_address}</span>
            </p>
            <p className="company-info">
                <FontAwesomeIcon icon={faIdCard} className="icon" />{" "}
                <span className="ms-1">IČO {customerData.company_ico}</span>
            </p>
            <p className="company-info">
                <FontAwesomeIcon icon={faIdCard} className="icon" />{" "}
                <span className="ms-1">DIČ {customerData.company_dic}</span>
            </p>
            <p className="company-info">
                <FontAwesomeIcon icon={faPhone} className="icon" />{" "}
                <span className="ms-1">{customerData.company_phone}</span>
            </p>
            <p className="company-info">
                <FontAwesomeIcon icon={faEnvelope} className="icon" />{" "}
                <span className="ms-1">
          {customerData.company_email || "No email available"}
        </span>
            </p>
            <p className="company-info">
                <FontAwesomeIcon icon={faUserTie} className="icon" />{" "}
                <span className="ms-1">{customerData.company_person}</span>
            </p>
        </div>
    );
};

export default CompanyInfo;