import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faStopwatch } from "@fortawesome/free-solid-svg-icons";
import { LanguageContext } from "../../context/LanguageContext";
import { Link } from "react-router-dom";
import React, {useContext} from "react";

interface Order {
    rp_place_title: string;
    system: string;
    monday?: boolean;
    tuesday?: boolean;
    wednesday?: boolean;
    thursday?: boolean;
    friday?: boolean;
    saturday?: boolean;
    sunday?: boolean;
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
    const { currentData } = useContext(LanguageContext);
    const { order } = newOrder;
    const isPlaceDetailPage = window.location.pathname.includes(`/place/${order.place}`);

    return (
        <div className="order-message">
            <div className="modal-backdrop">
                <div className="modal-wrapper">
                    <div className="modal-content text-center">
                        <FontAwesomeIcon icon={faCircleCheck} style={{ color: "#00aab7", height: "40px" }} />
                        <h3>{currentData?.success?.success || "Hotovo!"}</h3>


                        <p>{currentData?.success?.order_success || "Objednávka byla úspěšně vytvořena"}</p>
                        <p>{ currentData?.form?.place || "Misto" }: {order.rp_place_title}</p>

                        <p>
                            { currentData.form["type_ship"] || "Typ závozu" }:{<br/>}
                            {{
                                "pickup_ship_one": currentData?.order.type_sipping_clear_for_dirty || "Výměna čistého prádla za špinavé",
                                "pickup_ship_dif": currentData?.order.type_sipping_1_in_3 || "Vyzvednuti a dodání v rozdilné dny",
                                "one_time": currentData?.order.one_time || "Jednorázová objednávka",
                                "quick_order": currentData?.order.one_time || "Express objednávka",

                            }[order.type_ship] || order.type_ship}
                        </p>

                        {/* Даты */}
                        {order.type_ship === "one_time" || order.type_ship === "quick_order" ? (
                            <>
                                <p>{currentData?.form?.pickup || "Vyzvednutí"}: {order.date_pickup}</p>
                                <p>{currentData?.form?.delivery || "Dodání"}: {order.date_delivery}</p>
                            </>
                        ) : (
                            <>
                                <p>{ currentData?.form?.start_day || "Začátek závozu" }: {order.date_start_day}</p>

                                {/* Отображение системы */}
                                {order.system && (
                                    <p>
                                        { currentData.form["system"] || "Systém" }:{<br />}
                                        {{
                                            "Tue_Thu": currentData.order.tue_thu || "Úterý čtvrte",
                                            "Mon_Wed_Fri": currentData.order.mon_wed_fri || "Pondělí středa pátek",
                                            "Every_day": currentData.order.every_day || "Každý pracovní den",
                                            "Every_day_with_weekend": currentData.order.every_day_with_weekend || "Každý den a na víkend",
                                            "Own": currentData.order.own_system || "Vlastní systém",
                                            "One_time": currentData?.order.one_time || "Jednorázová objednávka",

                                        }[order.system] || order.system}
                                    </p>
                                )}

                                {/* Дни недели, если система "Own" */}
                                {order.system === "Own" && (
                                    <>
                                        {order.monday && (currentData?.form.monday || "Pondělí")}{" "}
                                        {order.tuesday && (currentData?.form.tuesday || "Úterý")}{" "}
                                        {order.wednesday && (currentData?.form.wednesday || "Středa")}{" "}
                                        {order.thursday && (currentData?.form.thursday || "Čtvrtek")}{" "}
                                        {order.friday && (currentData?.form.friday || "Pátek")}{" "}
                                        {order.saturday && (currentData?.form.saturday || "Sobota")}{" "}
                                        {order.sunday && (currentData?.form.sunday || "Neděle")}{" "}
                                    </>
                                )}
                            </>
                        )}

                        <p>{ currentData?.success?.message_mistake_1 || "Pokud jste udělali chybu, můžete zrušit" }
                            {isPlaceDetailPage ? (
                                <> { currentData?.success?.message_mistake_2 || "tatu objednávku" } </>
                            ) : (
                                <Link
                                    to={`/place/${order.place}`}
                                    className="text-primary text-decoration-underline ms-1"
                                >
                                    { currentData?.success?.message_mistake_2 || "tatu objednávku" }
                                </Link>
                            )}
                            <span> { currentData?.success?.message_mistake_3 || "a vytvořit novou." }</span>
                        </p>

                        <FontAwesomeIcon icon={faStopwatch} style={{ height: "30px" }} />
                        <p>{ currentData?.success?.message_mate_30 || "Máte na to 30 minut." }</p>

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