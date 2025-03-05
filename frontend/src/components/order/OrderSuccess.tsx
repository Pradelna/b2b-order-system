import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faStopwatch } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import React from "react";

interface Order {
    rp_place_title: string;
    system: string;
    monday?: boolean;
    tuesday?: boolean;
    wednesday?: boolean;
    thursday?: boolean;
    friday?: boolean;
    date_pickup?: string;
    date_delivery?: string;
    date_start_day?: string;
    place: number;  // Убедись, что здесь действительно ID места
}

interface OrderSuccessProps {
    newOrder: { order: Order }  | null;
    onClose: () => void;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ newOrder, onClose }) => {
    if (!newOrder?.order) return null; // Если заказа нет, ничего не рендерим

    const { order } = newOrder;
    const isPlaceDetailPage = window.location.pathname.includes(`/place/${order.place}`);

    return (
        <div className="order-message">
            <div className="modal-backdrop">
                <div className="modal-wrapper">
                    <div className="modal-content text-center">
                        <FontAwesomeIcon icon={faCircleCheck} style={{ color: "#00aab7", height: "40px" }} />
                        <h3>Success!</h3>

                        <p>Order created successfully.</p>
                        <p>Place: {order.rp_place_title}</p>

                        {/* Даты */}
                        {order.type_ship === "one_time" || order.type_ship === "quick_order" ? (
                            <>
                                <p>Pick-up: {order.date_pickup}</p>
                                <p>Delivery: {order.date_delivery}</p>
                            </>
                        ) : (
                            <>
                                <p>Start: {order.date_start_day}</p>

                                {/* Отображение системы */}
                                {order.system && (
                                    <p>
                                        System:{" "}
                                        {{
                                            "Tue_Thu": "Tuesday Thursday",
                                            "Mon_Wed_Fri": "Monday Wednesday Friday",
                                            "Every_day": "Every day",
                                            "Own": "Own system",
                                            "One_time": "One-time order"
                                        }[order.system] || order.system}
                                    </p>
                                )}

                                {/* Дни недели, если система "Own" */}
                                {order.system === "Own" && (
                                    <>
                                        {order.monday && <p>Monday</p>}
                                        {order.tuesday && <p>Tuesday</p>}
                                        {order.wednesday && <p>Wednesday</p>}
                                        {order.thursday && <p>Thursday</p>}
                                        {order.friday && <p>Friday</p>}
                                    </>
                                )}
                            </>
                        )}





                        <p>If you made a mistake, you can cancel
                            {isPlaceDetailPage ? (
                                <> this order </>
                            ) : (
                                <Link
                                    to={`/place/${order.place}`}
                                    className="text-primary text-decoration-underline ms-1"
                                >
                                    this order
                                </Link>
                            )}
                            <span> and create a new one.</span>
                        </p>

                        <FontAwesomeIcon icon={faStopwatch} style={{ height: "30px" }} />
                        <p>You have 30 minutes for that.</p>

                        <button className="btn-submit" onClick={onClose}>
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;