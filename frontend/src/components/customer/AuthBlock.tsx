import React, { useRef, useState, useEffect, useContext } from 'react';
import { LanguageContext } from "../../context/LanguageContext";
import { fetchWithAuth } from "../account/auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faSquareXmark } from "@fortawesome/free-solid-svg-icons";
import PasswordResetForm from "../auth/PasswordResetForm";
import {Skeleton} from "@mui/material";

interface CustomerData {
    user_id: number; // исправлено iser_id -> user_id
    company_email: string;
}

interface AuthBlockProps {
    customerData: CustomerData | null;
}

const AuthBlock: React.FC<AuthBlockProps> = ({ customerData }) => {
    const { currentData } = useContext(LanguageContext);
    const BASE_URL = import.meta.env.VITE_API_URL as string;
    const [showForm, setShowForm] = useState(false);

    const logoutMessages = {
        cz: "Byli jste odhlášeni.",
        ru: "Вы вышли из аккаунта",
        en: "You have been logged out.",
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");

        const lang = currentData?.lang || "cz";
        const message = logoutMessages[lang] || logoutMessages.en;

        alert(message);
        window.location.href = "/account/login";
    };

    if (!currentData) {
        return <div>Language data not found</div>;
    }

    return (
        <div id="auth-data-block" className="mb-4">
            <div className="row other-card">
                <div className="card">
                    {customerData ? (<>
                        <h3 style={{ fontSize: "20px" }}>
                            {currentData.auth.log_data || "Change password"}
                        </h3>
                        {/* Static link for important document */}
                        <div className="row mb-2">
                            <div className="col-lg-6 col-12 mb-2">
                                <div className="form-control">

                                        <FontAwesomeIcon icon={faEnvelope} className="file-uploaded" />
                                        <span style={{ marginLeft: "5px" }}>
                                        {customerData?.company_email}
                                    </span>

                                </div>
                            </div>

                            <div className="col-lg-6 col-12 mb-2">
                                <button className="btn-upload" onClick={() => setShowForm(true)}>
                                    {currentData.auth.pass_reset || "Change password"}
                                </button>
                                {showForm && (
                                    <div className="modal-backdrop">
                                        <div className="modal-wrapper">
                                            <div className="modal-content">
                                                <FontAwesomeIcon
                                                    icon={faSquareXmark}
                                                    className="reset-forma"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => setShowForm(false)}
                                                />
                                                <PasswordResetForm customerEmail={customerData?.company_email} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="col-lg-6 col-12">
                                <button className="btn-logout" onClick={handleLogout}>
                                    {currentData.auth.logout || "Log out"}
                                </button>
                            </div>
                        </div>
                    </>) : (<>
                        <div className="row">
                            <div className="col-12">
                                <Skeleton
                                    variant="rectangular"
                                    width={150} height={30}
                                    sx={{ borderRadius: "6px", marginBottom: 2 }}
                                />
                            </div>
                        </div>
                        <div className="row mb-2">
                            <div className="col-lg-6 col-12 mb-2">
                                <Skeleton
                                    variant="rectangular"
                                    width="100%" height={30}
                                    sx={{borderRadius: "16px", marginBottom: 1}}
                                />
                            </div>
                            <div className="col-lg-6 col-12 mb-2">
                                <Skeleton
                                    variant="rectangular"
                                    width="100%" height={30}
                                    sx={{borderRadius: "16px", marginBottom: 1}}
                                />
                            </div>
                            <div className="col-lg-6 col-12">
                                <Skeleton
                                    variant="rectangular"
                                    width="100%" height={30}
                                    sx={{borderRadius: "16px", marginBottom: 1}}
                                />
                            </div>
                        </div>
                    </>)}

                </div>
            </div>
        </div>
    );
};

export default AuthBlock;