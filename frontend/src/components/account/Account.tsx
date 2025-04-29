import React, { useState, useEffect, useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import {useNavigate, useLocation, Link} from "react-router-dom";
import CompanyInfo from "../customer/CompanyInfo";
import PlaceForm from "../place/PlaceForm";
import OrderForm from "../order/OrderForm";
import OrderHistory from "../order/OrderHistory";
import OrderSuccess from "../order/OrderSuccess";
import { fetchWithAuth } from "./auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClockRotateLeft,
    faHouse,
    faCartPlus,
    faBuilding,
    faFileInvoiceDollar, faCircleCheck, faStopwatch
} from "@fortawesome/free-solid-svg-icons";
import {Skeleton} from "@mui/material";
import {fontSize} from "@mui/system";


interface AccountProps {
    customerData: Record<string, any> | null;
    setCustomerData: (data: Record<string, any>) => void;
}

interface Place {
    rp_number: any;
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
    const BASE_URL = import.meta.env.VITE_API_URL;

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
    const [successOrderMessage, setSuccessOrderMessage] = useState(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [forceWait, setForceWait] = useState<boolean>(true);

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
        setSuccessMessage(
            `"${newPlace.place_name} " ${currentData?.messages?.place_add_success || "úspěšně vytvořeno!"}`
        );
        setPlaces((prevPlaces) => [...prevPlaces, newPlace]); // Добавляем новое место в список
        setTimeout(() => setSuccessMessage(""), 10000);
        setShowPlaceForm(false); // Скрыть форму после успешного создания
    };



    const handleCreateOrder = () => {
        setCurrentPlaceId(null); // clear placeId
        setShowOrderForm(true);
    };

    const handleOrderSuccess = (data: number | null) => {
        setShowOrderForm(false); // Закрываем форму
        setCurrentPlaceId(null); // обнуляем номер
        setSuccessMessage(currentData?.messages?.order_created || "Objednávka byla úspěšně vytvořena!");
        setTimeout(() => setSuccessMessage(""), 10000);
    };

    const handleCreatePlace = () => {
        setShowPlaceForm(true); // Показываем форму создания места
    };

    const langInstruction1 = {
        cz: "Přidejte svá místa",
        ru: "Добавьте свои места",
        en: "Add your places",
    };
    const lang = currentData?.lang || "cz";
    const formInstruction1 = langInstruction1[lang] || langInstruction1.en;
    const langInstruction2 = {
        cz: "Správce Vám vytvoří ceník",
        ru: "Администратор создает вам прайслист",
        en: "The administrator will create a price list for you",
    };
    const formInstruction2 = langInstruction2[lang] || langInstruction2.en;
    const langInstruction3 = {
        cz: "Počkejte na e-mail o aktivaci účtu",
        ru: "Подождите письмо об активации аккаунта",
        en: "Wait for the email about account activation",
    };
    const formInstruction3 = langInstruction3[lang] || langInstruction3.en;

    useEffect(() => {
        if (location.state?.successMessage) {
            setTimeout(() => {
                setSuccessMessage("");
            }, 10000); // Очистить сообщение через 5 секунд
        }
    }, [location.state]);

    useEffect(() => {
        setLoading(true);
        const fetchPlaces = async () => {
            try {
                const response = await fetchWithAuth(`${BASE_URL}/place/list/`);
                if (response.ok) {
                    const data = await response.json();
                    setPlaces(data);
                    setLoading(false);
                } else {
                    console.error("Failed to fetch places");
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching places:", error);
                setLoading(false);
            }
        };

        fetchPlaces();
        setLoading(false);
        // Ensure skeleton is shown for at least 2 seconds
        const timer = setTimeout(() => setForceWait(false), 1000);
        return () => clearTimeout(timer); // Cleanup
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetchWithAuth(`${BASE_URL}/order/list/`);
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

    useEffect(() => {
        if (showPlaceForm || showOrderForm) {
            // Добавляем класс
            document.body.classList.add("no-scroll");
        } else {
            // Убираем класс
            document.body.classList.remove("no-scroll");
        }

        // Очистка при размонтировании компонента:
        return () => {
            document.body.classList.remove("no-scroll");
        };
    }, [showPlaceForm, showOrderForm]);

    console.log(places);

    if (!currentData || !currentData.service) {  // Если данных нет, компонент ничего не отображает
        return (

            <div className="container margin-top-90 wrapper account-page">
                <div className="row message-block-76">
                    <div className="col-xl-9 col-lg-8 col-12">
                    </div>
                </div>
                <div className="row">
                    <div className="col-xl-9 col-lg-8 col-12">
                        <div id="company-top" className="row">

                            <div className="col-xl-6 col-lg-12 mb-4">
                                <div className="card dashboard-button">
                                    <div className="card-body button-history">
                                        <Skeleton
                                            variant="rectangular"
                                            width={36} height={36}
                                            sx={{ borderRadius: "18px", marginBottom: 2 }}
                                        />
                                        <Skeleton
                                            variant="rectangular"
                                            width={180} height={20}
                                            sx={{ borderRadius: "6px", marginBottom: 0 }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {(!currentData || !currentData.service) ? (
                                [...Array(3)].map((_, index) => (
                                    <div className="col-lg-4 col-xl-2 col-4 mb-4" key={index}>
                                        <div className="card dashboard-button">
                                            <div className="card-body button-history">
                                                <Skeleton
                                                    variant="rectangular"
                                                    width={36} height={36}
                                                    className=""
                                                    sx={{ borderRadius: "18px", marginBottom: 2 }}
                                                />
                                                <Skeleton
                                                    variant="rectangular"
                                                    width={70} height={20}
                                                    className=""
                                                    sx={{ borderRadius: "6px", marginBottom: 0 }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : null }
                        </div>
                    </div>
                </div>
            </div>

        );
    }

    return (
        <div className="container margin-top-90 wrapper account-page">
            <div className="row message-block-76">
                <div className="col-xl-9 col-lg-8 col-12">
                    {successMessage && (
                        <p className="alert alert-success">{successMessage}</p>
                    )}
                </div>
            </div>
            <div className="row">
                <div className="col-xl-9 col-lg-8 col-12">
                    <div id="company-top" className="row">

                        <div className={`${customerData && !customerData.error ? "col-xl-6 col-lg-12 mb-4" : "col-12"}`}>
                            {(customerData && (loading || forceWait)) ? (
                                <>
                                    <div className="card dashboard-button">
                                        <div className="card-body button-history">
                                            <Skeleton
                                                variant="rectangular"
                                                width={36} height={36}
                                                sx={{ borderRadius: "18px", marginBottom: 2 }}
                                            />
                                            <Skeleton
                                                variant="rectangular"
                                                width={180} height={20}
                                                sx={{ borderRadius: "6px", marginBottom: 0 }}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <CompanyInfo
                                    customerData={customerData}
                                    setCustomerData={setCustomerData}
                                    setSuccessMessage={setSuccessMessage}
                                />
                            )}
                        </div>

                        {customerData && !customerData.error && (
                            <>
                                {(customerData && (loading || forceWait)) ? (
                                    [...Array(3)].map((_, index) => (
                                        <div className="col-lg-4 col-xl-2 col-4 mb-4" key={index}>
                                            <div className="card dashboard-button">
                                                <div className="card-body button-history">
                                                    <Skeleton
                                                        variant="rectangular"
                                                        width={36} height={36}
                                                        className=""
                                                        sx={{ borderRadius: "18px", marginBottom: 2 }}
                                                    />
                                                    <Skeleton
                                                        variant="rectangular"
                                                        width={70} height={20}
                                                        className=""
                                                        sx={{ borderRadius: "6px", marginBottom: 0 }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        {!customerData?.active ? (
                                            <div className="instruction col-xl-6 col-12 mb-4">
                                                <div className="card dashboard-button">
                                                    <div className="card-body button-history">
                                                        <p style={{margin:"0"}}>
                                                            1. {formInstruction1}
                                                        </p>
                                                        <p style={{margin:"0"}}>
                                                            2. {formInstruction2}
                                                        </p>
                                                        <p style={{margin:"0"}}>
                                                            3. {formInstruction3}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (<>
                                            <div className="col-lg-4 col-xl-2 col-4 mb-4">
                                                <Link to="/all-orders" className="text-decoration-none">
                                                    <div className="card dashboard-button">
                                                        <div className="card-body button-history">
                                                            <FontAwesomeIcon icon={faClockRotateLeft} className="icon" />
                                                            <p className="text-history">
                                                                {currentData.buttons["all_history"] || "Historie objednávek"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>

                                            <div className="col-lg-4 col-xl-2 col-4">
                                                <Link to="/invoices" className="text-decoration-none">
                                                    <div className="card dashboard-button">
                                                        <div className="card-body">
                                                            <FontAwesomeIcon icon={faFileInvoiceDollar} className="icon" />
                                                            <p className="text-history">{currentData.buttons["invoices"] || "Faktury"}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>

                                            <div className="col-lg-4 col-xl-2 col-4">
                                                {/* New Order Button */}
                                                <div className="card dashboard-button" onClick={handleCreateOrder}>
                                                    <div className="card-body">
                                                        <FontAwesomeIcon icon={faCartPlus} className="icon" />
                                                        <p className="text-history">{currentData.buttons["new_order"] || "Nová objednávka"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>)}



                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {showPlaceForm && (
                        <PlaceForm
                            onClose={() => setShowPlaceForm(false)}
                            onSuccess={handleSuccess}
                        />
                    )}

                    <div className="row mt-mobile">

                        {places.length === 0 ? (
                            <>
                                {customerData && !customerData.error && (
                                    <div className="col-xl-4 col-12">
                                        <p style={{fontSize: "20px", marginTop: "15px"}}>{currentData.customer["you_dont_have_place"] || "Nemáte žádné místo"}</p>
                                    </div>
                                )}
                            </>

                        ) : (
                            <div className="col-lg-4 col-md-8 col-sm-7 col-6" style={{ paddingTop: "16px" }}>
                                <h4>{currentData.customer["your_places"] || "Vaše místa"}</h4>
                            </div>
                        )}

                        <div className="col-lg-3 col-md-4 col-sm-5 col-6 text-left place-desktop-button">
                            {(customerData && (loading || forceWait)) ? (
                                <Skeleton
                                    variant="rectangular"
                                    width={200} height={55}
                                    className="btn-link-skeleton"
                                    sx={{ borderRadius: "26px", marginTop: 0 }}
                                />
                            ) : (
                                <>
                                    {customerData && !customerData.error && (
                                        <button className="btn-link" onClick={handleCreatePlace}>
                                            <FontAwesomeIcon icon={faHouse} className="icon" />
                                            <span className="ms-2">
                                                {currentData.buttons["add_place"] || "Přidat nové místo"}
                                            </span>

                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="row mt-4 mb-4">
                        {(customerData && (loading || forceWait)) ? (
                            [...Array(2)].map((_, index) => (
                                <div className="col-12 dashboard" key={index}>
                                    <div className="card place-card">
                                        <div className="place">
                                            <div className="place-icon-skeleton"></div>
                                            <Skeleton
                                                variant="rectangular"
                                                width={140} height={20}
                                                className="mt-1"
                                                sx={{ borderRadius: "6px", marginTop: 0 }}
                                            />
                                            <Skeleton
                                                variant="rectangular"
                                                width={200} height={20}
                                                className=""
                                                sx={{ borderRadius: "6px", marginTop: 1 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : ( <>
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
                                            <h5 className="place-card-name">{place.place_name}</h5>
                                            <p className="card-text">
                                                {place.rp_street} {place.rp_number}, {place.rp_city}, {place.rp_zip}
                                            </p>
                                            <button
                                                className= {`${place.data_sent ? "call new-order-button" : "display-none"}`}
                                                onClick={() => {
                                                    setCurrentPlaceId(place.id);
                                                    setShowOrderForm(true);
                                                }}
                                            >
                                                <span className="text-new-order-in-button">
                                                    {currentData.buttons["new_order"] || "Nová objednávka"}
                                                </span>
                                                <FontAwesomeIcon icon={faCartPlus} className="icon order-mobile" />
                                            </button>
                                            <button
                                                onClick={() => place.id && navigate(`/place/${place.id}`)}
                                                disabled={!place.id} // Отключаем кнопку, если нет ID
                                                className={`call details-place-button${place.data_sent ? "" : " detail-not-sent"}`}
                                            >
                                                {currentData.buttons["details"] || "Detail"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </> )}
                    </div>
                    <div className="row place-mobile-button text-center">
                        <div className="col-12 text-center">
                            {loading || forceWait ? (
                                <Skeleton
                                    variant="rectangular"
                                    width={200} height={55}
                                    className="btn-link-skeleton"
                                    sx={{ borderRadius: "26px", marginTop: 0 }}
                                />
                            ) : (
                                <>
                                    {customerData && !customerData.error && (
                                        <button className="btn-link" onClick={handleCreatePlace}>
                                            <FontAwesomeIcon icon={faHouse} className="icon" />
                                            <span className="ms-2">
                                                {currentData.buttons["add_place"] || "Přidat nové místo"}
                                            </span>

                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/*History block*/}
                <div className="col-xl-3 col-lg-2 col-history">
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
                                    orders={orders}
                                    setOrders={setOrders}
                                    hasMoreOrders={visibleOrders < orders.length}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showOrderForm && (
                <OrderForm
                    placeId={currentPlaceId ?? ""}
                    onClose={() => setShowOrderForm(false)}
                    onSuccess={(newOrder) => {
                        setOrders((prevOrders) => [...prevOrders, newOrder]);
                        handleOrderSuccess(currentPlaceId);
                        setSuccessOrderMessage(newOrder);
                    }}
                />
            )}

            {successOrderMessage && (
                <OrderSuccess newOrder={successOrderMessage} onClose={() => setSuccessOrderMessage(null)} />
            )}
        </div>
    );
};

export default Account;