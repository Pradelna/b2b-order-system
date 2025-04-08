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
    user: number;
}

const AllOrderHistory: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [visibleOrders, setVisibleOrders] = useState<number>(10);
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
        setVisibleOrders((prev) => prev + 10);
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
        setHasMoreOrders(visibleOrders < orders.length);
    }, [orders, visibleOrders]); //  Run when `orders` is updated

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
                                                ? `${photos.length * 72 + 90}px` : '270px';

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
                                                        {order.rp_status === 20 ? (currentData?.status?.status_20 || "Nová") : null}
                                                        {order.rp_status === 0 ? (currentData?.status?.status_0 || "Nová") : null}
                                                        {order.rp_status === 1 ? (currentData?.status?.status_1 || "Nová") : null}
                                                        {order.rp_status === 2 ? (currentData?.status?.status_2 || "Přijato") : null}
                                                        {order.rp_status === 3 ? (currentData?.status?.status_3 || "Na cestě") : null}
                                                        {order.rp_status === 4 ? (currentData?.status?.status_4 || "Dokončeno") : null}
                                                        {order.rp_status === 5 ? (currentData?.status?.status_5 || "Complited") : null}
                                                        {order.rp_status === 6 ? (currentData?.status?.status_6 || "Ověřeno") : null}
                                                        {order.rp_status === 7 ? (currentData?.status?.status_7 || "Odmítnuto") : null}
                                                        {order.rp_status === 8 ? (currentData?.status?.status_8 || "Neznámý status") : null}
                                                        {order.rp_status === 9 ? (currentData?.status?.status_9 || "Odloženo") : null}
                                                        {order.rp_status === 10 ? (currentData?.status?.status_10 || "Storno") : null}
                                                        {order.rp_status === 11 ? (currentData?.status?.status_11 || "K fakturaci") : null}
                                                        {order.rp_status === 12 ? (currentData?.status?.status_12 || "Čeká na díl") : null}
                                                        {order.rp_status === 13 ? (currentData?.status?.status_13 || "Marný výjezd") : null}
                                                    </strong>
                                                </p>

                                                {order.rp_contract_external_id ? (
                                                    <p>
                                                        <strong>{currentData?.history?.order_number || "Číslo objednávky"}:</strong> {order.rp_contract_external_id}
                                                    </p>
                                                ) : (
                                                    <p>
                                                        <strong>{currentData?.history?.wait_approval || "Objednávka čeká na zpracování"}</strong>
                                                    </p>
                                                )}

                                                {expandedOrders[order.id] ? (
                                                    <div className="expanded-content">
                                                        {/* if order is repeating */}
                                                        {order.every_week ? (<>
                                                                <p><strong>
                                                                    {currentData?.history?.repeated_order || "Pravidelná opakující se objednávka"}
                                                                </strong></p>
                                                                {/* Type of Shipping */}
                                                                <p><strong>{ currentData?.form?.type_ship || "Typ závozu" }: </strong>
                                                                    {order.type_ship === "pickup_ship_one" ? (
                                                                        currentData?.order?.type_sipping_clear_for_dirty || "Výměna čistého prádla za špinavé") : null}
                                                                    {order.type_ship === "pickup_ship_dif" ? (
                                                                        currentData?.order.type_sipping_1_in_3 || "Vyzvednuti a dodání v rozdilné dny"
                                                                    ) : null}</p>
                                                            </>
                                                        ) : (
                                                            <strong>
                                                                {order.type_ship === "quick_order" ? (
                                                                    currentData?.order.quick || "Rychlé doručení") : null}
                                                                {order.type_ship === "one_time" ? (
                                                                    currentData?.order.one_time || "Jednorázová objednávka") : null}
                                                            </strong>
                                                        )}
                                                        {(order.rp_status === 20 || order.rp_status === 0 || order.rp_status === 1 || order.rp_status === 7 || order.rp_status === 10)  ? (<>
                                                            {order.rp_time_planned ? (
                                                                <p>
                                                                    <strong>{currentData?.history?.time_planned || "Plánované datum"}: </strong>
                                                                    {formatDate(order.rp_time_planned) || " No information"}
                                                                </p>
                                                            ) : null}
                                                        </>) : (<>
                                                            <p><strong>{currentData?.form?.pickup || "Vyzvednutí"}: </strong>
                                                                {formatViceDate(order.date_pickup)}</p>
                                                            <p><strong>{currentData?.form?.delivery || "Dodání"}: </strong>
                                                                {formatViceDate(order.date_delivery)}</p>
                                                        </>)}
                                                        {order.rp_time_realization ? (
                                                            <p>
                                                                <strong>{currentData?.history?.time_realization || "Datum realizace"}: </strong>
                                                                {formatDate(order.rp_time_realization) || " No information"}
                                                            </p>
                                                        ) : null}
                                                        {/* Отображение системы */}
                                                        {(order.system && (order.type_ship !== "one_time" && order.type_ship !== "quick_order")) ? (
                                                            <p>
                                                                <strong>{ currentData?.form?.system || "Systém" }:{" "}</strong>
                                                                {{
                                                                    "Tue_Thu": currentData?.order.tue_thu || "Úterý čtvrte",
                                                                    "Mon_Wed_Fri": currentData?.order.mon_wed_fri || "Pondělí středa pátek",
                                                                    "Every_day": currentData?.order.every_day || "Každý pracovní den",
                                                                    "Every_day_with_weekend": currentData?.order.every_day_with_weekend || "Každý den a na víkend",
                                                                    "Own": currentData?.order.own_system || "Vlastní systém",
                                                                }[order.system] || order.system}

                                                                {/* Дни недели, если система "Own" */}
                                                                {(order.system === "Own") ? (
                                                                    <>
                                                                        {" "}
                                                                        {order.monday && (currentData?.form.monday || "Pondělí")}{" "}
                                                                        {order.tuesday && (currentData?.form.tuesday || "Úterý")}{" "}
                                                                        {order.wednesday && (currentData?.form.wednesday || "Středa")}{" "}
                                                                        {order.thursday && (currentData?.form.thursday || "Čtvrtek")}{" "}
                                                                        {order.friday && (currentData?.form.friday || "Pátek")}{" "}
                                                                        {order.saturday && (currentData?.form.saturday || "Sobota")}{" "}
                                                                        {order.sunday && (currentData?.form.sunday || "Neděle")}
                                                                    </>
                                                                ) : null}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                ) : null}

                                                    {((photos.length <= 3 && !isMobileMax530) || !photos.length > 0 || (isMobileMax530 && photos.length < 2)) ? (
                                                        <div className="image-icon-container">

                                                            <div className="image-icon-position">
                                                                {photos.map((photo, index) => {
                                                                    const order = orders.find((order) => order.id === photo.order_id);
                                                                    const styleData = { right: `${68 * index}px` };
                                                                    return (
                                                                        <div key={photo.id}>
                                                                            {order ? (
                                                                                <FileDownloadIcon
                                                                                    key={photo.id}
                                                                                    photo={photo}
                                                                                    styleData={styleData}
                                                                                />
                                                                            ) : null}
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
                                                                        <DarkTooltip title={currentData?.buttons?.open_file || "Otevřít soubory"} placement="top" arrow>
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
                                                                    {expandedOrders[order.id] ? (
                                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                        {photos.map((photo, index) => {
                                                                            const order = orders.find((order) => order.id === photo.order_id);
                                                                            const styleData = { right: "0", top: `${72 * (index + 1)}px` };
                                                                            return (
                                                                                <div key={photo.id}>
                                                                                    {order ? (
                                                                                        <FileDownloadIcon
                                                                                            key={photo.id}
                                                                                            photo={photo}
                                                                                            styleData={styleData}
                                                                                        />
                                                                                    ) : null}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                    ) : null}

                                                                </div>

                                                            </div>

                                                        </div>
                                                    )}
                                                </>)}
                                            </div>
                                        )})}

                                        {hasMoreOrders ? (
                                            <button onClick={loadMoreOrders} className="btn btn-history btn-link mt-3 mb-5">
                                                {currentData?.buttons?.more || "More"}
                                            </button>
                                        ) : null}
                                    </div>
                                ) : (
                                    <p>{currentData?.messages?.no_history || "Žádná historie objednávek není k dispozici"}</p>
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