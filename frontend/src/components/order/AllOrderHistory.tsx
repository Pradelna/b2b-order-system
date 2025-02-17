const BASE_URL = import.meta.env.VITE_API_URL;
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTruck,
    faFileLines,
    faBan, faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import { fetchWithAuth } from "../account/auth";
import { Tooltip } from "react-tooltip";
import HeaderAccount from "../HeaderAccount";
import NavButtons from "../account/NavButtons";
import Footer from "../Footer";
import {Skeleton} from "@mui/material";

interface Order {
    id: number;
    place_name: string;
    date_pickup: string;
    date_delivery: string;
    system: string;
    type_ship: string;
    user: number; // ✅ Ensure user ID exists in the API response
}

const AllOrderHistory: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [visibleOrders, setVisibleOrders] = useState<number>(10);
    const [hasMoreOrders, setHasMoreOrders] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [expandedOrders, setExpandedOrders] = useState<{ [key: number]: boolean }>({});
    const [customerId, setCustomerId] = useState<number | null>(null); // ✅ Fix type
    const [forceWait, setForceWait] = useState<boolean>(true);

    // ✅ Fetch Orders on Mount
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetchWithAuth(`${BASE_URL}/order/all-orders/`);
                if (response.ok) {
                    const data: Order[] = await response.json();
                    setOrders(data.sort((a, b) => b.id - a.id)); // ✅ Sort orders (newest first)
                    setHasMoreOrders(data.length > visibleOrders);
                    console.log(data);
                } else {
                    console.error("Failed to fetch orders");
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
        // Ensure skeleton is shown for at least 2 seconds
        const timer = setTimeout(() => setForceWait(false), 1000);
        return () => clearTimeout(timer); // Cleanup
    }, []); // ✅ Run only once on mount

    // ✅ Set customerId AFTER orders are fetched
    useEffect(() => {
        if (orders.length > 0) {
            setCustomerId(orders[0].user); // ✅ Now it's safe to access orders[0]
        }
    }, [orders]); // ✅ Run when `orders` is updated

    // ✅ Load More Orders
    const loadMoreOrders = () => {
        setVisibleOrders((prev) => prev + 10);
    };

    // ✅ Toggle Expanded Order
    const toggleExpand = (orderId: number) => {
        setExpandedOrders((prev) => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };


    return (
        <>
            <HeaderAccount customerId={customerId} />

            <div className="container margin-top-90 wrapper place-detail-page">
                <div className="row message-block">
                    <div className="col-1 back-button">
                        <NavButtons />
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col-lg-8 col-md-10 col-12">

                        <div className="order-history">

                            <h3 className="account-info">Order History</h3>

                            {loading || forceWait ? (
                                [...Array(8)].map((_, index) => (
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
                            ) : (<>



                            {orders.length > 0 ? (
                                <div>
                                    {orders.slice(0, visibleOrders).map((order) => (
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
                                                    data-tooltip-id={`receipt-tooltip-${order.id}`}
                                                    style={{ cursor: "pointer" }}
                                                />
                                                <Tooltip
                                                    id={`receipt-tooltip-${order.id}`}
                                                    place="top"
                                                    content="Download dodaci list"
                                                    effect="solid"
                                                    className="custom-tooltip"
                                                />
                                            </div>

                                            <p>
                                                <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#00aab7", height: "18px" }} />
                                                <strong className="ms-2">Status</strong>
                                            </p>

                                            <p>
                                                <strong>Order Number:</strong> {order.id}
                                            </p>

                                            {expandedOrders[order.id] && (
                                                <div className="expanded-content">
                                                    <p><strong>System:</strong> {order.system}</p>
                                                    <p><strong>Type of Shipping:</strong> {order.type_ship}</p>
                                                    <p><strong>Pickup Date:</strong> {order.date_pickup}</p>
                                                    <p><strong>Delivery Date:</strong> {order.date_delivery}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {hasMoreOrders && (
                                        <button onClick={loadMoreOrders} className="btn btn-history btn-link mt-3 mb-5">
                                            Load More
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <p>No order history available.</p>
                            )}
                            </>)}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default AllOrderHistory;