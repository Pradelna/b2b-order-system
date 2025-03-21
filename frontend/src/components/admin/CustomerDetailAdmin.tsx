import React, { useState, useEffect, useContext } from "react";
import {useNavigate, useLocation, Link, useParams} from "react-router-dom";
import CompanyInfoAdmin from "./CompanyInfoAdmin";
import OrderHistoryAdmin from "./OrderHistoryAdmin";
import { fetchWithAuth } from "../account/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClockRotateLeft,
    faHouse,
    faFileInvoiceDollar,
    faCircleCheck,
    faStopwatch
} from "@fortawesome/free-solid-svg-icons";
import {Skeleton} from "@mui/material";
import HeaderAdmin from "./HeaderAdmin";
import FooterAccount from "../FooterAccount";
import CustomerFormAdmin from "./CustomerFormAdmin";
import UploadFileAdmin from "./UploadFileAdmin";
import AllHistoryAdmin from "./AllHistoryAdmin";

interface Place {
    rp_number: any;
    id: number;
    place_name: string;
    rp_city: string;
    rp_street: string;
    rp_zip: string;
}

const CustomerDetailAdmin: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const BASE_URL = import.meta.env.VITE_API_URL;
    const [customerData, setCustomerData] = useState(null);

    const [cardStyle, setCardStyle] = useState<React.CSSProperties>({ display: "none" });
    const [cardContent, setCardContent] = useState<string>("");
    const [activeButton, setActiveButton] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>(location.state?.successMessage || "");
    const [showPlaceForm, setShowPlaceForm] = useState<boolean>(false);
    const [places, setPlaces] = useState<Place[]>([]);
    const [orders, setOrders] = useState<Record<string, any>[]>([]);
    const [visibleOrders, setVisibleOrders] = useState<number>(5);
    const [showOrderForm, setShowOrderForm] = useState<boolean>(false);
    const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [forceWait, setForceWait] = useState<boolean>(true);
    const [isEditing, setIsEditing] = useState<boolean>(false);

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
        setTimeout(() => setSuccessMessage(""), 10000);
        setShowPlaceForm(false); // Скрыть форму после успешного создания
    };



    const handleCreateOrder = () => {
        setShowOrderForm(true); // Показываем форму создания заказа
    };

    const handleOrderSuccess = (data: number | null) => {
        setShowOrderForm(false); // Закрываем форму
        setCurrentPlaceId(null); // обнуляем номер
        setSuccessMessage("Order created successfully!");
        setTimeout(() => setSuccessMessage(""), 10000);
    };


    useEffect(() => {
        if (location.state?.successMessage) {
            setTimeout(() => {
                setSuccessMessage("");
            }, 10000); // Очистить сообщение через 5 секунд
        }
    }, [location.state]);

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const response = await fetchWithAuth(`${BASE_URL}/admin/adminpanel/customer/detail/${customerId}/`);
                if (response.ok) {
                    const data = await response.json();
                    setCustomerData(data.customer);
                    // console.log(data.customer);
                } else {
                    console.error("Error fetching customer data");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerData();
    }, [customerId]);

    useEffect(() => {
        setLoading(true);
        const fetchPlaces = async () => {
            try {
                const response = await fetchWithAuth(`${BASE_URL}/admin/adminpanel/customer-place/list/${customerId}`);
                if (response.ok) {
                    const data = await response.json();
                    // console.log(data);
                    setPlaces(data.places);
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

    return (
        <>
        <HeaderAdmin />
        <div className="container margin-top-90 wrapper account-page">
            <div className="row message-block-76">
                <div className="col-xl-9 col-lg-8 col-12">
                    {successMessage && (
                        <p className="alert alert-success">{successMessage}</p>
                    )}
                </div>
            </div>
            <div id="company-top-admin" className="row">

                <div className="row">

                    <div className="col-xl-7 col-lg-8 col-12 mb-4">
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
                        ) : ( <>

                            {isEditing ? (
                                <CustomerFormAdmin
                                    customerData={customerData}
                                    setCustomerData={setCustomerData}
                                    setSuccessMessage={setSuccessMessage}
                                    setIsEditing={setIsEditing}
                                />
                            ) : (
                                <CompanyInfoAdmin
                                    customerData={customerData}
                                    setCustomerData={setCustomerData}
                                    setSuccessMessage={setSuccessMessage}
                                    setIsEditing={setIsEditing}
                                />
                            )}
                        </>

                        )}
                    </div>

                    {customerData && !customerData.error && (
                        <>
                            <div className="col-xl-5 col-lg-8 col-12">
                            <div className="row">


                                    {(customerData && (loading || forceWait)) ? (
                                        [...Array(2)].map((_, index) => (
                                            <div className="col-lg-4 col-xl-7 col-4 mb-4" key={index}>
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

                                            <div className="col-lg-6 col-xl-7 col-4 mb-4">
                                                <Link to={`/admin/user-history/${customerId}`} className="text-decoration-none">
                                                    <div className="card dashboard-button" style={{height:'146px'}}>
                                                        <div className="card-body button-history">
                                                            <FontAwesomeIcon icon={faClockRotateLeft} className="icon" />
                                                            <p className="text-history">
                                                                Historie objednávek
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>

                                            <div className="col-lg-6 col-xl-7 col-4">
                                                <Link to={`/admin/user-invoices/${customerId}`} className="text-decoration-none">
                                                    <div className="card dashboard-button" style={{height:'145px'}}>
                                                        <div className="card-body">
                                                            <FontAwesomeIcon icon={faFileInvoiceDollar} className="icon" />
                                                            <p className="text-history">Faktury</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>

                                        </>
                                    )}
                                </div>
                            </div>

                        </>
                    )}

                </div>


                <div className="row mt-mobile mb-4">

                    <div className="col-xl-7 col-lg-8 col-12 mb-4">

                        <UploadFileAdmin customer_id={customerData?.user_id}/>

                        {places.length === 0 ? (<>
                            {customerData && !customerData.error && (
                                <p style={{fontSize: "20px", marginTop: "15px"}}>Nemá žádné místo</p>
                            )}
                        </>) : (<h4 style={{fontSize: "20px", marginTop: "30px"}}>Místa</h4>)}


                        <div className="row mb-4">
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
                                                    onClick={() => place.id && navigate(`/admin/place-detail/${place.id}`)}
                                                    disabled={!place.id} // Отключаем кнопку, если нет ID
                                                    className="call details-place-button"
                                                >
                                                    Detail
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </> )}
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
                                    onClick={() => selectedPlaceId && navigate(`/admin/place-detail/${selectedPlaceId}`)}
                                    disabled={!selectedPlaceId} // Отключаем кнопку, если место не выбрано
                                    className="details-place-button-in-history"
                                >
                                    Whole history
                                </button>
                                <h5>Orders history for</h5>
                                <div className="mt-1">
                                    <OrderHistoryAdmin
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

            </div>

        </div>

    <FooterAccount />
        </>
    );
};

export default CustomerDetailAdmin;