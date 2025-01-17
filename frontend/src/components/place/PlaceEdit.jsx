import React, { useState } from "react";
import { fetchWithAuth } from "../account/auth";

const PlaceEdit = ({ place, onClose, onPlaceUpdated }) => {
  const [formData, setFormData] = useState({ ...place });

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
          <label className="form-label">{key.replace("rp_", "").toUpperCase()}</label>
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
      <button type="submit" className="btn btn-success">
        Save Changes
      </button>
      <button
        type="button"
        className="btn btn-secondary ms-2"
        onClick={onClose}
      >
        Cancel
      </button>
    </form>
  );
};

export default PlaceEdit;