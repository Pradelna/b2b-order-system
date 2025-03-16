import React, {useState, useEffect, useContext} from "react";
import { LanguageContext } from "../../context/LanguageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTruck,
    faFileLines,
    faBan, faCheckCircle, faFileImage, faFileArrowDown
} from "@fortawesome/free-solid-svg-icons";
import { fetchWithAuth } from "../account/auth";
import HeaderAccount from "../HeaderAccount";
import NavButtons from "../account/NavButtons";
import FooterAccount from "../FooterAccount";
import {Skeleton} from "@mui/material";
import { formatDate } from "@/components/utils/FormatDate";
import { formatViceDate } from "@/components/utils/FormatViceDate";
import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import FileDownloadIcon from "@/components/order/FileDownloadIcon";
import UseMediaQuery from "@/hooks/UseMediaQuery";
import DarkTooltip from "../utils/DarkTooltip";

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
    const [visibleOrders, setVisibleOrders] = useState<number>(60);
    const [hasMoreOrders, setHasMoreOrders] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [expandedOrders, setExpandedOrders] = useState<{ [key: number]: boolean }>({});
    const [customerId, setCustomerId] = useState<number | null>(null);
    const [forceWait, setForceWait] = useState<boolean>(true);
    const BASE_URL = import.meta.env.VITE_API_URL;
    const { currentData } = useContext(LanguageContext);
    const [orderPhotos, setOrderPhotos] = useState<OrderPhoto[]>([]);
    const isMobileMax530 = UseMediaQuery('(max-width: 530px)');

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


    //  Load More Orders
    const loadMoreOrders = () => {
        setVisibleOrders((prev) => prev + 40);
    };

    //  Toggle Expanded Order
    const toggleExpand = (orderId: number) => {
        setExpandedOrders((prev) => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    //  Fetch Orders on Mount
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetchWithAuth(`${BASE_URL}/order/all-orders/`);
                if (response.ok) {
                    const data: Order[] = await response.json();
                    setOrders(data.orders.sort((a, b) => b.id - a.id)); // Sort orders (newest first)
                    setHasMoreOrders(data.orders.length > visibleOrders);
                    setCustomerId(data.user_id);
                    // console.log(data);
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
    }, []); //  Run only once on mount

    useEffect(() => {
        fetchOrderPhotos();
    }, []);

    useEffect(() => {
        // console.log("Re-render triggered, ordersPhotos:", orderPhotos);
    }, [orderPhotos]);

    //  Set customerId AFTER orders are fetched
    useEffect(() => {
        // console.log(orders)
    }, [orders]); //  Run when `orders` is updated

    return (
        <>
            <HeaderAccount customerId={customerId} />

            <div className="container margin-top-90 wrapper all-history-page">
                <div className="row">
                    <div className="col-3 back-button">
                        <NavButtons />
                    </div>
                </div>

                <div className="row mt-4 mb-4">
                    <div className="col-lg-8 col-md-10 col-12">

                        <div className="order-history">

                            <h3 className="account-info">{currentData?.buttons["all_history"] || "Historie objednávek"}</h3>

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
                                        {orders.slice(0, visibleOrders).map((order) => {
                                            // Получаем фотографии для данного заказа
                                            const photos = orderPhotos.filter((photo) => photo.group_pair_id === order.group_pair_id);
                                            // Если фотографий больше двух – вычисляем высоту контейнера с иконками,
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
                                                    {(order.rp_status === 10 || order.rp_status === 7) ? (
                                                        <FontAwesomeIcon icon={faBan} style={{ color: "red", height: "18px" }}/>
                                                    ) : (
                                                        <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#00aab7", height: "18px" }} />
                                                    )}

                                                    <strong className="ms-2">
                                                        {order.rp_status === 20 && (" Nová")}
                                                        {order.rp_status === 0 && (" Nová")}
                                                        {order.rp_status === 1 && (" In progress 1")}
                                                        {order.rp_status === 2 && (" Přiřazeno")}
                                                        {order.rp_status === 3 && (" V procesu")}
                                                        {order.rp_status === 4 && (" Dokončeno")}
                                                        {order.rp_status === 5 && (" Complited")}
                                                        {order.rp_status === 6 && (" Ověřeno")}
                                                        {order.rp_status === 7 && (" Odmítnuto")}
                                                        {order.rp_status === 8 && (" Neznámý status")}
                                                        {order.rp_status === 9 && (" Odloženo")}
                                                        {order.rp_status === 10 && (" Storno")}
                                                        {order.rp_status === 11 && (" K fakturaci")}
                                                        {order.rp_status === 12 && (" Čeká na díl")}
                                                        {order.rp_status === 13 && (" Marný výjezd")}
                                                    </strong>
                                                </p>

                                                <p>
                                                    <strong>Order Number:</strong> {order.id}
                                                </p>

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
                                        )})}

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

            <FooterAccount />
        </>
    );
};

export default AllOrderHistory;