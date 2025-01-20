import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faCartPlus } from "@fortawesome/free-solid-svg-icons";

function ButtonsOrder({ language, languageData, onCreatePlace, onCreateOrder }) {
    const [currentPlaceId, setCurrentPlaceId] = useState(null); // Исправлено имя useState
    const [showOrderForm, setShowOrderForm] = useState(false); // Добавлено для управления формой

    return (
        <div className="col-3">
            {/* Кнопка New Order */}
            <div 
                className="card mini new-order"
                onClick={onCreateOrder} 
            >
                <div className="card-body text-center">
                    <p className="card-title">
                        <FontAwesomeIcon icon={faCartPlus} className="icon" />
                    </p>
                    <p className="card-title">new order</p>
                </div>
            </div>

            {/* Кнопка New Place */}
            <div 
                className="card mini" 
                onClick={onCreatePlace} 
            >
                <div className="card-body text-center">
                    <p className="card-title">
                        <FontAwesomeIcon icon={faBuilding} className="icon" />
                    </p>
                    <p className="card-title">new place</p>
                </div>
            </div>
        </div>
    );
}

export default ButtonsOrder;