import React, { useState } from "react";
import CompanyInfo from "./customer/CompanyInfo";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClockRotateLeft
} from "@fortawesome/free-solid-svg-icons";
import ButtonAllHistory from "../history/ButtonAllHistory";
import ButtonsOrder from "./customer/ButtonsOrder";

function Account({ language, languageData, customerData, setCustomerData }) {
    const currentData = languageData.find(item => item.lang === language);
    const data = currentData['service'];
    if (!data) {
        return null;
    }

    const [cardStyle, setCardStyle] = useState({ display: "none" });
    const [cardContent, setCardContent] = useState("");
    const [activeButton, setActiveButton] = useState(null); 
    const [successMessage, setSuccessMessage] = useState(""); // Новый state для сообщения

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

  // console.log("account");
  // console.log(customerData);
  
    const places = [
        { name: "Hotel Palace", address: "Sokolovska 15, 831 43" },
        { name: "Hotel Zamok", address: "Ulica 54, 831 43" },
        { name: "Hotel Spa Royal", address: "Prospekt 21, 831 43" },
    ];

    return (
        <div className="container margin-top-130 wrapper">
            <div className="row">
                <div className="col-lg-12 col-8">
                    <div id="company-top" className="row">
                        <div className="col-12">
                            {successMessage && <p className="alert alert-success">{successMessage}</p>} 
                        </div>
                        
                        <div className={`${customerData && !customerData.error ? "col-6" : "col-12"}`}>
                            {/* Передача setSuccessMessage в дочерний компонент */}
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
                            <ButtonsOrder language={language} languageData={languageData} />
                        )}
                    </div>

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
                                        <h5>{place.name}</h5>
                                        <p className="card-text">{place.address}</p>
                                        <button className="call dash-button">new order</button>
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
                            <div className="history-list mt-4">
                                <p>16.12.2024 delivering</p>
                                <hr />
                                <p>10.12.2024 pick up</p>
                                <hr />
                                <p>04.12.2024 delivering</p>
                                <hr />
                                <p>26.11.2024 pick up</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Account;