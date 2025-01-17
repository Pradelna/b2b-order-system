import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CompanyInfo from "../customer/CompanyInfo";
import PlaceForm from "../place/PlaceForm";
import { fetchWithAuth } from "../account/auth.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import ButtonAllHistory from "../history/ButtonAllHistory";
import ButtonsOrder from "../customer/ButtonsOrder";

const Account = ({ language, languageData, customerData, setCustomerData }) => {
    const currentData = languageData.find(item => item.lang === language);
    const data = currentData['service'];
    if (!data) {
        return null;
    }

    const [cardStyle, setCardStyle] = useState({ display: "none" });
    const [cardContent, setCardContent] = useState("");
    const [activeButton, setActiveButton] = useState(null);
    const location = useLocation();
    const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || ""); 
    const [showPlaceForm, setShowPlaceForm] = useState(false);
    const [places, setPlaces] = useState([]);
    const navigate = useNavigate();

    const handleCardClick = (event, content, index) => {
        if (activeButton === index) {
            setCardStyle({ display: "none" });
            setActiveButton(null);
            return;
        }
        const buttonRect = event.target.closest(".place-card").getBoundingClientRect();
        const containerRect = document.querySelector(".col-history").getBoundingClientRect();
        const cardHeight = buttonRect.bottom - containerRect.top;
    
        setCardStyle({
            top: `0px`,
            height: `${cardHeight}px`,
            display: "block",
        });
    
        setCardContent(content);
        setActiveButton(index);
    };

    const handleSuccess = (newPlace) => {
        setSuccessMessage(`Place "${newPlace.place_name}" created successfully!`);
        setPlaces((prevPlaces) => [...prevPlaces, newPlace]); // Добавляем новое место в список
        setTimeout(() => setSuccessMessage(""), 5000);
        setShowPlaceForm(false); // Скрыть форму после успешного создания
        // console.log("Place created successfully:", newPlace);
    };

    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const response = await fetchWithAuth("http://127.0.0.1:8000/api/place/list/"); 
                if (response.ok) {
                    const data = await response.json();
                    setPlaces(data);
                } else {
                    console.error("Failed to fetch places");
                }
            } catch (error) {
                console.error("Error fetching places:", error);
            }
        };

        fetchPlaces();
    }, []);

    return (
        <div className="container margin-top-130 wrapper">
            <div className="row">
                <div className="col-xl-8 col-12">
                    <div id="company-top" className="row">
                        <div className="col-12">
                            {successMessage && <p className="alert alert-success">{successMessage}</p>} 
                        </div>
                        
                        <div className={`${customerData && !customerData.error ? "col-6" : "col-12"}`}>
                            <CompanyInfo 
                                language={language} 
                                languageData={languageData} 
                                customerData={customerData} 
                                setCustomerData={setCustomerData} 
                                setSuccessMessage={setSuccessMessage} 
                            />
                        </div>

                        {customerData && !customerData.error && (
                            <ButtonAllHistory language={language} languageData={languageData} />
                        )}

                        {customerData && !customerData.error && (
                            <ButtonsOrder 
                                language={language} 
                                languageData={languageData} 
                                onCreatePlace={() => setShowPlaceForm(true)} 
                            />
                        )}
                    </div>

                    {showPlaceForm && (
                        <PlaceForm 
                            onClose={() => setShowPlaceForm(false)} 
                            onSuccess={handleSuccess} 
                        />
                    )}

                    <div className="row mt-5">
                        <div className="col-12">
                            <h4>Your places</h4>
                        </div>
                        {places.map((place, index) => (
                            <div className="col-12" key={index}>
                                <div 
                                    className={`card dashboard place-card ${activeButton === index ? "active" : ""}`}
                                    onClick={(e) => handleCardClick(e, place.name, index)}
                                >
                                    <div className="card-body place">
                                        <img src="src/assets/dom.webp" alt="" />
                                        <h5>{place.place_name}</h5>
                                        <p className="card-text">
                                            {place.rp_street}, {place.rp_city}, {place.rp_zip}
                                        </p>
                                        <button className="call new-order-button">new order</button>
                                        <button
                                            onClick={() => place.id && navigate(`/place/${place.id}`)}
                                            disabled={!place.id} // Отключаем кнопку, если нет ID
                                            className="call details-place-button"
                                        >details</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-4 col-history">
                    <div
                        id="card-history"
                        className={`card ${activeButton !== null ? "active" : ""}`}
                        style={cardStyle}
                    >
                        <div className="card-body card-history">
                            <FontAwesomeIcon icon={faClockRotateLeft} className="icon" />
                            <h5>Orders history for {cardContent}</h5>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default Account;