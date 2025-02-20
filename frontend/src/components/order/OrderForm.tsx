import {useState, useEffect, useContext} from "react";
import { LanguageContext } from "../../context/LanguageContext";
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [showDaySystem, setShowDaySystem] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_URL;
  const { currentData } = useContext(LanguageContext);

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
  const [useOnetimeOrder, setUseOnetimeOrder] = useState(false);



  // Generate available dates based on the system
  const getAvailableDates = () => {
    const availableDates: string[] = [];
    const today = new Date();
    today.setDate(today.getDate() + 1); // Start from tomorrow

    // Define selected days for "Own" system
    const selectedDays = {
      monday: formData.monday,
      tuesday: formData.tuesday,
      wednesday: formData.wednesday,
      thursday: formData.thursday,
      friday: formData.friday,
    };

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

      if (formData.system === "Tue_Thu" && (dayOfWeek === 2 || dayOfWeek === 4)) {
        availableDates.push(date.toISOString().split("T")[0]); // Add Tuesday & Thursday
      } else if (formData.system === "Mon_Wed_Fri" && (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5)) {
        availableDates.push(date.toISOString().split("T")[0]); // Add Monday, Wednesday & Friday
      } else if (formData.system === "Every_day" || formData.system === "One_time" && (
          dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4 || dayOfWeek === 5
      )) {
        availableDates.push(date.toISOString().split("T")[0]); // Add weekdays
      }
      // ✅ NEW: "Own" system uses only selected weekdays
      else if (formData.system === "Own") {
        const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const selectedDayName = dayNames[dayOfWeek];

        if (selectedDays[selectedDayName]) {
          availableDates.push(date.toISOString().split("T")[0]);
        }
      }
    }
    return availableDates;
  };

  // Handle input changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: checked };

      // Apply restriction logic only for pickup_ship_dif
      if (prev.type_ship === "pickup_ship_dif") {
        const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
        const index = days.indexOf(name);

        if (checked) {
          // Disable adjacent days when a new day is selected
          if (index > 0) updatedFormData[days[index - 1]] = false;
          if (index < days.length - 1) updatedFormData[days[index + 1]] = false;
        }
      }

      return updatedFormData;
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const formattedDate = new Date(value).toISOString().split("T")[0];

    setFormData((prev) => {
      if (name === "date_delivery") {
        const pickupDate = new Date(prev.date_pickup);
        const selectedDeliveryDate = new Date(value);
        const minDeliveryDate = new Date(pickupDate);
        minDeliveryDate.setDate(pickupDate.getDate() + 1);

        if (selectedDeliveryDate < minDeliveryDate) {
          alert("Delivery date must be at least 1 day after the pickup date.");
          return prev; // Prevent updating
        }
      }

      return { ...prev, [name]: formattedDate };
    });
  };

  const handleSystemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const availableDates = getAvailableDates();
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      date_start_day: availableDates[0] || prev.date_start_day,
    }));
    setUseCustomDays(value === "Own");
    setUseOnetimeOrder(value === "One_time");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value, };

      // If "pickup_ship_dif" is selected, set system to "Own" and hide it
      if (name === "type_ship" && value === "pickup_ship_dif") {
        updatedData.system = "Own";
        setUseCustomDays(true); // Hide system select field
      }
      // if "pickup_ship_dif" clear days checkbox
      if (prev.type_ship === "pickup_ship_dif") {
        setShowDaySystem(true);
        updatedData.monday = false;
        updatedData.tuesday = false;
        updatedData.wednesday = false;
        updatedData.thursday = false;
        updatedData.friday = false;
        console.log("show true");
      }
      // if "pickup_ship_one" clear days checkbox
      if (prev.type_ship === "pickup_ship_one") {
        setShowDaySystem(false);
        updatedData.monday = false;
        updatedData.tuesday = false;
        updatedData.wednesday = false;
        updatedData.thursday = false;
        updatedData.friday = false;
        console.log("show false");
      }
      // If another type is selected, show system select field again
      else if (name === "type_ship") {
        setShowDaySystem(true);
        console.log("show true");
        if (value === "pickup_ship_dif") {
          setUseCustomDays(true);
          updatedData.system = "Own"; // Force Own system
        } else if (value === "pickup_ship_one" || value === "") {
          setUseCustomDays(false);
          updatedData.system = "";
        }
      }
      return updatedData;
    });
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
      system: formData.system,
      place: placeId || formData.place,
      date_pickup: formatDate(formData.date_pickup),
      date_delivery: formatDate(formData.date_delivery),
      date_start_day: formatDate(formData.date_start_day),
    };

    // console.log("🚀 Submitting Order Data:", formattedData); // Debug log

    try {
      const response = await fetchWithAuth(`${BASE_URL}/order/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const responseData = await response.json();

      if (response.ok) {
        // console.log("✅ Order Created:", responseData);
        onSuccess(responseData);
        setSuccessMessage(`Order created successfully: ${responseData}`);
      } else {
        console.error("❌ Failed Response:", responseData);
        alert("Failed to create order: " + JSON.stringify(responseData));
      }
    } catch (error) {
      console.error("🔥 Error submitting form:", error);
    }
  };

  useEffect(() => {
    setFormData((prev) => {
      const minDeliveryDate = new Date(prev.date_pickup);
      minDeliveryDate.setDate(minDeliveryDate.getDate() + 1); // Ensure it's at least 1 day after

      return {
        ...prev,
        date_delivery: minDeliveryDate.toISOString().split("T")[0], // Update `date_delivery`
      };
    });
  }, [formData.date_pickup]); // Runs when `date_pickup` changes

  useEffect(() => {
    // Automatically select the only available place
    if (!placeId && places.length === 1) {
      setFormData((prev) => ({ ...prev, place: places[0].id }));
    }
  }, [places, placeId]);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await fetchWithAuth(`${BASE_URL}/place/list/`);
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

  return (
      <div className="modal-backdrop">
        <div className="modal-wrapper">
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
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
                      required
                  >
                    <option value="">Select Type</option>
                    <option value="pickup_ship_one">{currentData.order.type_sipping_clear_for_dirty}</option>

                    <option value="pickup_ship_dif">{currentData.order.type_sipping_1_in_3}</option>
                  </select>
                </div>
              </div>

              {/* System or Days of the Week */}
              <div className="row mb-3">
                <div className={`col-12 days ${showDaySystem ? "display-none" : ""}`}>
                  <p>Choose days</p>
                </div>
                <div className={`day-system-hide ${showDaySystem ? "opacity-1" : "opacity-0 height-1 z-index-1"}`}>
                  <div className="col-12 label-form">
                    <label htmlFor="system">System*</label>
                  </div>
                  <div className="col-12">
                    <select
                        className="form-control"
                        name="system"
                        value={formData.system}
                        onChange={handleSystemChange}
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
              </div>


              {useCustomDays && (
                  <div className="row mb-3">
                    <div className="col-12">
                      {["monday", "tuesday", "wednesday", "thursday", "friday"].map((day, index, days) => {
                        const isPickupDif = formData.type_ship === "pickup_ship_dif";
                        const isOwnSystem = formData.system === "Own";
                        const isPickupOne = formData.type_ship === "pickup_ship_one";

                        // Check if the current day has adjacent selected days
                        const hasPrevSelected = index > 0 && formData[days[index - 1]];
                        const hasNextSelected = index < days.length - 1 && formData[days[index + 1]];

                        return (
                            <div className="form-check" key={day}>
                              <input
                                  className="form-check-input"
                                  type="checkbox"
                                  name={day}
                                  checked={formData[day]}
                                  onChange={handleCheckboxChange}
                                  disabled={
                                      isPickupDif && // Disable adjacent selection only if "pickup_ship_dif" is selected
                                      !formData[day] && // Only prevent new selection, not previously selected ones
                                      (hasPrevSelected || hasNextSelected)
                                  }
                              />
                              <label className="form-check-label" htmlFor={day}>
                                {day.charAt(0).toUpperCase() + day.slice(1)}
                              </label>
                            </div>
                        );
                      })}
                    </div>
                  </div>
              )}

              {/* Date Start Day with restricted options */}
              {!useOnetimeOrder && (

                  <div className="row mb-3">
                    <div className="col-12 label-form">
                      <label htmlFor="date_start_day">Start Day*</label>
                    </div>
                    <div className="col-12">
                      <select
                          className="form-control"
                          name="date_start_day"
                          value={formData.date_start_day}
                          onChange={handleDateChange}
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
              {useOnetimeOrder && (
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
                            onChange={handleDateChange}
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
                            onChange={handleDateChange}
                            required
                        >
                          {getAvailableDates()
                              .filter(date => new Date(date) > new Date(formData.date_pickup).setDate(new Date(formData.date_pickup).getDate() + 0))
                              .map((date) => (
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
              {!useOnetimeOrder && (
                  <div className="row mb-3">
                    <div className="col-1">
                      <div className="checkbox-wrapper-19">
                        <input
                            id="every_week"
                            className="form-check-input"
                            type="checkbox"
                            name="every_week"
                            checked={formData.every_week}
                            onChange={handleCheckboxChange}
                        />
                        <label htmlFor="every_week" className="check-box" />
                      </div>
                    </div>
                    <div className="col-11">Every Week</div>
                  </div>
              )}



              {/* Note */}
              <div className="row mb-3">
                <div className="col-12 label-form">
                  <label>Note</label>
                </div>
                <div className="col-12">
              <textarea
                  className="form-control"
                  name="rp_customer_note"
                  value={formData.rp_customer_note}
                  onChange={handleInputChange}
                  rows={2} // Allows multiple lines
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
                        onChange={handleCheckboxChange}
                        required
                        style={{ opacity: 0 }}
                    />

                    <label htmlFor="terms" className="check-box" />
                  </div>
                </div>
                <div className="col-11">
                  Terms of Use
                  {showError && !formData.terms && (<p className="text-danger mt-1">You must accept the Terms of Use</p>)}
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

      </div>
  );
};

export default OrderForm;