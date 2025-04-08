import React, { useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

const ButtonBack: React.FC = () => {
    const { currentData } = useContext(LanguageContext);
    const navigate = useNavigate();

    const label = currentData?.buttons?.back || "Zpět";

    return (
        <p className="back-link cursor-pointer" onClick={() => {
            if (window.history.length > 1) {
                navigate(-1);
            } else {
                navigate("/");
            }
        }}>
            <FontAwesomeIcon icon={faChevronLeft} className="icon" />
            <span className="ms-2"><strong>{label}</strong></span>
        </p>
    );
};

export default ButtonBack;