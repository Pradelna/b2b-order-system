import React, { useState, useEffect, useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import { useNavigate, useLocation } from "react-router-dom";
import CompanyInfo from "../customer/CompanyInfo";
import PlaceForm from "../place/PlaceForm";
import OrderForm from "../order/OrderForm";
import OrderHistory from "../order/OrderHistory";
import ButtonAllHistory from "../history/ButtonAllHistory";
import ButtonsOrder from "../customer/ButtonsOrder";
import { fetchWithAuth } from "../account/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faHouse } from "@fortawesome/free-solid-svg-icons";

interface AccountProps {
    customerData: Record<string, any> | null;
    setCustomerData: (data: Record<string, any>) => void;
}

interface Place {
    id: number;
    place_name: string;
    rp_city: string;
    rp_street: string;
    rp_zip: string;
}

const Account: React.FC<AccountProps> = ({ customerData, setCustomerData }) => {
    const { currentData } = useContext(LanguageContext);
    const navigate = useNavigate();
    const location = useLocation();

    if (!currentData || !currentData.service) {
        return null; // Если данных нет, компонент ничего не отображает
    }

    const [cardStyle, setCardStyle] = useState<React.CSSProperties>({ display: "none" });
    const [cardContent, setCardContent] = useState<string>("");
    const [activeButton, setActiveButton] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>(location.state?.successMessage || "");
    const [showPlaceForm, setShowPlaceForm] = useState<boolean>(false);
    const [places, setPlaces] = useState<Place[]>([]);
    const [orders, setOrders] = useState<Record<string, any>[]>([]);
    const [visibleOrders, setVisibleOrders] = useState<number>(5);
    const [showOrderForm, setShowOrderForm] = useState<boolean>(false);
    const [currentPlaceId, setCurrentPlaceId] = useState<number | null>(null);
    const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);

    const handleCardClick = (
        event: React.MouseEvent<HTMLDivElement>,
        content: string,
        index: number,
        placeId: number
    ) => {
        if (activeButton === index) {
            setCardStyle({ display: "none" });
            setActiveButton(null);
            setSelectedPlaceId(null); // Сбрасываем выбранное место
            return;
        }
        const buttonRect = (event.target as HTMLElement).closest(".place-card")!.getBoundingClientRect();
        const containerRect = document.querySelector(".col-history")!.getBoundingClientRect();
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

    const handleSuccess = (newPlace: Place) => {
        setSuccessMessage(`Place "${newPlace.place_name}" created successfully!`);
        setPlaces((prevPlaces) => [...prevPlaces, newPlace]); // Добавляем новое место в список
        setTimeout(() => setSuccessMessage(""), 5000);
        setShowPlaceForm(false); // Скрыть форму после успешного создания
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

    const handleOrderSuccess = (data: Record<string, any>) => {
        alert(`Order created successfully!`);
        setShowOrderForm(false); // Закрываем форму
    };

    useEffect(() => {
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
                                customerData={customerData}
                                setCustomerData={setCustomerData}
                                setSuccessMessage={setSuccessMessage}
                            />
                        </div>

                        {customerData && !customerData.error && <ButtonAllHistory />}

                        {customerData && !customerData.error && (
                            <ButtonsOrder
                                onCreatePlace={() => setShowPlaceForm(true)}
                                onCreateOrder={() => setShowOrderForm(true)}
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
                            <div className="col-12 dashboard" key={place.id}>
                                <div
                                    className={`card place-card ${activeButton === index ? "active" : ""}`}
                                    onClick={(e) => handleCardClick(e, place.place_name, index, place.id)}
                                >
                                    <div className="place">
                                        <div className="place-icon">
                                            <FontAwesomeIcon icon={faHouse} className="s" />
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
                                        >
                                            new order
                                        </button>
                                        <button
                                            onClick={() => place.id && navigate(`/place/${place.id}`)}
                                            disabled={!place.id} // Отключаем кнопку, если нет ID
                                            className="call details-place-button"
                                        >
                                            details
                                        </button>
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
                        setSuccessMessage(`Order created successfully`);
                        setTimeout(() => setSuccessMessage(""), 5000);
                    }}
                />
            )}
        </div>
    );
};

export default Account;