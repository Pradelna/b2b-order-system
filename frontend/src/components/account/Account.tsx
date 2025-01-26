import { useState, useEffect, useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import { useNavigate, useLocation } from "react-router-dom";
import CompanyInfo from "../customer/CompanyInfo";
import PlaceForm from "../place/PlaceForm";
import OrderForm from "../order/OrderForm";
import OrderHistory from "../order/OrderHistory";
import ButtonAllHistory from "../history/ButtonAllHistory";
import ButtonsOrder from "../customer/ButtonsOrder";
import { fetchWithAuth } from "./auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faHouse } from "@fortawesome/free-solid-svg-icons";

// Define the props type for the component
interface AccountProps {
    customerData: Record<string, any> | null;
    setCustomerData: (data: Record<string, any>) => void;
}

const Account: React.FC<AccountProps> = ({ customerData, setCustomerData }) => {
    const { currentData, language, languageData } = useContext(LanguageContext);

    // If the language context does not contain valid data, render nothing
    if (!currentData || !currentData.service) {
        return null;
    }

    const messageData = currentData.auth;

    // Component state
    const [cardStyle, setCardStyle] = useState<React.CSSProperties>({ display: "none" });
    const [cardContent, setCardContent] = useState<string>("");
    const [activeButton, setActiveButton] = useState<number | null>(null);
    const location = useLocation();
    const [successMessage, setSuccessMessage] = useState<string>(location.state?.successMessage || "");
    const [showPlaceForm, setShowPlaceForm] = useState<boolean>(false);
    const [places, setPlaces] = useState<Record<string, any>[]>([]);
    const [orders, setOrders] = useState<Record<string, any>[]>([]);
    const [visibleOrders, setVisibleOrders] = useState<number>(5);
    const navigate = useNavigate();
    const [showOrderForm, setShowOrderForm] = useState<boolean>(false);
    const [currentPlaceId, setCurrentPlaceId] = useState<number | null>(null);
    const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);

    // Handle card click event to show history
    const handleCardClick = (
        event: React.MouseEvent<HTMLDivElement>,
        content: string,
        index: number,
        placeId: number
    ) => {
        if (activeButton === index) {
            setCardStyle({ display: "none" });
            setActiveButton(null);
            setSelectedPlaceId(null); // Reset selected place ID
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
        setSelectedPlaceId(placeId); // Set the selected place ID
    };

    // Handle success when a new place is created
    const handleSuccess = (newPlace: Record<string, any>) => {
        setSuccessMessage(`Place "${newPlace.place_name}" created successfully!`);
        setPlaces((prevPlaces) => [...prevPlaces, newPlace]); // Add the new place to the list
        setTimeout(() => setSuccessMessage(""), 5000);
        setShowPlaceForm(false); // Hide the form
    };

    // Fetch places on component mount
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

    // Handle success when a new order is created
    const handleOrderSuccess = (data: Record<string, any>) => {
        alert(`Order created successfully!`);
        setShowOrderForm(false); // Close the form
    };

    // Fetch orders on component mount
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
                                            disabled={!place.id} // Disable the button if no ID
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
                                disabled={!selectedPlaceId} // Disable the button if no place is selected
                                className="details-place-button-in-history"
                            >
                                Whole history
                            </button>
                            <h5>Orders history for</h5>
                            <div className="mt-1">
                                <OrderHistory placeId={selectedPlaceId} hasMoreOrders={visibleOrders < orders.length} />
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
                        setTimeout(() => setSuccessMessage(""), 5000); // Clear the message after 5 seconds
                        setShowOrderForm(false); // Close the form
                    }}
                />
            )}
        </div>
    );
};

export default Account;