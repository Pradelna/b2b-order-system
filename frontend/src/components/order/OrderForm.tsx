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
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1); // Get tomorrow's date
  const formattedTomorrow = tomorrow.toISOString().split("T")[0]; // Convert to YYYY-MM-DD
  const [formData, setFormData] = useState({
    place: placeId || "",
    type_ship: "",
    system: "",
    date_start_day:  formattedTomorrow,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    date_pickup:  formattedTomorrow,
    date_delivery:  formattedTomorrow,
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

  // Generate available dates based on the system
  const getAvailableDates = () => {
    const availableDates: string[] = [];
    const today = new Date();
    today.setDate(today.getDate() + 1); // Start from tomorrow

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

      if (formData.system === "Tue_Thu" && (dayOfWeek === 2 || dayOfWeek === 4)) {
        availableDates.push(date.toISOString().split("T")[0]); // Add Tuesday & Thursday
      } else if (formData.system === "Mon_Wed_Fri" && (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5)) {
        availableDates.push(date.toISOString().split("T")[0]); // Add Monday, Wednesday & Friday
      } else if (formData.system === "Every_day" || formData.system === "Own" || formData.system === "One_time" && (
          dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4 || dayOfWeek === 5
      )) {
        availableDates.push(date.toISOString().split("T")[0]); // Add Monday, Wednesday & Friday
      }
    }
    return availableDates;
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target;

    // Проверяем, чекбокс ли это
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    console.log(`🔄 Updated ${name} to ${newValue}`);

    if (name === "system") {
      const availableDates = getAvailableDates();
      setFormData((prev) => ({
        ...prev,
        date_start_day: availableDates[0] || prev.date_start_day, // Update date selection to first valid option
      }));
      // Toggle custom days based on system selection
      if (value === "Own") {
        setUseCustomDays(true);
      } else if (name === "system") {
        setUseCustomDays(false);
      }
    }
    // Ensure dates are properly formatted
    if (name === "date_pickup" || name === "date_delivery" || name === "date_start_day") {
      const formattedDate = new Date(value).toISOString().split("T")[0]; // Convert to YYYY-MM-DD
      setFormData((prev) => ({
        ...prev,
        [name]: formattedDate,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure dates are properly formatted as YYYY-MM-DD
    const formatDate = (date: string) => {
      if (!date) return "";
      return date.split("T")[0]; // Extract YYYY-MM-DD
    };

    const formattedData = {
      ...formData,
      system: useCustomDays ? null : formData.system,
      place: placeId || formData.place,
      date_pickup: formatDate(formData.date_pickup),
      date_delivery: formatDate(formData.date_delivery),
      date_start_day: formatDate(formData.date_start_day),
    };

    console.log("🚀 Submitting Order Data:", formattedData); // Debug log

    try {
      const response = await fetchWithAuth("http://127.0.0.1:8000/api/order/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log("✅ Order Created:", responseData);
        onSuccess(responseData.order);
      } else {
        console.error("❌ Failed Response:", responseData);
        alert("Failed to create order: " + JSON.stringify(responseData));
      }
    } catch (error) {
      console.error("🔥 Error submitting form:", error);
    }
  };

  useEffect(() => {
    console.log("🟢 FormData Updated:", formData);
  }, [formData]);

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Create New Order</h3>
        <form key={JSON.stringify(formData)} onSubmit={handleSubmit}>
          {/* Place Dropdown */}
          <div className="row mb-3">
            <div className="col-12 label-form">
              <label htmlFor="place">Place*</label>
            </div>
            <div className="col-12">
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
          <div className="row mb-3">
            <div className="col-12 label-form">
              <label htmlFor="type_ship">Type of Shipping*</label>
            </div>
            <div className="col-12">
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
            <div className="col-12 label-form">
              <label htmlFor="system">System*</label>
            </div>
            <div className="col-12">
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
                <option value="One_time">One time order</option>
              </select>
            </div>
          </div>


          {useCustomDays && (
              <div className="row mb-3">
                <div className="col-12 label-form">
                  <label>Days of the Week</label>
                </div>
                <div className="col-12">
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

          {/* Date Start Day with restricted options */}
          {formData.system != "One_time" && (

              <div className="row mb-3">
                <div className="col-12 label-form">
                  <label htmlFor="date_start_day">Start Day*</label>
                </div>
                <div className="col-12">
                  <select
                      className="form-control"
                      name="date_start_day"
                      value={formData.date_start_day}
                      onChange={handleChange}
                      required
                  >
                    {getAvailableDates().map((date) => (
                        <option key={date} value={date}>
                          {new Date(date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric"
                          })}
                        </option>
                    ))}
                  </select>
                </div>
              </div>
          )}

          {/* Date Pickup */ /* Date Delivery */}
          {formData.system === "One_time" && (
              <>

                <div className="row mb-3">
                  <div className="col-12 label-form">
                    <label htmlFor="date_pickup">Pick-up Date*</label>
                  </div>
                  <div className="col-12">
                    <select
                        className="form-control"
                        name="date_pickup"
                        value={formData.date_pickup}
                        onChange={handleChange}
                        required
                    >
                      {getAvailableDates().map((date) => (
                          <option key={date} value={date}>
                            {new Date(date).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "short",
                              day: "numeric"
                            })}
                          </option>
                      ))}
                    </select>
                  </div>
                </div>


                <div className="row mb-3">
                  <div className="col-12 label-form">
                    <label htmlFor="date_delivery">Delivery Date*</label>
                  </div>
                  <div className="col-12">
                    <select
                        className="form-control"
                        name="date_delivery"
                        value={formData.date_delivery}
                        onChange={handleChange}
                        required
                    >
                      {getAvailableDates().map((date) => (
                          <option key={date} value={date}>
                            {new Date(date).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "short",
                              day: "numeric"
                            })}
                          </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
          )}

          {/* Every Week */}
          <div className="row mb-3">
            <div className="col-3 label-form">
              <label htmlFor="every_week">Every Week</label>
            </div>
            <div className="col-9 label-form">
              <input
                  className="form-check-input"
                  type="checkbox"
                  name="every_week"
                  checked={formData.every_week}
                  onChange={handleChange}
              />
            </div>
          </div>

          {/* Note */}
          <div className="row mb-3">
            <div className="col-12 label-form">
              <label>Note</label>
            </div>
            <div className="col-12">
              <textarea
                  className="form-control"
                  name="rp_customer_note"
                  value={formData.rp_customer_note} // Use value instead of checked
                  onChange={handleChange}
                  rows={4} // Allows multiple lines
                  placeholder="Enter your notes here..."
              />
            </div>
          </div>


          {/* Terms */}
          <div className="row mb-3">
            <div className="col-1">
              <div className="checkbox-wrapper-19">
                <input
                    id="terms"
                    className="form-check-input"
                    type="checkbox"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                    required
                />
                <label htmlFor="terms" className="check-box" />
              </div>
            </div>
            <div className="col-11">Terms of Use</div>
          </div>


          {/* Terms */}
          {/*<div className="row mb-3">*/}
          {/*  <div className="col-3 label-form">*/}
          {/*    <label htmlFor="terms">Terms of Use*</label>*/}
          {/*  </div>*/}
          {/*  <div className="col-9 label-form">*/}
          {/*    <input*/}
          {/*        className="form-check-input"*/}
          {/*        type="checkbox"*/}
          {/*        name="terms"*/}
          {/*        checked={formData.terms}*/}
          {/*        onChange={handleChange}*/}
          {/*        required*/}
          {/*    />*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/*<div className="checkbox-wrapper-19">*/}
          {/*  <input type="checkbox" id="cbtest-19"/>*/}
          {/*  <label htmlFor="cbtest-19" className="check-box" />*/}
          {/*</div>*/}

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