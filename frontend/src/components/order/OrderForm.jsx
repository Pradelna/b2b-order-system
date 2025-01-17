import React, { useState } from "react";
import { fetchWithAuth } from "../account/auth";

const OrderForm = ({ placeId }) => {
  const [orderData, setOrderData] = useState({
    description: "",
    delivery_date: "",
    price: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData({ ...orderData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth(
        `http://127.0.0.1:8000/api/order/create/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...orderData, place: placeId }),
        }
      );
      if (response.ok) {
        alert("Order created successfully!");
      } else {
        console.error("Failed to create order.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Description</label>
        <input
          className="form-control"
          type="text"
          name="description"
          value={orderData.description}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Delivery Date</label>
        <input
          className="form-control"
          type="date"
          name="delivery_date"
          value={orderData.delivery_date}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Price</label>
        <input
          className="form-control"
          type="number"
          name="price"
          value={orderData.price}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Create Order
      </button>
    </form>
  );
};

export default OrderForm;