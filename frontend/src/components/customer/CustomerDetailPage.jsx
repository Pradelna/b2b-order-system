import React, { useState, useEffect, useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext.jsx";
import { useParams } from "react-router-dom";
import CustomerEdit from "./CustomerEdit";
import CompanyInfo from "./CompanyInfo";
import HeaderAccount from "../HeaderAccount";
import Footer from "../Footer";
import { fetchWithAuth } from "../account/auth.js";
import UploadFile from "./UploadFile.jsx";
import DocumentsBlock from "./DocumentsBlock.jsx";

function CustomerDetailPage({ language, languageData, handleLanguageChange }) {
    const langData = languageData.find(item => item.lang === language);
    // const { currentLanguage } = useContext(LanguageContext);
    const { customerId } = useParams();  // Это на самом деле user_id
    const [customerData, setCustomerData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [message, setMessage] = useState(''); 
    const [loading, setLoading] = useState(true);

    const fetchCustomerData = () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("You are not logged in!");
            window.location.href = "/login";
            return;
        }

        fetchWithAuth(`http://127.0.0.1:8000/api/customer/data/`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch customer data");
                }
                return response.json();
            })
            .then((data) => {
                setCustomerData(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching customer data:", error);
                setLoading(false);
            });
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
            <HeaderAccount language={language} languageData={languageData} />
            <div className="container margin-top-130 wrapper">
                <div className="row">
                    <div className="col-lg-8 col-12">
                        {/* <h1 className="detail-page">Customer Details</h1> */}
                        <div className="row detail-page">
                            
                            {successMessage && <p className="alert alert-success">{successMessage}</p>}
                            

                            {isEditing ? (
                                <CustomerEdit 
                                    customerData={customerData} 
                                    setCustomerData={setCustomerData} 
                                    setSuccessMessage={setSuccessMessage}
                                    onLogout={handleLogout} 
                                    setIsEditing={setIsEditing}
                                    langData={langData}
                                />
                            ) : (

                                <CompanyInfo 
                                    language={language} 
                                    languageData={languageData} 
                                    customerData={customerData} 
                                    setCustomerData={setCustomerData} 
                                    setSuccessMessage={setSuccessMessage}
                                    setIsEditing={setIsEditing} 
                                />
                                            
                            )}
                        </div>

                        <UploadFile langData={langData} />

                        <DocumentsBlock langData={langData} />

                        <div className="row mt-3 mb-5">
                            {/* Кнопка выхода из аккаунта */}
                            <button className="btn-red" onClick={handleLogout}>
                                Log Out
                            </button>
                        </div>
                        
                    </div>
                </div>
            </div>
            <Footer language={language} languageData={languageData} />
        </>
    );
}

export default CustomerDetailPage;