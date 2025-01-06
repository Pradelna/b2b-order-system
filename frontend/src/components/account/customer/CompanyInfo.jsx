import React, { useState, useEffect } from "react";
import CustomerForm from "./CustomerForm";
import { Link, useLocation } from "react-router-dom"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot, faBuilding, faIdCard, faPhone, faEnvelope, faUserTie, faGear, faPenToSquare
} from "@fortawesome/free-solid-svg-icons";
import { fetchWithAuth } from "../auth.js";
import { Tooltip as ReactTooltip } from 'react-tooltip';

function CompanyInfo({ language, languageData, customerData, setCustomerData, setSuccessMessage, setIsEditing }) {
    const currentData = languageData.find(item => item.lang === language);
    const data = currentData ? currentData['service'] : null;
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const isDetailPage = location.pathname.includes("/customer/");

    useEffect(() => {
        if (!customerData || !customerData.company_email) {
            setLoading(true);
            fetchWithAuth("http://127.0.0.1:8000/api/customer/data/")
                .then((response) => response.json())
                .then((data) => {
                    setCustomerData({ ...data });
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching customer data:", error);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [setCustomerData]);
    
  
  

    const handleFormSubmit = (formData) => {
        fetchWithAuth("http://localhost:8000/api/customer/data/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            body: JSON.stringify(formData),
        })
        .then((response) => response.json())
        .then((data) => {
            setCustomerData({ ...data });
            setSuccessMessage("Customer data successfully added!");
            setTimeout(() => { window.location.reload(); setSuccessMessage(""); }, 5000);
            // setTimeout(() => setSuccessMessage(""), 5000);
        })
        .catch((error) => {
            console.error("Error submitting customer data:", error);
        });
    };

    const customerId = customerData?.user_id;

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!customerData || customerData.error === "Customer not found") {
        return (
            <div>
                <p className="alert alert-danger">Add Customer Information</p>
                <CustomerForm onSubmit={handleFormSubmit} />
            </div>
        );
    }

    return (
        <div className="card company-card">
            {/* Условное отображение иконки в зависимости от страницы */}
            {isDetailPage ? (
                <FontAwesomeIcon
                    icon={faPenToSquare}
                    className="settings"
                    style={{ cursor: "pointer" }}
                    onClick={() => setIsEditing(true)}
                    data-tooltip-id="edit-tooltip"
                />
            ) : (
                customerId ? (
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
                )
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

            {/* Данные клиента */}
            <h5 className="company-name">
                <FontAwesomeIcon icon={faBuilding} className="icon" /> <span className="ms-1">{customerData.company_name}</span>
            </h5>
            <p className="company-info">
                <FontAwesomeIcon icon={faLocationDot} className="icon" /> <span className="ms-2">{customerData.company_address}</span>
            </p>
            <p className="company-info">
                <FontAwesomeIcon icon={faIdCard} className="icon" /> <span className="ms-1">ICO {customerData.company_ico}</span>
            </p>
            <p className="company-info">
                <FontAwesomeIcon icon={faPhone} className="icon" /> <span className="ms-1">{customerData.company_phone}</span>
            </p>
            <p className="company-info">
                <FontAwesomeIcon icon={faEnvelope} className="icon" /> 
                <span className="ms-1">{customerData.company_email ? customerData.company_email : 'No email available'}</span>
            </p>
            <p className="company-info">
                <FontAwesomeIcon icon={faUserTie} className="icon" /> <span className="ms-1">{customerData.company_person}</span>
            </p>
        </div>
    );
}

export default CompanyInfo;