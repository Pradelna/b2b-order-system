import React from "react";
import { useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faCartPlus } from "@fortawesome/free-solid-svg-icons";

interface ButtonsOrderProps {
    onCreatePlace: () => void; // Function to handle creating a new place
    onCreateOrder: () => void; // Function to handle creating a new order
}

const ButtonsOrder: React.FC<ButtonsOrderProps> = ({ onCreatePlace, onCreateOrder }) => {
    const { currentData } = useContext(LanguageContext);

    // If no data is available, render nothing
    if (!currentData || !currentData.service) {
        return null;
    }

    return (
        <div className="col-3">
            {/* New Order Button */}
            <div className="card mini new-order" onClick={onCreateOrder}>
                <div className="card-body text-center">
                    <p className="card-title">
                        <FontAwesomeIcon icon={faCartPlus} className="icon" />
                    </p>
                    <p className="card-title">{currentData.service.new_order || "New Order"}</p>
                </div>
            </div>

            {/* New Place Button */}
            <div className="card mini" onClick={onCreatePlace}>
                <div className="card-body text-center">
                    <p className="card-title">
                        <FontAwesomeIcon icon={faBuilding} className="icon" />
                    </p>
                    <p className="card-title">{currentData.service.new_place || "New Place"}</p>
                </div>
            </div>
        </div>
    );
};

export default ButtonsOrder;