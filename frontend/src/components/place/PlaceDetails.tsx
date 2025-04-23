import React, { useState, useEffect, useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPenToSquare,
    faSquareXmark,
    faCartPlus,
    faPowerOff,
} from "@fortawesome/free-solid-svg-icons";
import HeaderAccount from "../HeaderAccount";
import FooterAccount from "../FooterAccount";
import PlaceEdit from "./PlaceEdit";
import OrderForm from "../order/OrderForm";
import OrderHistory from "../order/OrderHistory";
import OrderSuccess from "../order/OrderSuccess";
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

const PlaceDetails: React.FC = () => {
    const BASE_URL = import.meta.env.VITE_API_URL;
    const { currentData } = useContext(LanguageContext);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [place, setPlace] = useState<Place | null>(null);
    const [customerId, setCustomerId] = useState<Customer | null>(null);
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

    // delete place, but only add "deleted"=True
    const handleDelete = async () => {
        // deleting of the place
        if (window.confirm(currentData?.messages?.sure_del_place || "Jste si jisti, že chcete toto místo smazat?")) {
            try {
                const response = await fetchWithAuth(
                    `${BASE_URL}/place/edit/${place.id}/`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ "deleted": true }),
                    }
                );
                if (response.ok) {
                    navigate("/account", {
                        state: { successMessage: currentData?.messages?.place_del || "Místo smazáno úspěšně!" },
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
        // stop repeat order
        if (window.confirm(currentData?.messages?.sure_cancel_order || "Opravdu si přejete zrušit tuto objednávku?")) {
            try {
                const response = await fetchWithAuth(`${BASE_URL}/order/update/${orderId}/`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ canceled: true, rp_status: 10, rp_customer_note: "storno" }),
                });

                if (response.ok) {
                    const updatedOrder = await response.json();
                    setCurrentOrder(null); // del current order
                    setStopedOrder(updatedOrder);
                    setOrderHistory((prevOrders) => {
                        // add ex current order
                        if (prevOrders.some((order) => order.id === updatedOrder.id)) {
                            return prevOrders;
                        }
                        return [updatedOrder, ...prevOrders];
                    });
                    setSuccessMessage(currentData?.messages?.order_suc_canceled || "Objednávka byla úspěšně zrušena!");
                    setTimeout(() => setSuccessMessage(""), 10000);
                } else {
                    console.error("Failed to stop order.");
                }
            } catch (error) {
                console.error("Error stopping order:", error);
            }
        }
    };

    const toggleExpand = () => {
        setExpandedDates(!expandedDates);
    };

    const langMessage = {
        cz: "Ještě nemůžete vytvořit objednávku. Počkejte, až je místo zpracováno systémem. Pro více informací zavolejte +420 736 164 797 nebo na email office@pradelna1.com",
        ru: "Вы ещё не можете создать заказ. Подождите, пока место будет обработано системой. В случае слишком долгого ожидания позвните по телефону +420 736 164 797 или на office@pradelna1.com",
        en: "You cannot create an order yet. Please wait until the place is processed by the system. For more information, call +420 736 164 797 or email office@pradelna1.com.",
    };
    const lang = currentData?.lang || "cz";
    const messagePlaceWait = langMessage[lang] || langMessage.en;

    useEffect(() => {
        // info about place
        const fetchPlace = async () => {
            try {
                const response = await fetchWithAuth(
                    `${BASE_URL}/place/${id}/`
                );
                if (response.ok) {
                    const data = await response.json();
                    setPlace(data);
                    setCustomerId(data.customer);
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

    // check if order is old then 30 minut
    useEffect(() => {
        if (!currentOrder) return; // Если заказа нет, не запускаем таймер

        const timer = setInterval(() => {
            if (checkTimeElapsed(currentOrder)) {
                setCancelableOrders(true);
                clearInterval(timer); // Останавливаем таймер после установки true
            }
        }, 60000); // Проверяем каждую минуту

        return () => clearInterval(timer); // Очищаем таймер при размонтировании компонента
    }, [currentOrder]); // Зависимость — currentOrder

    useEffect(() => {
        if (showOrderForm) {
            // Добавляем класс
            document.body.classList.add("no-scroll");
        } else {
            // Убираем класс
            document.body.classList.remove("no-scroll");
        }

        // Очистка при размонтировании компонента:
        return () => {
            document.body.classList.remove("no-scroll");
        };
    }, [showOrderForm]);

    if (!place) return (
        <>
            <HeaderAccount customerId={customerId} />
            <div className="container margin-top-90 wrapper place-detail-page">
                <div
                    className="row message-block-76"
                >
                    <div className="col-xl-1 col-lg-3 col-sm-3 back-button">
                        <NavButtons />
                    </div>
                    <div className="col-xl-7 col-lg-10 col-12">

                    </div>
                </div>
            </div>
            <FooterAccount />
        </>
    );

    return (
        <>
            <HeaderAccount customerId={customerId} />

            <div className="container margin-top-90 wrapper place-detail-page">
                <div
                    className="row message-block-76"
                    style={notActivePlace ? { minHeight: "100px" } : {}}
                >
                    <div className="col-xl-1 col-lg-3 col-sm-3 back-button">
                        <NavButtons />
                    </div>
                    <div className="col-xl-7 col-lg-10 col-12">
                        {successMessage && (
                            <p className="alert alert-success">{successMessage}</p>
                        )}
                        {!place.data_sent && (
                            <p className="alert alert-warning">
                                {messagePlaceWait}
                            </p>
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
                                {!showEditForm ? (
                                    <>
                                        {currentOrder ? (
                                            <DarkTooltip title={currentData?.place?.no_edit_place || "Nemůžete změnit místo, dokud jsou nedokončené objednávky"} placement="top" arrow>
                                                <FontAwesomeIcon
                                                    icon={faPenToSquare}
                                                    className="settings"
                                                    style={{ cursor: "pointer" }}
                                                />
                                            </DarkTooltip>
                                        ) : (
                                            <DarkTooltip title={currentData?.place.edit_place || "Upravit místo"} placement="top" arrow>
                                                <FontAwesomeIcon
                                                    icon={faPenToSquare}
                                                    className="settings"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => setShowEditForm(true)}
                                                />
                                            </DarkTooltip>
                                        )}
                                    </>
                                ) : (
                                    <DarkTooltip title={currentData?.form.close || "Zavřít"} placement="top" arrow>
                                    <FontAwesomeIcon
                                        icon={faSquareXmark}
                                        className="settings"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => setShowEditForm(false)}
                                    />
                                    </DarkTooltip>
                                )}
                                <h1>{currentData?.place.detail_title || "Podrobnosti o místě"}</h1>
                                {!showEditForm ? (
                                    <div className="place-info">
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
                                        <button
                                            className="btn-submit mt-3"
                                            onClick={() => setShowOrderForm(true)}
                                            disabled={notActivePlace}
                                        >
                                            <FontAwesomeIcon icon={faCartPlus} className="icon" />
                                            <span className="ms-3">{currentData?.buttons.new_order || "Nová objednávka"}</span>
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
                        )}

                    </div>


                </div>

                {loading || forceWait ? (<></>) : (<>
                    {currentOrder && (
                        <div className="row current-order other-card">
                            <div className="col-xl-8 col-lg-10 col-12">
                                <div className="card current-order">

                                    <h3>
                                        {currentData?.order.current_order || "Aktuální objednávka"}{" "}
                                        {currentOrder?.rp_contract_external_id ? `č.${currentOrder.rp_contract_external_id}` : ""}
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
                                            <strong>{currentData?.form.type_ship || "Typ závozu" }: </strong>
                                            {currentOrder.type_ship === "pickup_ship_dif" && (currentData?.order.type_sipping_1_in_3 || "Vyzvednuti a dodání v rozdilné dny")}
                                            {currentOrder.type_ship === "pickup_ship_one" && (currentData?.order?.type_sipping_clear_for_dirty || "Výměna čistého prádla za špinavé")}
                                            {currentOrder.type_ship === "one_time" && (currentData?.order.one_time || "Jednorázová objednávka")}
                                            {currentOrder.type_ship === "quick_order" && (currentData?.order.quick || "Rychlé doručení")}
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

                                    {!cancelableOrders && (
                                        <button
                                            className="btn-link mt-2"
                                            onClick={async () => {
                                                if (currentOrder) {
                                                    try {
                                                        await handleStopOrder(currentOrder.id);
                                                    } catch (error) {
                                                        console.error("Failed to stop order:", error);
                                                    }
                                                }
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faPowerOff} className="icon" />
                                            <span className="ms-2">{currentData?.buttons.cancel || "Stornovat"}</span>
                                        </button>
                                    )}


                                </div>
                            </div>
                        </div>
                    )}
                </>)}

                <div className="row mt-4">
                    <div className="col-xl-8 col-lg-10 col-12">
                        <OrderHistory
                            placeId={place.id}
                            hasMoreOrders={false}
                            orders={orderHistory}
                            setOrders={setOrderHistory}
                            stopedOrder={stopedOrder}
                        />
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
                                currentData?.messages.order_created || "Objednávka úspěšně vytvořená"
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
            <FooterAccount />
        </>
    );
};

export default PlaceDetails;