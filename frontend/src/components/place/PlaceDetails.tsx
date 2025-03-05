import React, { useState, useEffect, useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPenToSquare,
    faSquareXmark,
    faCartPlus,
    faPowerOff,
    faCircleCheck,
    faStopwatch, faFileInvoiceDollar
} from "@fortawesome/free-solid-svg-icons";
import HeaderAccount from "../HeaderAccount";
import Footer from "../Footer";
import PlaceEdit from "./PlaceEdit";
import OrderForm from "../order/OrderForm";
import OrderHistory from "../order/OrderHistory";
import OrderSuccess from "../order/OrderSuccess";
import { fetchWithAuth } from "../account/auth.ts";
import {Tooltip as ReactTooltip} from "react-tooltip";
import NavButtons from "@/components/account/NavButtons";
import {Skeleton} from "@mui/material";
import { formatDate } from "@/components/utils/FormatDate";
import { formatViceDate } from "@/components/utils/FormatViceDate";



interface Place {
    rp_number: any;
    id: number;
    place_name: string;
    rp_street: string;
    rp_city: string;
    rp_zip: string;
    rp_person: string;
    rp_phone: string;
    rp_email: string;
}

interface Order {
    id: number;
    rp_status: number;
    type_ship: string;
    system: string | null;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    date_pickup: string;
    date_delivery: string;
    rp_problem_description: string | null;
    every_week: boolean;
    end_order: boolean;
}

const PlaceDetails: React.FC = () => {
    const BASE_URL = import.meta.env.VITE_API_URL;
    const { currentData } = useContext(LanguageContext);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [place, setPlace] = useState<Place | null>(null);
    const [customerId, setCustomerId] = useState<Customer | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showEditForm, setShowEditForm] = useState<boolean>(false);
    const [showOrderForm, setShowOrderForm] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [successOrderMessage, setSuccessOrderMessage] = useState(null);

    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [orderHistory, setOrderHistory] = useState<Order[]>([]);
    const [visibleOrders, setVisibleOrders] = useState<number>(10);
    const [hasMoreOrders, setHasMoreOrders] = useState<boolean>(false);
    const [forceWait, setForceWait] = useState<boolean>(true);
    const [stopedOrder, setStopedOrder] = useState<any>(null);
    const [startDates, setStartDates] = useState<any>(null);
    const [expandedDates, setExpandedDates] = useState(false);
    const [cancelableOrders, setCancelableOrders] = useState(false); // to check if order longer 30 min
    const [notActivePlace, setNotActivePlace] = useState(false);


    // Функция для проверки, можно ли отменять заказ
    const checkTimeElapsed = (order: Order) => {
        const now = new Date().getTime(); // Текущее время
        const orderTime = new Date(order.created_at).getTime(); // Время заказа
        const timeDifference = now - orderTime; // Разница во времени (в миллисекундах)
        const thirtyMinutes = 30 * 60 * 1000; // 30 минут в миллисекундах
        return timeDifference >= thirtyMinutes; // Возвращает true, если прошло 30 минут
    };

    // get all orders
    const fetchOrders = async () => {
        try {
            // order of the place
            const response = await fetchWithAuth(
                `${BASE_URL}/order/${id}/orders/`
            );
            if (response.ok) {
                const orders: Order[] = await response.json();
                // get all repeated orders with end_order = flase
                const repeatOrders = orders.filter((order) => order.every_week && !order.end_order);
                // get least order id
                const current = repeatOrders.sort((a, b) => a.id - b.id)
                    .find((order) => order.every_week && !order.end_order);
                // Извлекаем даты в массив
                const startDatesList = repeatOrders.map(order => order.date_start_day);
                setStartDates(startDatesList);
                const history = orders.filter(
                    (order) => !(order.every_week && !order.end_order)
                );

                setCurrentOrder(current || null);
                setOrderHistory(history);
                setHasMoreOrders(history.length > 10);
                // Проверяем сразу, можно ли отменить заказ
                if (current && checkTimeElapsed(current)) {
                    setCancelableOrders(true);
                }
            } else {
                console.error("Failed to fetch orders");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = async () => {
        // deleting of the place
        if (window.confirm("Are you sure you want to delete this place?")) {
            try {
                const response = await fetchWithAuth(
                    `${BASE_URL}/place/delete/${id}/`,
                    { method: "DELETE" }
                );
                if (response.ok) {
                    navigate("/account", {
                        state: { successMessage: "Place deleted successfully!" },
                    });
                } else {
                    console.error("Failed to delete place.");
                }
            } catch (error) {
                console.error("Error deleting place:", error);
            }
        }
    };

    const handleStopOrder = async (orderId: number) => {
        // stop repeat order
        if (window.confirm("Are you sure you want to cancel this order?")) {
            try {
                const response = await fetchWithAuth(`${BASE_URL}/order/update/${orderId}/`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ end_order: true, rp_status: 10, rp_customer_note: "storno" }),
                });

                if (response.ok) {
                    const updatedOrder = await response.json();
                    setCurrentOrder(null); // del current order
                    setStopedOrder(updatedOrder);
                    setOrderHistory((prevOrders) => {
                        // add ex current order
                        if (prevOrders.some((order) => order.id === updatedOrder.id)) {
                            return prevOrders;
                        }
                        return [updatedOrder, ...prevOrders];
                    });
                    setSuccessMessage("Order successfully stopped.");
                    setTimeout(() => setSuccessMessage(""), 10000);
                } else {
                    console.error("Failed to stop order.");
                }
            } catch (error) {
                console.error("Error stopping order:", error);
            }
        }
    };

    const toggleExpand = () => {
        setExpandedDates(!expandedDates);
    };

    useEffect(() => {
        // info about place
        const fetchPlace = async () => {
            try {
                const response = await fetchWithAuth(
                    `${BASE_URL}/place/${id}/`
                );
                if (response.ok) {
                    const data = await response.json();
                    setPlace(data);
                    setCustomerId(data.customer);
                    if (data.data_sent === false) {
                        setNotActivePlace(true)
                    } else {
                        setNotActivePlace(false)
                    };
                } else {
                    console.error("Failed to fetch place details.");
                }
            } catch (error) {
                console.error("Error fetching place:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlace();
        // Ensure skeleton is shown for at least 2 seconds
        const timer = setTimeout(() => setForceWait(false), 1000);
        return () => clearTimeout(timer); // Cleanup
    }, [id, customerId]);

    useEffect(() => {
        fetchOrders();
        // Ensure skeleton is shown for at least 2 seconds
        const timer = setTimeout(() => setForceWait(false), 1000);
        return () => clearTimeout(timer); // Cleanup
    }, [id]);

    // check if order is old then 30 minut
    useEffect(() => {
        if (!currentOrder) return; // Если заказа нет, не запускаем таймер

        const timer = setInterval(() => {
            if (checkTimeElapsed(currentOrder)) {
                setCancelableOrders(true);
                clearInterval(timer); // Останавливаем таймер после установки true
            }
        }, 60000); // Проверяем каждую минуту

        return () => clearInterval(timer); // Очищаем таймер при размонтировании компонента
    }, [currentOrder]); // Зависимость — currentOrder

    if (!place) return <p>Place not found.</p>;

    return (
        <>
            <HeaderAccount customerId={customerId} />

            <div className="container margin-top-90 wrapper place-detail-page">
                <div className="row message-block">
                    <div className="col-1 back-button">
                        <NavButtons />
                    </div>
                    <div className="col-lg-6 col-md-9 col-11">
                        {successMessage && (
                            <p className="alert alert-success">{successMessage}</p>
                        )}
                    </div>
                </div>
                <div className="row other-card">

                    <div className="col-lg-7 col-md-10 col-12">

                        {loading || forceWait ? (
                            <div className="card place-details">
                                <Skeleton
                                    variant="rectangular"
                                    width={130} height={36}
                                    sx={{ borderRadius: "6px", marginBottom: 2 }}
                                />
                                <Skeleton
                                    variant="rectangular"
                                    width="100%" height={36}
                                    sx={{ borderRadius: "18px", marginBottom: 1 }}
                                />
                                <Skeleton
                                    variant="rectangular"
                                    width="100%" height={36}
                                    sx={{ borderRadius: "18px", marginBottom: 1 }}
                                />
                                <Skeleton
                                    variant="rectangular"
                                    width="100%" height={36}
                                    sx={{ borderRadius: "18px", marginBottom: 1 }}
                                />
                            </div>
                        ) : (
                            <div className="card place-details">
                                {!showEditForm ? (
                                    <>
                                        <FontAwesomeIcon
                                            icon={faPenToSquare}
                                            className="settings"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => setShowEditForm(true)}
                                            data-tooltip-id="edit-card-tooltip"
                                        />
                                        <ReactTooltip
                                            id="edit-card-tooltip"
                                            place="top"
                                            arrowPlace="top"
                                            effect="solid"
                                            delayShow={120}
                                            content="Edit place information"
                                            globalEventOff="click"
                                        />
                                    </>
                                ) : (
                                    <FontAwesomeIcon
                                        icon={faSquareXmark}
                                        className="settings"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => setShowEditForm(false)}
                                        data-tooltip-id="close-tooltip"
                                    />
                                )}

                                <ReactTooltip
                                    id="close-tooltip"
                                    place="top"
                                    effect="solid"
                                    delayShow={100}
                                    content="Close"
                                    className="custom-tooltip"
                                    globalEventOff="click"
                                />
                                <h1>Place Details</h1>
                                {!showEditForm ? (
                                    <div>
                                        <div className="row mb-2">
                                            <div className="col-12">
                                                <div className="form-control">
                                                    <strong>Name:</strong> {place.place_name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row mb-2">
                                            <div className="col-12">
                                                <div className="form-control">
                                                    <strong>Address:</strong>{" "}
                                                    {place.rp_street},{" "}
                                                    {place.rp_number},{" "}
                                                    {place.rp_city},{" "}
                                                    {place.rp_zip}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row mb-2">
                                            <div className="col-12">
                                                <div className="form-control">
                                                    <strong>Contact Person:</strong> {place.rp_person}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className="btn-submit mt-3"
                                            onClick={() => setShowOrderForm(true)}
                                            disabled={notActivePlace}
                                        >
                                            <FontAwesomeIcon icon={faCartPlus} className="icon" />
                                            <span className="ms-3">New Order</span>
                                        </button>
                                    </div>
                                ) : (
                                    <PlaceEdit
                                        place={place}
                                        onClose={() => setShowEditForm(false)}
                                        onPlaceUpdated={setPlace}
                                        onDelete={handleDelete}
                                    />
                                )}
                            </div>
                        )}

                    </div>


                </div>

                {loading || forceWait ? (<></>) : (<>
                    {currentOrder && (
                        <div className="row current-order other-card">
                            <div className="col-lg-7 col-md-10 col-12">
                                <div className="card current-order">

                                    <h3>Current Order #{currentOrder.id}</h3>
                                    <div className="order-details">

                                        <div className="form-control mb-2">
                                            <strong>Day of next visit: </strong>
                                            { formatDate(currentOrder.rp_time_planned)  || " None "}
                                        </div>
                                        <div className="form-control dates mb-2">
                                            <div onClick={toggleExpand} style={{ cursor: "pointer" }}>
                                                <strong>{expandedDates ? "Close upcoming Start Dates" : "Show upcoming Start Dates"}</strong>
                                            </div>

                                            <div
                                                className={`collapsible ${expandedDates ? "expanded" : ""}`}
                                                style={{
                                                    maxHeight: expandedDates ? "500px" : "0",
                                                    overflow: "hidden",
                                                    transition: "max-height 0.3s ease-in-out",
                                                }}
                                            >
                                                <ul>
                                                    {startDates.map((date, index) => (
                                                        <li key={index}>{formatViceDate(date)}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="form-control mb-2">
                                            <strong>Status:</strong>
                                            {order.rp_status === 0 && (" Nová")}
                                            {order.rp_status === 1 && (" In progress 1")}
                                            {order.rp_status === 2 && (" Přiřazeno")}
                                            {order.rp_status === 3 && (" V procesu")}
                                            {order.rp_status === 4 && (" Dokončeno")}
                                            {order.rp_status === 5 && (" Complited 5")}
                                            {order.rp_status === 6 && (" Ověřeno")}
                                            {order.rp_status === 7 && (" Odmítnuto")}
                                            {order.rp_status === 8 && (" Neznámý status")}
                                            {order.rp_status === 9 && (" Odloženo")}
                                            {order.rp_status === 10 && (" Storno")}
                                            {order.rp_status === 11 && (" K fakturaci")}
                                            {order.rp_status === 12 && (" Čeká na díl")}
                                            {order.rp_status === 13 && (" Marný výjezd")}
                                        </div>
                                        <div className="form-control mb-2">
                                            <strong>Type of Shipping:</strong>
                                            {currentOrder.type_ship === "pickup_ship_dif" && (" zber špinavého a dodanie čistého na tretí deň")}
                                            {currentOrder.type_ship === "pickup_ship_one" && (" čisté prádlo za špinavé")}
                                            {currentOrder.type_ship === "one_time" && (" One time order")}
                                        </div>
                                        {currentOrder.type_ship != "pickup_ship_dif" && (
                                            <div className="form-control mb-2">
                                                <strong>System:</strong>
                                                {currentOrder.system === "Mon_Wed_Fri" && (" Monday Wendsdey Friday")}
                                                {currentOrder.system === "Tue_Thu" && (" Tuesday Thusday")}
                                                {currentOrder.system === "Every_day" && (" Every day")}
                                                {currentOrder.system === "Own" && (" Own")}
                                            </div>
                                        )}

                                        {currentOrder.system === "Own" && (
                                            <div className="form-control mb-2">
                                                <strong>Days: </strong>

                                                {currentOrder.monday && <span>Monday </span>}
                                                {currentOrder.tuesday && <span>Tuesday </span>}
                                                {currentOrder.wednesday && <span>Wednesday </span>}
                                                {currentOrder.thursday && <span>Thursday </span>}
                                                {currentOrder.friday && <span>Friday </span>}

                                            </div>
                                        )}
                                        {currentOrder.type_ship === "one_time" && (
                                            <>
                                                <div className="form-control mb-2">
                                                    <strong>Pickup Date:</strong> {currentOrder.date_pickup}
                                                </div>
                                                <div className="form-control mb-2">
                                                    <strong>Delivery Date:</strong> {currentOrder.date_delivery}
                                                </div>
                                            </>
                                        )}

                                        {/*<div className="form-control mb-2">*/}
                                        {/*    <strong>Customer note:</strong> {currentOrder.rp_customer_note || "None"}*/}
                                        {/*</div>*/}

                                        {currentOrder.rp_problem_description && (
                                            <div className="form-control mb-2">
                                                <strong>Customer note:</strong> {currentOrder.rp_problem_description || "None"}
                                            </div>
                                        )}

                                    </div>

                                    {!cancelableOrders && (
                                        <button
                                            className="btn-link mt-2"
                                            onClick={() => handleStopOrder(currentOrder!.id)}
                                        >
                                            <FontAwesomeIcon icon={faPowerOff} className="icon" />
                                            <span className="ms-2">cancel this order</span>
                                        </button>
                                    )}


                                </div>
                            </div>
                        </div>
                    )}
                </>)}

                <div className="row mt-4">
                    <div className="col-lg-7 col-md-10 col-12">
                        <OrderHistory
                            placeId={place.id}
                            hasMoreOrders={false}
                            orders={orderHistory}
                            setOrders={setOrderHistory}
                            stopedOrder={stopedOrder}
                        />
                    </div>
                </div>

                {showOrderForm && (
                    <OrderForm
                        placeId={place.id}
                        onClose={() => setShowOrderForm(false)}
                        onSuccess={(newOrder) => {
                            // add a new order to the list
                            setOrderHistory((prevOrders) => [newOrder, ...prevOrders]);
                            // Обновляем текущий заказ, если он активный
                            if (newOrder.every_week && !newOrder.end_order) {
                                setCurrentOrder(newOrder);
                            }
                            setSuccessMessage(
                                `Order created successfully`
                            );
                            setTimeout(() => setSuccessMessage(""), 10000);
                            setShowOrderForm(false);
                            setSuccessOrderMessage(newOrder);
                            // Обновляем данные из API
                            fetchOrders();
                        }}
                    />
                )}

                {successOrderMessage && (
                    <OrderSuccess newOrder={successOrderMessage} onClose={() => setSuccessOrderMessage(null)} />
                )}
            </div>
            <Footer />
        </>
    );
};

export default PlaceDetails;