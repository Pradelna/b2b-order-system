import React, {useState, useEffect, useContext} from "react";
import { LanguageContext } from "../../context/LanguageContext";
import CustomerForm from "./CustomerForm";
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
    const [loading, setLoading] = useState<boolean>(true);
    const BASE_URL = import.meta.env.VITE_API_URL;
    const [userId, setUserId] = useState<string | null>(null);
    const location = useLocation();
    const isDetailPage = location.pathname.includes("/customer/");
    const customerId = customerData?.user_id || userId;
    const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});
    const { currentData } = useContext(LanguageContext);

    const handleFormSubmit = (formData: Partial<CustomerData>) => {
        fetchWithAuth(`${BASE_URL}/customer/data/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) {
                    if (response.status === 400 && data) {
                        setFormErrors(data);
                    }
                    throw new Error(
                        data.detail ||
                        currentData?.messages?.filed_form ||
                        "Nepodařilo se odeslat formulář"
                    );
                }
                setFormErrors({}); // очищаем ошибки при успехе
                return data;
            })
            .then((data: CustomerData) => {
                setCustomerData(data);
                setSuccessMessage(currentData?.messages?.customer_success || "Údaje byly úspěšně přidány!");
                setTimeout(() => setSuccessMessage(""), 5000);
            })
            .catch((error) => {
                console.error(
                    currentData?.messages?.customer_error || "Chyba při odesílání údajů zákazníka:", error.message
                );
            });
    };

    const lang = currentData?.lang || "cz";
    const editInfo = {
        cz: "Upravit údaje zákazníka",
        ru: "Редактировать информацию о клинте",
        en: "Edit Customer Information",
    };
    const labelEditInfo = editInfo[lang] || editInfo.cz;

    const accountSettings = {
        cz: "Nastavení účtu",
        ru: "Настройки аккаунта",
        en: "Account settings",
    };
    const labelAccountSettings = accountSettings[lang] || accountSettings.cz;

    useEffect(() => {
        if (!customerData || !customerData.company_email) {
            setLoading(true);
            fetchWithAuth(`${BASE_URL}/customer/data/`)
                .then((response) => {
                    if (!response.ok) {
                        if (response.status === 404) {
                            throw new Error("Customer not found"); // Явно обрабатываем 404
                        }
                        throw new Error("Failed to fetch customer data");
                    }
                    return response.json();
                })
                .then((data: CustomerData) => {
                    setCustomerData(data);
                    setUserId(data.user_id);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching customer data:", error.message);
                    if (error.message === "Customer not found") {
                        setCustomerData(null); // Setting the absence of data
                    }
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [customerData, setCustomerData]);

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

    if (!customerData || customerData.error === "Customer not found") {
        return (
            <div>
                <p className="alert alert-warning">{currentData?.messages?.add_inform || "Přidat informace o zákazníkovi"}</p>
                <CustomerForm onSubmit={handleFormSubmit} errors={formErrors} />
            </div>
        );
    }

    return (
        <div className="card company-card">
            {/* Conditional icon display based on the page */}
            {isDetailPage ? (
                <DarkTooltip title={labelEditInfo || "Upravit údaje zákazníka"} placement="top" arrow>
                    <FontAwesomeIcon
                        icon={faPenToSquare}
                        className="settings"
                        style={{ cursor: "pointer" }}
                        onClick={() => setIsEditing && setIsEditing(true)}
                    />
                </DarkTooltip>
            ) : customerId ? (
                <Link to={`/customer/${customerId}`}>
                    <DarkTooltip title={labelAccountSettings || "Nastavení účtu"} placement="top" arrow>
                        <FontAwesomeIcon
                            icon={faGear}
                            className="settings"
                            data-tooltip-id="settings-tooltip"
                        />
                    </DarkTooltip>
                </Link>
            ) : (
                <FontAwesomeIcon
                    icon={faGear}
                    className="settings"
                    style={{ opacity: 0.5, cursor: "not-allowed" }}
                />
            )}

            {/* Customer data display */}
            {!isDetailPage ? (
                <div className="card-body">
                    <FontAwesomeIcon icon={faBuilding} className="icon" />{" "}
                    <p className="text-history front-name">{customerData?.company_name || "empty"}</p>
                </div>) : (

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
                </div>)}
        </div>
    );
};

export default CompanyInfo;