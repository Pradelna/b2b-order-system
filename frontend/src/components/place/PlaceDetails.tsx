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
    faStopwatch
} from "@fortawesome/free-solid-svg-icons";
import HeaderAccount from "../HeaderAccount";
import Footer from "../Footer";
import PlaceEdit from "./PlaceEdit";
import OrderForm from "../order/OrderForm";
import OrderHistory from "../order/OrderHistory";
import OrderSuccess from "../order/OrderSuccess";
import { fetchWithAuth } from "../account/auth";


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
    rp_status: string;
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
    const { currentData } = useContext(LanguageContext);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [place, setPlace] = useState<Place | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showEditForm, setShowEditForm] = useState<boolean>(false);
    const [showOrderForm, setShowOrderForm] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [successOrderMessage, setSuccessOrderMessage] = useState(null);

    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [orderHistory, setOrderHistory] = useState<Order[]>([]);
    const [visibleOrders, setVisibleOrders] = useState<number>(10);
    const [hasMoreOrders, setHasMoreOrders] = useState<boolean>(false);

    useEffect(() => {
        const fetchPlace = async () => {
            try {
                const response = await fetchWithAuth(
                    `http://127.0.0.1:8000/api/place/${id}/`
                );
                if (response.ok) {
                    const data = await response.json();
                    setPlace(data);
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
    }, [id]);


        const fetchOrders = async () => {
            try {
                const response = await fetchWithAuth(
                    `http://127.0.0.1:8000/api/order/${id}/orders/`
                );
                if (response.ok) {
                    const orders: Order[] = await response.json();

                    const current = orders.find(
                        (order) => order.every_week && !order.end_order
                    );
                    const history = orders.filter(
                        (order) => !(order.every_week && !order.end_order)
                    );

                    setCurrentOrder(current || null);
                    setOrderHistory(history);
                    setHasMoreOrders(history.length > 10);
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
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this place?")) {
            try {
                const response = await fetchWithAuth(
                    `http://127.0.0.1:8000/api/place/delete/${id}/`,
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
        if (window.confirm("Are you sure you want to stop this order?")) {
            try {
                const response = await fetchWithAuth(`http://127.0.0.1:8000/api/order/update/${orderId}/`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ end_order: true }),
                });

                if (response.ok) {
                    const updatedOrder = await response.json();
                    setCurrentOrder(null); // del current order
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

    if (loading) return <p>Loading...</p>;
    if (!place) return <p>Place not found.</p>;

    return (
        <>
            <HeaderAccount />

            <div className="container margin-top-90 wrapper place-detail-page">
                <div className="row message-block">
                    <div className="col-lg-8 col-md-10 col-12">
                        {successMessage && (
                            <p className="alert alert-success">{successMessage}</p>
                        )}
                    </div>
                </div>
                <div className="row other-card">

                    <div className="col-lg-8 col-md-10 col-12">
                        <div className="card place-details">
                            {!showEditForm ? (
                                <FontAwesomeIcon
                                    icon={faPenToSquare}
                                    className="settings"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setShowEditForm(true)}
                                />
                            ) : (
                                <FontAwesomeIcon
                                    icon={faSquareXmark}
                                    className="settings"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setShowEditForm(false)}
                                />
                            )}

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
                    </div>
                </div>

                {currentOrder && (
                    <div className="row current-order other-card">
                        <div className="col-lg-8 col-md-10 col-12">
                            <div className="card current-order">

                                <h3>Current Order #{currentOrder.id}</h3>
                                <div className="order-details">

                                    <div className="form-control mb-2">
                                        <strong>Status:</strong> {currentOrder.rp_status}
                                    </div>
                                    <div className="form-control mb-2">
                                        <strong>Type of Shipping:</strong> {currentOrder.type_ship}
                                    </div>
                                    <div className="form-control mb-2">
                                        <strong>System:</strong> {currentOrder.system || "Custom Days"}
                                    </div>

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

                                    <div className="form-control mb-2">
                                        <strong>Pickup Date:</strong> {currentOrder.date_pickup}
                                    </div>
                                    <div className="form-control mb-2">
                                        <strong>Delivery Date:</strong> {currentOrder.date_delivery}
                                    </div>
                                    <div className="form-control mb-2">
                                        <strong>Note:</strong> {currentOrder.rp_problem_description || "None"}
                                    </div>

                                </div>

                                <button
                                    className="btn-link mt-2"
                                    onClick={() => handleStopOrder(currentOrder!.id)}
                                >
                                    <FontAwesomeIcon icon={faPowerOff} className="icon" />
                                    <span className="ms-2">stop order</span>
                                </button>

                            </div>
                        </div>
                    </div>
                )}

                <div className="row mt-4">
                    <div className="col-lg-8 col-md-10 col-12">
                        <OrderHistory placeId={place.id} hasMoreOrders={false} orders={orderHistory}  />
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
                                `Order created successfully for place: ${newOrder.rp_place_title}`
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