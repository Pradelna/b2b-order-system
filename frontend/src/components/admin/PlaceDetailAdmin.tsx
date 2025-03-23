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
    faStopwatch, faFileInvoiceDollar, faChevronLeft, faBan
} from "@fortawesome/free-solid-svg-icons";
import HeaderAdmin from "./HeaderAdmin";
import FooterAccount from "../FooterAccount";
import OrderHistory from "../order/OrderHistory";
import OrderHistoryAdmin from "./OrderHistoryAdmin";
import { fetchWithAuth } from "../account/auth";
import DarkTooltip from "@/components/utils/DarkTooltip";
import NavButtons from "@/components/account/NavButtons";
import {Skeleton} from "@mui/material";
import { formatDate } from "@/components/utils/FormatDate";
import { formatViceDate } from "@/components/utils/FormatViceDate";



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
    rp_status: number;
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

const PlaceDetailAdmin: React.FC = () => {
    const BASE_URL = import.meta.env.VITE_API_URL;
    const { currentData } = useContext(LanguageContext);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [place, setPlace] = useState<Place | null>(null);
    const [customerId, setCustomerId] = useState<Customer | null>(null);
    const [customerName, setCustomerName] = useState<Customer | null>(null);
    const [userId, setUserId] = useState<Customer | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showEditForm, setShowEditForm] = useState<boolean>(false);
    const [showOrderForm, setShowOrderForm] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [successOrderMessage, setSuccessOrderMessage] = useState(null);

    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [orderHistory, setOrderHistory] = useState<Order[]>([]);
    const [visibleOrders, setVisibleOrders] = useState<number>(10);
    const [hasMoreOrders, setHasMoreOrders] = useState<boolean>(false);
    const [forceWait, setForceWait] = useState<boolean>(true);
    const [stopedOrder, setStopedOrder] = useState<any>(null);
    const [startDates, setStartDates] = useState<any>(null);
    const [expandedDates, setExpandedDates] = useState(false);
    const [cancelableOrders, setCancelableOrders] = useState(false); // to check if order longer 30 min
    const [notActivePlace, setNotActivePlace] = useState(false);


    // Функция для проверки, можно ли отменять заказ
    const checkTimeElapsed = (order: Order) => {
        const now = new Date().getTime(); // Текущее время
        const orderTime = new Date(order.created_at).getTime(); // Время заказа
        const timeDifference = now - orderTime; // Разница во времени (в миллисекундах)
        const thirtyMinutes = 30 * 60 * 1000; // 30 минут в миллисекундах
        return timeDifference >= thirtyMinutes; // Возвращает true, если прошло 30 минут
    };

    // get all orders
    const fetchOrders = async () => {
        try {
            // order of the place
            const response = await fetchWithAuth(
                `${BASE_URL}/order/${id}/orders/`
            );
            if (response.ok) {
                const orders: Order[] = await response.json();
                // get all repeated orders with end_order = flase
                const repeatOrders = orders.filter((order) => order.every_week && !order.end_order && !order.canceled);
                // get least order id
                const current = repeatOrders.sort((a, b) => a.id - b.id)
                    .find((order) => order.every_week && !order.end_order);
                // Извлекаем даты в массив
                const startDatesList = repeatOrders.map(order => order.date_start_day);
                setStartDates(startDatesList);
                const history = orders.filter(
                    (order) => !(order.every_week && !order.end_order)
                );

                setCurrentOrder(current || null);
                setOrderHistory(history);
                setHasMoreOrders(history.length > 10);
                // Проверяем сразу, можно ли отменить заказ
                if (current && checkTimeElapsed(current)) {
                    setCancelableOrders(true);
                }
            } else {
                console.error("Failed to fetch orders");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = () => {
        setExpandedDates(!expandedDates);
    };

    useEffect(() => {
        // info about place
        const fetchPlace = async () => {
            if (!id) {
                console.error("Place id is not defined");
                return;
            }
            try {
                const response = await fetchWithAuth(
                    `${BASE_URL}/admin/adminpanel/place-detail/${id}/`
                );
                if (response.ok) {
                    const data = await response.json();
                    setPlace(data.place);
                    setCustomerId(data.place.customer);
                    setCustomerName(data.customer_name);
                    setUserId(data.user_id);
                    if (data.data_sent === false) {
                        setNotActivePlace(true)
                    } else {
                        setNotActivePlace(false)
                    };
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
        // Ensure skeleton is shown for at least 2 seconds
        const timer = setTimeout(() => setForceWait(false), 1000);
        return () => clearTimeout(timer); // Cleanup
    }, [id, customerId]);

    useEffect(() => {
        fetchOrders();
        // Ensure skeleton is shown for at least 2 seconds
        const timer = setTimeout(() => setForceWait(false), 1000);
        return () => clearTimeout(timer); // Cleanup
    }, [id]);

    if (!place) return <p>Place not found.</p>;

    return (
        <>
            <HeaderAdmin />

            <div className="container margin-top-90 wrapper place-detail-page">
                <div className="row message-block-76">
                    <div className="col-xl-1 col-lg-3 col-sm-2 back-button">
                        <Link to={`/admin/customer-detail/${userId}`} className="text-decoration-none">
                            <p className="back-link">
                                <FontAwesomeIcon icon={faChevronLeft} className="icon" />
                                <span className="ms-2"><strong>{currentData?.buttons.back || "Zpět"}</strong></span>
                            </p>
                        </Link>
                    </div>
                    <div className="col-xl-7 col-lg-10 col-12">
                        {successMessage && (
                            <p className="alert alert-success">{successMessage}</p>
                        )}
                    </div>
                </div>
                <div className="row other-card">

                    <div className="col-xl-8 col-lg-10 col-12">

                        {loading || forceWait ? (
                            <div className="card place-details">
                                <Skeleton
                                    variant="rectangular"
                                    width={130} height={36}
                                    sx={{ borderRadius: "6px", marginBottom: 2 }}
                                />
                                <Skeleton
                                    variant="rectangular"
                                    width="100%" height={36}
                                    sx={{ borderRadius: "18px", marginBottom: 1 }}
                                />
                                <Skeleton
                                    variant="rectangular"
                                    width="100%" height={36}
                                    sx={{ borderRadius: "18px", marginBottom: 1 }}
                                />
                                <Skeleton
                                    variant="rectangular"
                                    width="100%" height={36}
                                    sx={{ borderRadius: "18px", marginBottom: 1 }}
                                />
                            </div>
                        ) : (
                            <div className="card place-details">
                                <h1>{currentData?.place.detail_title || "Podrobnosti o místě"}</h1>

                                    <div className="place-info">
                                        {place.deleted && (
                                            <div className="row mb-2">
                                                <div className="col-12">
                                                    <div className="form-control">
                                                        <FontAwesomeIcon icon={faBan} style={{ color: "red", height: "18px" }}/>
                                                        <strong className="ms-2 me-2">Smazáno</strong>
                                                    </div>
                                                </div>
                                            </div>
                                            )}
                                        <div className="row mb-2">
                                            <div className="col-12">
                                                <div className="form-control">
                                                    <strong>{currentData?.form.place_name || "Název místa"}:</strong> {place.place_name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row mb-2">
                                            <div className="col-12">
                                                <div className="form-control">
                                                    <strong>Název firmy:</strong> {customerName}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row mb-2">
                                            <div className="col-12">
                                                <div className="form-control">
                                                    <strong>{currentData?.place.address || "Adresa"}:</strong>{" "}
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
                                                    <strong>{currentData?.form.rp_person || "Kontaktní osoba"}: </strong>
                                                    {place.rp_person}
                                                    {place?.rp_phone && `, ${place?.rp_phone}`}
                                                    {place?.rp_email && `, ${place?.rp_email}`}
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                            </div>
                        )}

                    </div>


                </div>

                {loading || forceWait ? (<></>) : (<>
                    {currentOrder && (
                        <div className="row current-order other-card">
                            <div className="col-xl-8 col-lg-10 col-12">
                                <div className="card current-order">

                                    <h3>Aktuální objednávka #{currentOrder.id} {" "}
                                        {currentOrder?.active ? (
                                            currentOrder?.rp_contract_external_id
                                        ) : ("havn't sent yet")}
                                        </h3>
                                    <div className="order-details">

                                        <div className="form-control mb-2">
                                            <strong>{currentData?.order.day_next_visit || "Den další návštěvy" }: </strong>
                                            { formatDate(currentOrder.rp_time_planned)  || " None "}
                                        </div>
                                        <div className="form-control dates mb-2">
                                            {currentOrder.rp_status === 20 ? (<strong>{currentData?.order.info_waiting || "Informace čekají na aktualizaci"}</strong>) : (<>
                                                <div onClick={toggleExpand} style={{ cursor: "pointer" }}>
                                                    <strong>{expandedDates ? (currentData?.messages?.hide_next_days || "Skrýt další dny") : (currentData?.messages?.show_next_days || "Zobrazit další dny")}</strong>
                                                </div>

                                                <div
                                                    className={`collapsible ${expandedDates ? "expanded" : ""}`}
                                                    style={{
                                                        maxHeight: expandedDates ? "500px" : "0",
                                                        overflow: "hidden",
                                                        transition: "max-height 0.3s ease-in-out",
                                                    }}
                                                >
                                                    <ul>
                                                        {startDates.map((date, index) => (
                                                            <li key={index}>{formatViceDate(date)}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </>)}

                                        </div>
                                        <div className="form-control mb-2">
                                            <strong>{currentData?.order.status || "Status" }: </strong>
                                            {currentOrder.rp_status === 20 && (currentData?.status?.status_20 || "Nová")}
                                            {currentOrder.rp_status === 0 && (currentData?.status?.status_0 || "Nová")}
                                            {currentOrder.rp_status === 1 && (currentData?.status?.status_1 || "Nová")}
                                            {currentOrder.rp_status === 2 && (currentData?.status?.status_2 || "Přijato")}
                                            {currentOrder.rp_status === 3 && (currentData?.status?.status_3 || "Na cestě")}
                                            {currentOrder.rp_status === 4 && (currentData?.status?.status_4 || "Dokončeno")}
                                            {currentOrder.rp_status === 5 && (currentData?.status?.status_5 || "Complited")}
                                            {currentOrder.rp_status === 6 && (currentData?.status?.status_6 || "Ověřeno")}
                                            {currentOrder.rp_status === 7 && (currentData?.status?.status_7 || "Odmítnuto")}
                                            {currentOrder.rp_status === 8 && (currentData?.status?.status_8 || "Neznámý status")}
                                            {currentOrder.rp_status === 9 && (currentData?.status?.status_9 || "Odloženo")}
                                            {currentOrder.rp_status === 10 && (currentData?.status?.status_10 || "Storno")}
                                            {currentOrder.rp_status === 11 && (currentData?.status?.status_11 || "K fakturaci")}
                                            {currentOrder.rp_status === 12 && (currentData?.status?.status_12 || "Čeká na díl")}
                                            {currentOrder.rp_status === 13 && (currentData?.status?.status_13 || "Marný výjezd")}
                                        </div>
                                        <div className="form-control mb-2">
                                            <strong>{currentData?.form.type_ship || "Typ závozu" }:</strong>
                                            {currentOrder.type_ship === "pickup_ship_dif" && (" zber špinavého a dodanie čistého na tretí deň")}
                                            {currentOrder.type_ship === "pickup_ship_one" && (" čisté prádlo za špinavé")}
                                            {currentOrder.type_ship === "one_time" && (" One time order")}
                                        </div>
                                        {currentOrder.type_ship != "pickup_ship_dif" && (
                                            <div className="form-control mb-2">
                                                <strong>{ currentData?.form["system"] || "Systém" }:{" "}</strong>
                                                {currentOrder.system === "Mon_Wed_Fri" && (currentData?.order.mon_wed_fri || "Pondělí středa pátek")}
                                                {currentOrder.system === "Tue_Thu" && (currentData?.order.tue_thu || "Úterý Čtvrtek")}
                                                {currentOrder.system === "Every_day" && (currentData?.order.every_day || "Každý den")}
                                                {currentOrder.system === "Own" && (currentData?.order.own_system || "Vlastní systém")}
                                            </div>
                                        )}

                                        {currentOrder.system === "Own" && (
                                            <div className="form-control mb-2">
                                                <strong>{currentData?.order.days || "Dny"}: </strong>

                                                {currentOrder.monday && <span>{currentData?.form.monday || "Pondělí"} </span>}
                                                {currentOrder.tuesday && <span>{currentData?.form.tuesday || "Úterý"} </span>}
                                                {currentOrder.wednesday && <span>{currentData?.form.wednesday || "Středa"} </span>}
                                                {currentOrder.thursday && <span>{currentData?.form.thursday || "Čtvrtek"} </span>}
                                                {currentOrder.friday && <span>{currentData?.form.friday || "Pátek"} </span>}
                                                {currentOrder.saturday && <span>{currentData?.form.saturday || "Sobota"} </span>}
                                                {currentOrder.sunday && <span>{currentData?.form.sunday || "Neděle"} </span>}

                                            </div>
                                        )}
                                        {currentOrder.type_ship === "one_time" && (
                                            <>
                                                <div className="form-control mb-2">
                                                    <strong>Pickup Date:</strong> {currentOrder.date_pickup}
                                                </div>
                                                <div className="form-control mb-2">
                                                    <strong>Delivery Date:</strong> {currentOrder.date_delivery}
                                                </div>
                                            </>
                                        )}

                                        {/*<div className="form-control mb-2">*/}
                                        {/*    <strong>Customer note:</strong> {currentOrder.rp_customer_note || "None"}*/}
                                        {/*</div>*/}

                                        {currentOrder.rp_problem_description && (
                                            <div className="form-control mb-2">
                                                <strong>{currentData?.form.note || "Poznámka"}:</strong> {currentOrder.rp_problem_description || "None"}
                                            </div>
                                        )}

                                    </div>

                                </div>
                            </div>
                        </div>
                    )}
                </>)}

                <div className="row mt-4">
                    <div className="col-xl-8 col-lg-10 col-12">
                        <OrderHistoryAdmin
                            placeId={place.id}
                            hasMoreOrders={false}
                            orders={orderHistory}
                            setOrders={setOrderHistory}
                            stopedOrder={stopedOrder}
                        />
                    </div>
                </div>

            </div>
            <FooterAccount />
        </>
    );
};

export default PlaceDetailAdmin;