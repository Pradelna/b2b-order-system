import React, {useState, useEffect, useContext} from "react";
import { LanguageContext } from "../../context/LanguageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck, faFileLines, faCheckCircle, faBan } from "@fortawesome/free-solid-svg-icons";
import { fetchWithAuth } from "../account/auth.ts";
import { Tooltip as ReactTooltip } from "react-tooltip";
import {Form} from "react-router-dom";
import {Skeleton} from "@mui/material";
import { formatDate } from "../utils/formatDate";

interface Order {
    id: number;
    place_name: string;
    date_pickup: string;
    date_delivery: string;
}

interface OrderHistoryProps {
    placeId: number; // ID of the place to load orders for
    hasMoreOrders: boolean;
    orders?: Order[]; // Сделано необязательным для защиты
    setOrders?: (orders: Order[]) => void; // Передача функции для обновления списка заказов
    stopedOrder?: Order;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ placeId, orders = [], setOrders, stopedOrder}) => {
    const [visibleOrders, setVisibleOrders] = useState<number>(10);
    const [hasMoreOrders, setHasMoreOrders] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [expandedOrders, setExpandedOrders] = useState<{ [key: number]: boolean }>({});
    const [cancelableOrders, setCancelableOrders] = useState<{ [key: number]: boolean }>({});
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [updatedOrder, setUpdatedOrder] = useState<any>(null);
    const [forceWait, setForceWait] = useState<boolean>(true);
    const BASE_URL = import.meta.env.VITE_API_URL;
    const { currentData } = useContext(LanguageContext);

    // Fetch orders from the API
    const fetchOrders = async () => {
        try {
            // console.log("Fetching orders for place ID", placeId);
            const response = await fetchWithAuth(`${BASE_URL}/order/${placeId}/orders/`);
            if (response.ok) {
                const data: Order[] = await response.json();
                if (setOrders) {
                    setOrders(data);
                }
                setHasMoreOrders(data.length > 10);
            } else {
                console.error("Failed to fetch orders");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };


    // Load more orders when the user clicks "More"
    const loadMoreOrders = () => {
        setVisibleOrders((prev) => {
            const newVisibleCount = prev + 10;
            setHasMoreOrders(newVisibleCount < orders.length);
            return newVisibleCount;
        });
    };

    const toggleExpand = (orderId: number) => {
        setExpandedOrders((prev) => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };


    const handleCancelOrder = async (orderId: number) => {
        if (window.confirm("Are you sure you want to cancel this order?")) {
            try {
                const response = await fetchWithAuth(`${BASE_URL}/order/update/${orderId}/`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ canceled: true }),
                });

                if (response.ok) {
                    const dataUpdatedOrder = await response.json();
                    setUpdatedOrder(dataUpdatedOrder)
                    setSuccessMessage("Order successfully canceled!.");
                    setTimeout(() => setSuccessMessage(""), 10000);
                } else {
                    console.error("Failed to stop order.");
                }
            } catch (error) {
                console.error("Error stopping order:", error);
            }
        }
    };

    useEffect(() => {
        const checkCancelableOrders = () => {
            const now = new Date().getTime();
            const updatedCancelableOrders: { [key: number]: boolean } = {};
            orders.forEach((order) => {
                const createdTime = new Date(order.created_at).getTime();
                const timeDiff = (now - createdTime) / 60000; // Разница в минутах
                updatedCancelableOrders[order.id] = timeDiff < 30;
            });
            setCancelableOrders(updatedCancelableOrders);
        };

        checkCancelableOrders();
        const interval = setInterval(checkCancelableOrders, 60000); // Проверять каждую минуту
        return () => clearInterval(interval);
    }, [orders]);

    useEffect(() => {
        if (!placeId) {
            console.error("Invalid placeId:", placeId);
            return;
        }
        fetchOrders();
        // Ensure skeleton is shown for at least 2 seconds
        const timer = setTimeout(() => setForceWait(false), 1000);
        return () => clearTimeout(timer); // Cleanup
    }, [placeId]);


    return (
        <div className="order-history mb-5">
            <h3 className="account-info">Order History</h3>
            <h3 className="detail-info">{orders.length > 0 ? orders[0].place_name : ""}</h3>
            {successMessage && (
                <p className="alert alert-success mb-3">{successMessage}</p>
            )}

            {loading || forceWait ? (
                [...Array(3)].map((_, index) => (
                    <div className="col-12 dashboard" key={index}>

                        <div className="card">
                            <div className="place-icon-skeleton"></div>
                            <Skeleton
                                variant="rectangular"
                                width={140} height={20}
                                className=""
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
                ))
            ) : (
                <>

                    {orders.length > 0 ? (
                        <div>
                            {orders.slice(0, visibleOrders)
                                // .sort((a, b) => b.id - a.id)
                                .map((order) => (
                                    <div
                                        key={order.id}
                                        className={`card ${expandedOrders[order.id] ? "expanded" : ""}`}
                                        onClick={() => toggleExpand(order.id)}
                                    >
                                        <div className="history-icon">
                                            <FontAwesomeIcon icon={faTruck} />
                                        </div>

                                        <div className="receipt-icon">
                                            <FontAwesomeIcon
                                                icon={faFileLines}
                                                data-tooltip-id="receipt-tooltip"
                                                style={{ cursor: "pointer" }}
                                            />
                                            <ReactTooltip
                                                id="receipt-tooltip"
                                                place="top"
                                                content="Download dodaci list"
                                                effect="solid"
                                                className="custom-tooltip"
                                            />
                                        </div>
                                        <p>
                                            {order.canceled || (updatedOrder?.id === order.id) ? (
                                                <>
                                                    <FontAwesomeIcon icon={faBan} style={{ color: "red", height: "18px" }}/>
                                                    <strong className="ms-2">Canceled</strong>
                                                </>
                                            ) : (
                                                <>
                                                    {cancelableOrders[order.id] && !order.canceled ? (
                                                        <>
                                                            <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#00aab7", height: "18px" }}/>
                                                            <strong className="ms-2">New</strong>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#00aab7", height: "18px" }}/>
                                                            <strong className="ms-2">Completed</strong>
                                                        </>
                                                    )}

                                                </>
                                            )}
                                        </p>
                                        {order.rp_time_realization && (
                                            <p>
                                                <strong>Realization Date:</strong> {order.rp_time_realization || " No information"}
                                            </p>
                                        )}

                                        <p>
                                            <strong>Number order:</strong> {order.id}
                                        </p>
                                        {/* Дополнительная информация показывается только если карточка развернута */}
                                        {expandedOrders[order.id] && (
                                            <div className="expanded-content">
                                                {/* if order is repeating */}
                                                {order.every_week ? (
                                                    <>
                                                        <p><strong>Regular repeating order</strong></p>
                                                        {/* Type of Shipping */}
                                                        <p><strong>Type of Shipping: </strong>
                                                            {order.type_ship === "quick_order" && (<>
                                                                {currentData.order?.quick}
                                                            </>)}
                                                            {order.type_ship === "pickup_ship_one" && (<>
                                                                {currentData.order?.type_sipping_clear_for_dirty}
                                                            </>)}
                                                            {order.type_ship === "pickup_ship_dif" && (<>
                                                                {currentData.order?.type_sipping_1_in_3}
                                                            </>)}</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        {/* if order is one time */}
                                                        {order.type_ship === "quick_order" ? (<>
                                                            {currentData.order?.quick}
                                                        </>) : (
                                                            <>
                                                                {currentData.order?.one_time || "one time order"}
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                                <p><strong>Pickup Date:</strong> {formatDate(order.rp_time_from)}</p>
                                                <p><strong>Delivery Date:</strong> {formatDate(order.rp_time_to)}</p>
                                            </div>
                                        )}
                                        {/* Кнопка отмены заказа (только если заказ можно отменить) */}
                                        {cancelableOrders[order.id] && !order.canceled && (updatedOrder?.id !== order.id) && (
                                            <button
                                                className="btn btn-link cancel-order"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Чтобы не срабатывал toggleExpand
                                                    handleCancelOrder(order.id);
                                                }}
                                            >
                                                Cancel Order
                                            </button>
                                        )}

                                    </div>
                                ))}
                            {hasMoreOrders && (
                                <button onClick={loadMoreOrders} className="btn btn-history btn-link mt-3 mb-5">
                                    More
                                </button>
                            )}
                        </div>
                    ) : (
                        <p>No order history available.</p>
                    )}

                </>)}

        </div>
    );
};

export default OrderHistory;