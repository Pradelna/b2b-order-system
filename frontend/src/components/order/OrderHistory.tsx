import React, {useState, useEffect, useContext} from "react";
import { LanguageContext } from "../../context/LanguageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck, faFileLines, faCheckCircle, faBan, faFileImage, faFileArrowDown, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { fetchWithAuth } from "../account/auth.ts";
import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import {Form} from "react-router-dom";
import {Skeleton} from "@mui/material";
import { formatDate } from "@/components/utils/FormatDate";
import {formatViceDate} from "@/components/utils/FormatViceDate";
import FileDownloadIcon from "@/components/order/FileDownloadIcon";
import UseMediaQuery from "@/hooks/UseMediaQuery";
import DarkTooltip from "../utils/DarkTooltip.tsx";

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
    const [visibleOrders, setVisibleOrders] = useState<number>(60);
    const [hasMoreOrders, setHasMoreOrders] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [expandedOrders, setExpandedOrders] = useState<{ [key: number]: boolean }>({});
    const [cancelableOrders, setCancelableOrders] = useState<{ [key: number]: boolean }>({});
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [updatedOrder, setUpdatedOrder] = useState<any>(null);
    const [forceWait, setForceWait] = useState<boolean>(true);
    const BASE_URL = import.meta.env.VITE_API_URL;
    const { currentData } = useContext(LanguageContext);
    const [orderPhotos, setOrderPhotos] = useState<OrderPhoto[]>([]);
    const [expandedPhoto, setExpandedPhoto] = useState(false); // for expend photo if theya are many
    const isMobileMax530 = UseMediaQuery('(max-width: 530px)');

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
                setHasMoreOrders(data.length > 40);
            } else {
                console.error("Failed to fetch orders");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    // get photo for orders
    const fetchOrderPhotos = async () => {
        try {
            // console.log("Fetching orders for place ID", placeId);
            const response = await fetchWithAuth(`${BASE_URL}/order/photos/`);

            if (response.ok) {
                const data = await response.json();
                setOrderPhotos(data);
            } else {
                console.error("Failed to fetch photos");
            }
        } catch (error) {
            console.error("Error fetching photos:", error);
        } finally {
            setLoading(false);
        }
    };


    // Load more orders when the user clicks "More"
    const loadMoreOrders = () => {
        setVisibleOrders((prev) => {
            const newVisibleCount = prev + 40;
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

    // cancel order
    const handleCancelOrder = async (orderId: number) => {
        if (window.confirm("Are you sure you want to cancel this order?")) {
            try {
                const response = await fetchWithAuth(`${BASE_URL}/order/update/${orderId}/`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ canceled: true, rp_status: 10, rp_customer_note: "storno chybna objednavka" }),
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

    // check if order is old then 30 minut
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
        fetchOrderPhotos();
    }, []);

    useEffect(() => {
        // console.log("Re-render triggered, ordersPhotos:", orderPhotos);
    }, [orderPhotos]);

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
            <h3 className="account-info">{currentData.buttons["all_history"] || "Historie objednávek"}</h3>
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
                                .map((order) => {
                                    // Получаем фотографии для данного заказа
                                    const photos = orderPhotos.filter((photo) => photo.group_pair_id === order.group_pair_id);
                                    // Если файлов больше 3 – вычисляем высоту контейнера с иконками,
                                    // иначе высота задаётся классом "expanded" (из CSS)

                                    const dynamicHeight = ((photos.length > 3 || isMobileMax530) && !photos.length == 0)
                                        ? `${photos.length * 72 + 90}px` : '220px';

                                return (
                                    <div
                                        key={order.id}
                                        className={`card ${expandedOrders[order.id] ? "expanded" : ""}`}
                                        onClick={() => toggleExpand(order.id)}
                                        style={{ display: (order.rp_status === 0 && order.every_week) || (
                                            order.id === order.group_pair_id &&
                                                order.rp_status !== 20 &&
                                                order.rp_status !== 10) ? "none" : "block",
                                            '--card-height': dynamicHeight,} as React.CSSProperties}
                                    >
                                        {(order.id !== order.group_pair_id || (order.rp_status === 20 || order.rp_status === 10)) && (<>
                                        <div className="history-icon">
                                            <FontAwesomeIcon icon={faTruck} />
                                        </div>

                                        <p>
                                            {order.canceled || (updatedOrder?.id === order.id) ? (
                                                <>
                                                    <FontAwesomeIcon icon={faBan} style={{ color: "red", height: "18px" }}/>
                                                    <strong className="ms-2">Storno</strong>
                                                </>
                                            ) : (
                                                <>
                                                    {cancelableOrders[order.id] && !order.canceled ? (
                                                        <>
                                                            <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#00aab7", height: "18px" }}/>
                                                            <strong className="ms-2">Nová</strong>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#00aab7", height: "18px" }}/>
                                                            <strong className="ms-2">
                                                                {order.rp_status === 20 && (" Nová")}
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
                                                            </strong>
                                                        </>
                                                    )}

                                                </>
                                            )}
                                        </p>


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
                                                {(order.rp_status === 20 || order.rp_status === 0 || order.rp_status === 1 || order.rp_status === 7 || order.rp_status === 10)  ? (<>
                                                    {order.rp_time_planned && (
                                                        <p>
                                                            <strong>Planned date:</strong> {formatDate(order.rp_time_planned) || " No information"}
                                                        </p>
                                                    )}
                                                </>) : (<>
                                                <p><strong>Pickup Date:</strong> {formatViceDate(order.date_pickup)}</p>
                                                <p><strong>Delivery Date:</strong> {formatViceDate(order.date_delivery)}</p>
                                                </>)}
                                                {order.rp_time_realization && (
                                                    <p>
                                                        <strong>Realization date:</strong> {formatDate(order.rp_time_realization) || " No information"}
                                                    </p>
                                                )}

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

                                        {((photos.length <= 3 && !isMobileMax530) || !photos.length > 0) ? (
                                        <div className="image-icon-container">

                                            <div className="image-icon-position">
                                                {photos.map((photo, index) => {
                                                    const order = orders.find((order) => order.id === photo.order_id);
                                                    const styleData = { right: `${68 * index}px` };
                                                    return (
                                                        <div key={photo.id}>
                                                            {order && (
                                                                <FileDownloadIcon
                                                                    key={photo.id}
                                                                    photo={photo}
                                                                    styleData={styleData}
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                        </div>
                                        ) : (
                                            <div className="image-icon-container">

                                                <div className="image-icon-position">

                                                    <div>

                                                        <div
                                                            className="image-icon"
                                                            style={{ right: "0" }}
                                                        >
                                                            <DarkTooltip title="Open files" placement="top" arrow>
                                                                <FontAwesomeIcon
                                                                    icon={faFileArrowDown}
                                                                    style={{ cursor: "pointer" }}

                                                                />
                                                            </DarkTooltip>
                                                            <span
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: '-8px',
                                                                    right: '-13px',
                                                                    background: '#28aab7',
                                                                    color: 'white',
                                                                    borderRadius: '50%',
                                                                    padding: '2px 6px',
                                                                    fontSize: '12px'
                                                                }}
                                                            >
                                                                x{photos.length}
                                                            </span>
                                                        </div>
                                                        {expandedOrders[order.id] && (
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            {photos.map((photo, index) => {
                                                                const order = orders.find((order) => order.id === photo.order_id);
                                                                const styleData = { right: "0", top: `${72 * (index + 1)}px` };
                                                                return (
                                                                    <div key={photo.id}>
                                                                        {order && (
                                                                            <FileDownloadIcon
                                                                                key={photo.id}
                                                                                photo={photo}
                                                                                styleData={styleData}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        )}

                                                    </div>

                                                </div>

                                            </div>
                                            )}
                                        </>)}
                                    </div>
                                ) // end return
                            }
                        )}
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