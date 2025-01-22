import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CompanyInfo from "../customer/CompanyInfo";
import PlaceForm from "../place/PlaceForm";
import OrderForm from "../order/OrderForm.jsx";
import OrderHistory from "../order/OrderHistory";
import ButtonAllHistory from "../history/ButtonAllHistory";
import ButtonsOrder from "../customer/ButtonsOrder";
import { fetchWithAuth } from "../account/auth.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClockRotateLeft, faHouse } from "@fortawesome/free-solid-svg-icons";


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
    const [orders, setOrders] = useState([]); // Список заказов
    const [visibleOrders, setVisibleOrders] = useState(5); // Количество отображаемых заказов
    const navigate = useNavigate();
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [currentPlaceId, setCurrentPlaceId] = useState(null);
    const [selectedPlaceId, setSelectedPlaceId] = useState(null);

    const handleCardClick = (event, content, index, placeId) => {
        if (activeButton === index) {
            setCardStyle({ display: "none" });
            setActiveButton(null);
            setSelectedPlaceId(null); // Сбрасываем выбранное место
            return;
        }
        const buttonRect = event.target.closest(".place-card").getBoundingClientRect();
        const containerRect = document.querySelector(".col-history").getBoundingClientRect();
        const cardHeight = buttonRect.bottom - containerRect.top;
    
        setCardStyle({
            top: `0px`,
            minHeight: `${cardHeight}px`,
            display: "block",
        });
    
        setCardContent(content);
        setActiveButton(index);
        setSelectedPlaceId(placeId); // Устанавливаем ID выбранного места
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

    const handleOrderSuccess = (data) => {
        alert(`Order created successfully!`);
        setShowOrderForm(false); // Закрываем форму
    };
    
    useEffect(() => {
        // Fetch orders
        const fetchOrders = async () => {
            try {
                const response = await fetchWithAuth("http://127.0.0.1:8000/api/order/list/");
                if (response.ok) {
                    const data = await response.json();
                    setOrders(data);
                } else {
                    console.error("Failed to fetch orders");
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        };

        fetchOrders();
    }, []);
      
    //   const loadMoreOrders = () => {
    //     setVisibleOrders((prevVisibleOrders) => prevVisibleOrders + 10);
    // };

    return (
        <div className="container margin-top-130 wrapper account-page">
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
                                onCreateOrder={() => setShowOrderForm(true)}
                            />
                        )}
                    </div>

                    {showPlaceForm && (
                        <PlaceForm 
                        onClose={() => setShowPlaceForm(false)} 
                        onSuccess={(newPlace) => {
                            setPlaces((prevPlaces) => [...prevPlaces, newPlace]);
                            setShowPlaceForm(false);
                        }}
                    />
                    )}

                    <div className="row mt-5">
                        <div className="col-12">
                            <h4>Your places</h4>
                        </div>
                        {places.map((place, index) => (
                            <div className="col-12 dashboard" key={index}>
                                <div 
                                    className={`card place-card ${activeButton === index ? "active" : ""}`}
                                    onClick={(e) => handleCardClick(e, place.name, index, place.id)}
                                >
                                    <div className="place">
                                        {/* <img src="src/assets/dom.webp" alt="" /> */}
                                        <div className="place-icon">
                                            <FontAwesomeIcon
                                                icon={faHouse}
                                                className="s"
                                            />
                                        </div>
                                        
                                        <h5>{place.place_name}</h5>
                                        <p className="card-text">
                                            {place.rp_street}, {place.rp_city}, {place.rp_zip}
                                        </p>
                                        <button
                                            className="call new-order-button"
                                            onClick={() => {
                                                setCurrentPlaceId(place.id);
                                                setShowOrderForm(true);
                                              }}
                                        >new order</button>
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
                            <button
                                onClick={() => selectedPlaceId && navigate(`/place/${selectedPlaceId}`)}
                                disabled={!selectedPlaceId} // Отключаем кнопку, если место не выбрано
                                className="details-place-button-in-history"
                            >
                                Whole history
                            </button>
                            <h5>Orders history for</h5>
                            <div className="mt-1">
                                <OrderHistory 
                                    placeId={selectedPlaceId} 
                                    // loadMoreOrders={loadMoreOrders} 
                                    hasMoreOrders={visibleOrders < orders.length} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
            {showOrderForm && (
                <OrderForm
                    placeId={currentPlaceId}
                    onClose={() => setShowOrderForm(false)}
                    onSuccess={(newOrder) => {
                        console.log("Order created successfully:", newOrder);
                        setSuccessMessage(`Order created successfully`);
                        setTimeout(() => setSuccessMessage(""), 5000); // Очистить сообщение через 5 секунд
                        setShowOrderForm(false); // Закрыть форму
                    }}
                />
            )}
        </div>
    );
};

export default Account;