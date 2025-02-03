import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck, faFileInvoiceDollar, faFileLines } from "@fortawesome/free-solid-svg-icons";
import { fetchWithAuth } from "../account/auth";
import { Tooltip as ReactTooltip } from "react-tooltip";

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

const OrderHistory: React.FC<OrderHistoryProps> = ({ placeId, orders = [], setOrders}) => {
    const [visibleOrders, setVisibleOrders] = useState<number>(10);
    const [hasMoreOrders, setHasMoreOrders] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

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

    if (loading) {
        return <p>Loading order history...</p>;
    }

    return (
        <div className="order-history">
            <h3 className="account-info">Order History</h3>
            <h3 className="detail-info">{orders.length > 0 ? orders[0].place_name : ""}</h3>
            {orders.length > 0 ? (
                <div>
                    {orders.slice(0, visibleOrders)
                        .sort((a, b) => b.id - a.id)
                        .map((order) => (
                        <div key={order.id} className="card">
                            <div className="history-icon">
                                <FontAwesomeIcon icon={faTruck} />
                            </div>
                            {/*<div className="invoice-icon">*/}
                            {/*    <FontAwesomeIcon*/}
                            {/*        icon={faFileInvoiceDollar}*/}
                            {/*        data-tooltip-id="invoice-tooltip"*/}
                            {/*        style={{ cursor: "pointer" }}*/}
                            {/*    />*/}
                            {/*    <ReactTooltip*/}
                            {/*        id="invoice-tooltip"*/}
                            {/*        place="top"*/}
                            {/*        content="Download invoice"*/}
                            {/*        effect="solid"*/}
                            {/*        className="custom-tooltip"*/}
                            {/*    />*/}
                            {/*</div>*/}
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
                                <strong>Pickup Date:</strong> {order.date_pickup}
                            </p>
                            <p>
                                <strong>Delivery Date:</strong> {order.date_delivery}
                            </p>
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

export default OrderHistory;