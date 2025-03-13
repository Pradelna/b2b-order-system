import React, { useState, ChangeEvent, FormEvent } from "react";
import { fetchWithAuth } from "../account/auth.ts";

interface PlaceEditProps {
  place: Place;
  onClose: () => void;
  onPlaceUpdated: (updatedPlace: Place) => void;
  onDelete: () => void;
}

interface Place {
  id: number;
  place_name: string;
  rp_city: string;
  rp_street: string;
  rp_number: string;
  rp_zip: string;
  rp_person?: string;
  rp_phone?: string;
  rp_email?: string;
}

const PlaceEdit: React.FC<PlaceEditProps> = ({
                                               place,
                                               onClose,
                                               onPlaceUpdated,
                                               onDelete,
                                             }) => {
  const [formData, setFormData] = useState<Partial<Place>>({
    place_name: place?.place_name || "",
    rp_city: place?.rp_city || "",
    rp_street: place?.rp_street || "",
    rp_number: place?.rp_number || "",
    rp_zip: place?.rp_zip || "",
    rp_person: place?.rp_person || "",
    rp_phone: place?.rp_phone || "",
    rp_email: place?.rp_email || "",
  });

  const fieldLabels: Record<keyof Place, string> = {
    place_name: "Place Name",
    rp_city: "City",
    rp_street: "Street",
    rp_number: "Number",
    rp_zip: "ZIP Code",
    rp_person: "Contact Person",
    rp_phone: "Phone",
    rp_email: "Email",
  };

  const BASE_URL = import.meta.env.VITE_API_URL;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth(
          `${BASE_URL}/place/edit/${place.id}/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
      );
      console.log(formData);
      if (response.ok) {
        const updatedPlace = await response.json();
        onPlaceUpdated(updatedPlace);
        onClose();
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
              <label className="form-label">
                {fieldLabels[key as keyof Place] || key.replace("rp_", "").toUpperCase()}
              </label>
              <input
                  className="form-control"
                  type="text"
                  name={key}
                  value={value as string}
                  onChange={handleChange}
                  required={
                      key !== "rp_person" && key !== "rp_phone" && key !== "rp_email"
                  }
              />
            </div>
        ))}
        <div className="row">
          <div className="col-sm-6 col-12 mb-2">
            <button type="submit" className="btn btn-submit">
              Save Changes
            </button>
          </div>
          <div className="col-sm-6 col-12">
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