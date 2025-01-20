import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faSquareXmark, faCartPlus, faPowerOff } from "@fortawesome/free-solid-svg-icons";
import HeaderAccount from "../HeaderAccount";
import Footer from "../Footer";
import PlaceEdit from "./PlaceEdit";
import OrderForm from "../order/OrderForm";
import { fetchWithAuth } from "../account/auth";
import OrderHistory from "../order/OrderHistory";

function DetailPlace ({ language, languageData, handleLanguageChange }) {
  const { id } = useParams(); // Получаем ID места из URL
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false); // for customer detail
  const [showOrderForm, setShowOrderForm] = useState(false); // for order
  const [successMessage, setSuccessMessage] = useState(""); 

  const { placeId } = useParams();
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [visibleOrders, setVisibleOrders] = useState(10); // Показываем первые 10 заказов
  const [hasMoreOrders, setHasMoreOrders] = useState(false); // Индикатор наличия ещё заказов

  useEffect(() => {
    // Получение данных о месте по ID
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

  useEffect(() => {
    const fetchOrders = async () => {
        try {
            const response = await fetchWithAuth(`http://127.0.0.1:8000/api/order/${id}/orders/`);
            if (response.ok) {
                const orders = await response.json();

                // Разделяем заказы на текущий и остальные
                const current = orders.find(order => order.every_week && !order.end_order);
                const history = orders.filter(order => !(order.every_week && !order.end_order));

                setCurrentOrder(current);
                setOrderHistory(history);
                setHasMoreOrders(history.length > 10); // Устанавливаем флаг, если заказов больше 10
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
}, [placeId]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this place?")) {
      try {
        const response = await fetchWithAuth(
          `http://127.0.0.1:8000/api/place/delete/${id}/`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
        //   alert("Place deleted successfully!");
          navigate("/account", { state: { successMessage: "Place deleted successfully!" } });
        } else {
          console.error("Failed to delete place.");
        }
      } catch (error) {
        console.error("Error deleting place:", error);
      }
    }
  };

  const handleOrderSuccess = (data) => {
    // alert(`Order created successfully for ${place.place_name}`);
    setShowOrderForm(false);
  };

  const loadMoreOrders = () => {
    // Увеличиваем количество отображаемых заказов
    setVisibleOrders((prevVisibleOrders) => {
        const newVisibleCount = prevVisibleOrders + 10;
        setHasMoreOrders(newVisibleCount < orderHistory.length); // Проверяем, есть ли ещё заказы
        return newVisibleCount;
    });
};

  if (loading) return <p>Loading...</p>;
  if (!place) return <p>Place not found.</p>;

  return (
    <>
        <HeaderAccount
          language={language}
          languageData={languageData}
          handleLanguageChange={handleLanguageChange}
        />

        <div className="container margin-top-130 wrapper place-detail-page">
          
            <div className="row other-card">
              
                <div className="col-lg-8 col-md-10 col-12">
                    {successMessage && <p className="alert alert-success">{successMessage}</p>} 
                </div>

                <div className="col-lg-8 col-md-10 col-12">
                  
                    <div className="card place-details">
                      

                        {!showEditForm ? (
                        <FontAwesomeIcon
                            icon={faPenToSquare}
                            className="settings"
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowEditForm(true)}
                            data-tooltip-id="edit-tooltip"
                        />
                      ) : (
                        <FontAwesomeIcon
                            icon={faSquareXmark}
                            className="settings"
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowEditForm(false)}
                            data-tooltip-id="cross-tooltip"
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
                                            <strong>Address:</strong> {place.rp_street}, {place.rp_city},{" "}
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
                                
                                <div className="row mb-2">
                                    <div className="col-12">
                                        <div className="form-control">
                                            <strong>Phone:</strong> {place.rp_phone}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="row mb-2">
                                    <div className="col-12">
                                        <div className="form-control">
                                        <strong>Email:</strong> {place.rp_email}
                                        </div>
                                    </div>
                                </div>
                        
                                <button className="btn-submit mt-3" onClick={() => setShowOrderForm(true)}>
                              
                                    <FontAwesomeIcon icon={faCartPlus} className="icon" />
                          
                                  <span className="ms-3">new order</span>
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
            
                 {/* Текущий заказ */}
                 {currentOrder ? (
                <div className="row current-order other-card">
                  
                    <div className="col-lg-8 col-md-10 col-12">
                      
                        <div className="card current-order">
                          
                            <h3>Current Order</h3>
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
                
                            <button className="btn-link mt-2">
                            <FontAwesomeIcon icon={faPowerOff} className="icon" />
                              <span className="ms-2">stop order</span>
                              </button>

                        </div>        
              
                    </div>

                </div>
            ) : (
                <p>No active weekly orders.</p>
            )}
            
        
        {/* История заказов */}
        <div className="row mt-4">
            <div className="col-lg-8 col-md-10 col-12">
                <OrderHistory placeId={place.id} />
            </div>
        </div>
        
      
            {showOrderForm && (
              <OrderForm
              placeId={place.id}
              onClose={() => setShowOrderForm(false)}
              onSuccess={(newOrder) => {
                setSuccessMessage(`Order created successfully for place: ${newOrder.place}`);
                setTimeout(() => setSuccessMessage(""), 5000); // Очистить сообщение через 5 секунд
                setShowOrderForm(false); // Закрыть форму
            }}
            />
            )}
    
        </div>
    <Footer language={language} languageData={languageData} />
    </>
  );
};

export default DetailPlace;