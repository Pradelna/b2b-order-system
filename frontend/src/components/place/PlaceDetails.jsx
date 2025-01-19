import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderAccount from "../HeaderAccount";
import Footer from "../Footer";
import PlaceEdit from "./PlaceEdit";
import OrderForm from "../order/OrderForm";
import { fetchWithAuth } from "../account/auth";

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
    alert(`Order created successfully for ${place.place_name}`);
    setShowOrderForm(false); // Закрываем форму после успешного создания
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

        <div className="container margin-top-130 wrapper">
          
            <div className="row other-card">
              
                <div className="col-12">
                    {successMessage && <p className="alert alert-success">{successMessage}</p>} 
                </div>

                <div className="card">
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
                        

                        <button
                            className="btn-submit mt-3"
                            onClick={() => setShowEditForm(true)}
                        >
                            Edit Place
                        </button>
                        <button className="btn-link mt-3" onClick={handleDelete}>
                            Delete Place
                        </button>
                        </div>
                    ) : (
                        <PlaceEdit
                        place={place}
                        onClose={() => setShowEditForm(false)}
                        onPlaceUpdated={setPlace}
                        />
                    )}
                        
                </div>
                
            </div>
            
                 {/* Текущий заказ */}
                 {currentOrder ? (
                <div className="current-order">
                    <h3>Current Order</h3>
                    <div className="order-details">
                        <p><strong>Type of Shipping:</strong> {currentOrder.type_ship}</p>
                        <p><strong>System:</strong> {currentOrder.system || "Custom Days"}</p>
                        {currentOrder.system === null && (
                            <div>
                                <p><strong>Days:</strong></p>
                                <ul>
                                    {currentOrder.monday && <li>Monday</li>}
                                    {currentOrder.tuesday && <li>Tuesday</li>}
                                    {currentOrder.wednesday && <li>Wednesday</li>}
                                    {currentOrder.thursday && <li>Thursday</li>}
                                    {currentOrder.friday && <li>Friday</li>}
                                </ul>
                            </div>
                        )}
                        <p><strong>Pickup Date:</strong> {currentOrder.date_pickup}</p>
                        <p><strong>Delivery Date:</strong> {currentOrder.date_delivery}</p>
                        <p><strong>Problem Description:</strong> {currentOrder.rp_problem_description || "None"}</p>
                    </div>
                </div>
            ) : (
                <p>No active weekly orders.</p>
            )}
            
            {/* Button to open OrderForm */}
            <button onClick={() => setShowOrderForm(true)}>Create Order</button>
            
        
        {/* История заказов */}
        <div className="order-history">
                <h3>Order History</h3>
                {orderHistory.length > 0 ? (
                    <ul>
                        {orderHistory.map(order => (
                            <li key={order.id}>
                                <p><strong>Type of Shipping:</strong> {order.type_ship}</p>
                                <p><strong>Pickup Date:</strong> {order.date_pickup}</p>
                                <p><strong>Delivery Date:</strong> {order.date_delivery}</p>
                                <p><strong>Status:</strong> {order.end_order ? "Completed" : "In Progress"}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No order history available.</p>
                )}
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