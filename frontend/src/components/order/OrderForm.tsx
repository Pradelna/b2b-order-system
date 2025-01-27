import { useState, useEffect } from "react";
import { fetchWithAuth } from "../account/auth";

interface OrderFormProps {
  placeId?: string; // Optional because it may not always be provided
  onClose: () => void;
  onSuccess: (message: string) => void;
}

interface Place {
  id: string;
  place_name: string;
}

const OrderForm: React.FC<OrderFormProps> = ({ placeId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    place: placeId || "",
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
    rp_customer_note: "",
    terms: false,
  });

  const [places, setPlaces] = useState<Place[]>([]);
  const [useCustomDays, setUseCustomDays] = useState(false);

  useEffect(() => {
    // Automatically select the only available place
    if (!placeId && places.length === 1) {
      setFormData((prev) => ({ ...prev, place: places[0].id }));
    }
  }, [places, placeId]);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await fetchWithAuth("http://127.0.0.1:8000/api/place/list/");
        if (response.ok) {
          const data: Place[] = await response.json();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Toggle custom days based on system selection
    if (name === "system" && value === "Own") {
      setUseCustomDays(true);
    } else if (name === "system") {
      setUseCustomDays(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth("http://127.0.0.1:8000/api/order/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          system: useCustomDays ? null : formData.system,
          place: placeId || formData.place,
        }),
      });

      if (response.ok) {
        onSuccess("Order created successfully!");
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
                disabled={!!placeId}
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
          {/* ...Other form fields as in the original... */}

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