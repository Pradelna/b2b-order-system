import React, { useState } from "react";
import { fetchWithAuth } from "../account/auth";

const PlaceEdit = ({ place, onClose, onPlaceUpdated, onDelete }) => {
  const [formData, setFormData] = useState({
    place_name: place?.place_name || "",
    rp_city: place?.rp_city || "",
    rp_street: place?.rp_street || "",
    rp_number: place?.rp_number || "",
    rp_zip: place?.rp_zip || "",
    rp_person: place?.rp_person || "",
    rp_phone: place?.rp_phone || "",
    rp_email: place?.rp_email || ""
  });

  const fieldLabels = {
    place_name: "Place Name",
    rp_city: "City",
    rp_street: "Street",
    rp_number: "Number",
    rp_zip: "ZIP Code",
    rp_person: "Contact Person",
    rp_phone: "Phone",
    rp_email: "Email",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth(
        `http://127.0.0.1:8000/api/order/place/${place.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (response.ok) {
        const updatedPlace = await response.json();
        onPlaceUpdated(updatedPlace); // Обновляем данные места
        onClose(); // Закрываем форму
        alert("Place updated successfully!");
      } else {
        console.error("Failed to update place.");
      }
    } catch (error) {
      console.error("Error updating place:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      
      {Object.entries(formData).map(([key, value]) => (
        <div className="mb-3" key={key}>
          <label className="form-label">{fieldLabels[key] || key.replace("rp_", "").toUpperCase()}</label>
          <input
            className="form-control"
            type="text"
            name={key}
            value={value}
            onChange={handleChange}
            required={key !== "rp_person" && key !== "rp_phone" && key !== "rp_email"}
          />
        </div>
      ))}
      <div className="row">
        <div className="col-6">
            <button type="submit" className="btn btn-submit">
              Save Changes
            </button>
        </div>
        <div className="col-6">
            <button
              type="button"
              className="btn btn-link"
              onClick={onDelete}
              >
              Delete Place
          </button>
        </div>
      </div>
      
  </form>
  );
};

export default PlaceEdit;