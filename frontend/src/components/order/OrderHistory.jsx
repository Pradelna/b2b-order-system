import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faFileInvoiceDollar, faFileLines } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import { fetchWithAuth } from "../account/auth";
import { Tooltip as ReactTooltip } from 'react-tooltip';

const OrderHistory = ({ placeId }) => {
    const [orders, setOrders] = useState([]);
    const [visibleOrders, setVisibleOrders] = useState(10);
    const [hasMoreOrders, setHasMoreOrders] = useState(false);
    const [loading, setLoading] = useState(true);

    // Функция для загрузки заказов
    const fetchOrders = async () => {
        try {
            const response = await fetchWithAuth(`http://127.0.0.1:8000/api/order/${placeId}/orders/`);
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
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
        fetchOrders();
    }, [placeId]);

    // Функция для загрузки дополнительных заказов
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
            <h3 className="detail-info">{orders.length > 0 ? orders[0].place_name : 'Unknown Place'}</h3>
            {orders.length > 0 ? (
                <div>
                    {orders.slice(0, visibleOrders).map((order) => (
                        <div key={order.id} className="card">
                            <div className="history-icon">
                                <FontAwesomeIcon
                                    icon={faTruck}
                                />
                            </div>
                            <div className="invoice-icon">
                                <FontAwesomeIcon
                                    icon={faFileInvoiceDollar}
                                    data-tooltip-id="invoice-tooltip"
                                    style={{ cursor: "pointer" }}
                                />
                                <ReactTooltip 
                                    id="invoice-tooltip"
                                    place="top"
                                    content="Downlod invoice"
                                    effect="solid" 
                                    className="custom-tooltip"
                                />
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
                                    content="Downlod dodaci list"
                                    effect="solid" 
                                    className="custom-tooltip"
                                />
                            </div>
                            {/* <p><strong>Type:</strong> {order.type_ship}</p> */}
                            <p><strong>Pickup Date:</strong> {order.date_pickup}</p>
                            <p><strong>Delivery Date:</strong> {order.date_delivery}</p>
                            {/* <p><strong>Status:</strong> {order.end_order ? "Completed" : "In Progress"}</p> */}
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

OrderHistory.propTypes = {
    placeId: PropTypes.number.isRequired, // ID места для загрузки заказов
};

export default OrderHistory;