import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck, faFileLines, faCheckCircle, faBan } from "@fortawesome/free-solid-svg-icons";
import { fetchWithAuth } from "../account/auth";
import { Tooltip as ReactTooltip } from "react-tooltip";
import {Form} from "react-router-dom";

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
}

const AllOrderHistory: React.FC<OrderHistoryProps> = ({ placeId, orders = [], setOrders}) => {
    const [visibleOrders, setVisibleOrders] = useState<number>(10);
    const [hasMoreOrders, setHasMoreOrders] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [expandedOrders, setExpandedOrders] = useState<{ [key: number]: boolean }>({});
    const [cancelableOrders, setCancelableOrders] = useState<{ [key: number]: boolean }>({});
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [updatedOrder, setUpdatedOrder] = useState<any>(null);

    // Fetch orders from the API
    const fetchOrders = async () => {
        try {
            // console.log("Fetching orders for place ID", placeId);
            const response = await fetchWithAuth(`http://127.0.0.1:8000/api/order/${placeId}/orders/`);
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


    useEffect(() => {
        if (!placeId) {
            console.error("Invalid placeId:", placeId);
            return;
        }
        fetchOrders();
    }, [placeId]);

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

    const handleCancelOrder = async (orderId: number) => {
        if (window.confirm("Are you sure you want to cancel this order?")) {
            try {
                const response = await fetchWithAuth(`http://127.0.0.1:8000/api/order/update/${orderId}/`, {
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

    if (loading) {
        return <p>Loading order history...</p>;
    }

    return (
        <div className="order-history">
            <h3 className="account-info">Order History</h3>
            <h3 className="detail-info">{orders.length > 0 ? orders[0].place_name : ""}</h3>
            {successMessage && (
                <p className="alert alert-success mb-3">{successMessage}</p>
            )}
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
                                {/*<p>*/}
                                {/*    <strong>Pickup Date:</strong> {order.date_pickup}*/}
                                {/*</p>*/}
                                <p>
                                    <strong>Number order:</strong> {order.id}
                                </p>
                                {/* Дополнительная информация показывается только если карточка развернута */}
                                {expandedOrders[order.id] && (
                                    <div className="expanded-content">
                                        <p><strong>Pickup Date:</strong> {order.system}</p>
                                        <p><strong>Delivery Date:</strong> {order.type_ship}</p>
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
        </div>
    );
};

export default AllOrderHistory;