import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../account/auth";
import PropTypes from "prop-types";

const OrderForm = ({ placeId, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        place: placeId || "", // Если `placeId` передан, оно будет предустановлено
        type_ship: "",
        system: "",
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        date_pickup: "",
        date_delivery: "",
        every_week: false,
        terms: false,
    });
  
    OrderForm.propTypes = {
      placeId: PropTypes.string,
      onClose: PropTypes.func.isRequired,
      onSuccess: PropTypes.func.isRequired,
  };

    const [places, setPlaces] = useState([]);
    const [useCustomDays, setUseCustomDays] = useState(false); // Switcher between system days
    
    useEffect(() => {
      // Если у пользователя одно место, оно автоматически выбирается
      if (!placeId && places.length === 1) {
          setFormData((prev) => ({ ...prev, place: places[0].id }));
      }
  }, [places, placeId]);

    useEffect(() => {
        // Fetch available places for the dropdown
        const fetchPlaces = async () => {
            try {
                const response = await fetchWithAuth("http://127.0.0.1:8000/api/place/list/");
                if (response.ok) {
                    const data = await response.json();
                    setPlaces(data);
                } else {
                    console.error("Failed to fetch places");
                }
            } catch (error) {
                console.error("Error fetching places:", error);
            }
        };

        fetchPlaces();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
        
        // Если пользователь выбирает "Own systems", переключаемся на дни недели
        if (name === "system" && value === "Own") {
          setUseCustomDays(true);
          setFormData((prev) => ({ ...prev, system: "" })); // Сбрасываем поле system
        } else if (name === "system") {
            setUseCustomDays(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetchWithAuth("http://127.0.0.1:8000/api/order/create/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    system: useCustomDays ? null : formData.system, // Если пользователь выбрал дни недели, то system = null
                    place: placeId || formData.place, // Assign place ID if not passed
                }),
            });
            if (response.ok) {
                const data = await response.json();
                onSuccess("Order created successfully!");
                // alert("Order created successfully!");
            } else {
                const errorData = await response.json();
                alert("Failed to create order: " + JSON.stringify(errorData));
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3>Create New Order</h3>
                <form onSubmit={handleSubmit}>
                    {/* Place Dropdown */}
                    <div className="row mb-3">
                        <div className="col-3 label-form">
                            <label htmlFor="place">Place*</label>
                        </div>
                        <div className="col-9">
                            <select
                                className="form-control"
                                name="place"
                                value={placeId || formData.place || ""}
                                onChange={handleChange}
                                required
                                disabled={!!placeId} // Disable if placeId is provided
                            >
                                <option value="">Select Place</option>
                                {places.map((place) => (
                                    <option key={place.id} value={place.id}>
                                        {place.place_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Type of Shipping */}
                    <div className="row mb-3">
                        <div className="col-3 label-form">
                            <label htmlFor="type_ship">Type of Shipping*</label>
                        </div>
                        <div className="col-9">
                            <select
                                className="form-control"
                                name="type_ship"
                                value={formData.type_ship}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="pickup_ship_one">Clear for Dirty</option>
                                <option value="pickup_ship_dif">1 Day Clear, 2 Day Dirty</option>
                            </select>
                        </div>
                    </div>

                    {/* System or Days of the Week */}
                    <div className="row mb-3">
                        <div className="col-3 label-form">
                            <label htmlFor="system">System*</label>
                        </div>
                        <div className="col-9">
                            <select
                                className="form-control"
                                name="system"
                                value={formData.system}
                                onChange={handleChange}
                                required={!useCustomDays}
                            >
                                <option value="">Select System</option>
                                <option value="Mon_Wed_Fri">Monday Wednesday Friday</option>
                                <option value="Tue_Thu">Tuesday Thursday</option>
                                <option value="Every_day">Every Day</option>
                                <option value="Own">Own Systems</option>
                            </select>
                        </div>
                    </div>

                    {useCustomDays && (
                        <div className="row mb-3">
                            <div className="col-3 label-form">
                                <label>Days of the Week</label>
                            </div>
                            <div className="col-9">
                                {["monday", "tuesday", "wednesday", "thursday", "friday"].map((day) => (
                                    <div className="form-check" key={day}>
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name={day}
                                            checked={formData[day]}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor={day}>
                                            {day.charAt(0).toUpperCase() + day.slice(1)}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Date Pickup */}
                    <div className="row mb-3">
                        <div className="col-3 label-form">
                            <label htmlFor="date_pickup">Pick-up Date*</label>
                        </div>
                        <div className="col-9">
                            <input
                                className="form-control"
                                type="date"
                                name="date_pickup"
                                value={formData.date_pickup}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Date Delivery */}
                    <div className="row mb-3">
                        <div className="col-3 label-form">
                            <label htmlFor="date_delivery">Delivery Date*</label>
                        </div>
                        <div className="col-9">
                            <input
                                className="form-control"
                                type="date"
                                name="date_delivery"
                                value={formData.date_delivery}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Every Week */}
                    <div className="row mb-3">
                        <div className="col-3 label-form">
                            <label htmlFor="every_week">Every Week</label>
                        </div>
                        <div className="col-9">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                name="every_week"
                                checked={formData.every_week}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="row mb-3">
                        <div className="col-3 label-form">
                            <label htmlFor="terms">Terms of Use*</label>
                        </div>
                        <div className="col-9">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                name="terms"
                                checked={formData.terms}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Submit and Close Buttons */}
                    <div className="row mt-3">
                        <button className="btn-submit me-2" type="submit">
                            Submit
                        </button>
                        <button className="btn-link" type="button" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderForm;