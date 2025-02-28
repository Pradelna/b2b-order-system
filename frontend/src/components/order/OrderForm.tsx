import { useState, useEffect, useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import { fetchWithAuth } from "../account/auth";

interface OrderFormProps {
  placeId?: string; // Может быть не передан
  onClose: () => void;
  onSuccess: (message: string) => void;
}

interface Place {
  id: string;
  place_name: string;
}

const OrderForm: React.FC<OrderFormProps> = ({ placeId, onClose, onSuccess }) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formattedTomorrow = tomorrow.toISOString().split("T")[0];

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [showDaySystem, setShowDaySystem] = useState(true);
  const [useCustomDays, setUseCustomDays] = useState(false);
  const [useOnetimeOrder, setUseOnetimeOrder] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;
  const { currentData } = useContext(LanguageContext);
  const [alredyCurrentOrder, setAlredyCurrentOrder] = useState(false);
  const [firstStartForm, setFirstStartForm] = useState(true);

  const [formData, setFormData] = useState({
    place: placeId || "",
    type_ship: "",
    system: "",
    date_start_day: formattedTomorrow,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    date_pickup: getAvailablePickupDates()[0],
    date_delivery: "",
    every_week: false,
    rp_customer_note: "",
    terms: false,
  });

  const [places, setPlaces] = useState<Place[]>([]);

  // Functions for calculating available dates
  function getAvailableStartDays() {
    const availableDates: string[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // начинаем с завтрашнего дня

    // if the system is Own, collect list of all days
    let selectedDays: number[] = [];
    if (formData.system === "Own") {
      if (formData.monday) selectedDays.push(1);
      if (formData.tuesday) selectedDays.push(2);
      if (formData.wednesday) selectedDays.push(3);
      if (formData.thursday) selectedDays.push(4);
      if (formData.friday) selectedDays.push(5);
    }

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dayOfWeek = date.getDay();

      if (formData.system === "Own") {
        if (selectedDays.includes(dayOfWeek)) {
          availableDates.push(date.toISOString().split("T")[0]);
        }
      } else if (formData.system === "Tue_Thu" && (dayOfWeek === 2 || dayOfWeek === 4)) {
        availableDates.push(date.toISOString().split("T")[0]);
      } else if (formData.system === "Mon_Wed_Fri" && (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5)) {
        availableDates.push(date.toISOString().split("T")[0]);
      } else if (formData.system === "Every_day" && (dayOfWeek >= 1 && dayOfWeek <= 5)) {
        availableDates.push(date.toISOString().split("T")[0]);
      }
    }
    return availableDates;
  }

  function addWorkingDays(date: Date, days: number): Date {
    const result = new Date(date);
    while (days > 0) {
      result.setDate(result.getDate() + 1);
      // if is not suterday (6) and not sunday (0) – incrise counter
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        days--;
      }
    }
    return result;
  }
  // avaliable pickup days
  function getAvailablePickupDates() {
    const availableDates: string[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dayOfWeek = date.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        availableDates.push(date.toISOString().split("T")[0]);
      }
    }
    return availableDates;
  }
  // availble delivery days
  function getAvailableDeliveryDates() {
    const availableDates: string[] = [];
    const pickupDate = new Date(formData.date_pickup);
    let minDeliveryDate: Date;

    if (formData.type_ship === "quick_order") {
      if (firstStartForm) { // if from open first time
        minDeliveryDate = addWorkingDays(pickupDate, 2);
      } else {
        minDeliveryDate = addWorkingDays(pickupDate, 1);
      }
    } else if (formData.type_ship === "one_time") {
      if (firstStartForm) {
        minDeliveryDate = addWorkingDays(pickupDate, 3);
      } else {
        minDeliveryDate = addWorkingDays(pickupDate, 2);
      }
    } else {
      // Для повторяющихся заказов — допустим, минимум через 1 рабочий день
      minDeliveryDate = addWorkingDays(pickupDate, 1);
    }

    // Генерируем 30 доступных вариантов, прибавляя рабочие дни от минимальной даты
    for (let i = 0; i < 30; i++) {
      const optionDate = addWorkingDays(minDeliveryDate, i);
      availableDates.push(optionDate.toISOString().split("T")[0]);
    }
    return availableDates;
  }

  // Обработчики событий
  const handleStartDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, date_start_day: e.target.value }));
  };

  const handlePickupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      date_pickup: e.target.value,
    }));
    setFirstStartForm(false);
    console.log("handlePickupChange", firstStartForm);
  };

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDeliveryDate = new Date(e.target.value);
    const pickupDate = new Date(formData.date_pickup);
    const minDeliveryDate = new Date(pickupDate);
    minDeliveryDate.setDate(pickupDate.getDate() + 1);
    if (selectedDeliveryDate < minDeliveryDate) {
      alert("Delivery date must be at least 1 day after the pickup date.");
      return;
    }
    setFormData((prev) => ({ ...prev, date_delivery: e.target.value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: checked };
      if (prev.type_ship === "pickup_ship_dif") {
        const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
        const index = days.indexOf(name);
        if (checked) {
          if (index > 0) updatedFormData[days[index - 1]] = false;
          if (index < days.length - 1) updatedFormData[days[index + 1]] = false;
        }
      }
      return updatedFormData;
    });
  };

  // Универсальный обработчик для input, textarea и select
  const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };

      if (name === "type_ship") {
        if (value === "pickup_ship_dif") {
          updatedData.system = "Own";
          setUseCustomDays(true);
          setShowDaySystem(false);
          updatedData.monday = false;
          updatedData.tuesday = false;
          updatedData.wednesday = false;
          updatedData.thursday = false;
          updatedData.friday = false;
          setUseOnetimeOrder(false);
        } else if (value === "pickup_ship_one") {
          setShowDaySystem(true);
          setUseOnetimeOrder(false);
          setUseCustomDays(false);
          updatedData.system = "";
          updatedData.monday = false;
          updatedData.tuesday = false;
          updatedData.wednesday = false;
          updatedData.thursday = false;
          updatedData.friday = false;
        } else if (value === "one_time" || value === "quick_order") {
          setShowDaySystem(true);
          setUseOnetimeOrder(true);
          setUseCustomDays(true);
          setFirstStartForm(true);
          updatedData.system = "Own";
          // Устанавливаем date_pickup равной завтрашнему дню
          updatedData.date_pickup = formattedTomorrow;
          const pickupDate = new Date(formattedTomorrow);
          let deliveryDate: Date;
          if (value === "quick_order") {
            deliveryDate = addWorkingDays(pickupDate, 1);
          } else if (value === "one_time") {
            deliveryDate = addWorkingDays(pickupDate, 2);
          }
          updatedData.date_delivery = deliveryDate.toISOString().split("T")[0];
          console.log(updatedData.date_delivery);
          updatedData.monday = false;
          updatedData.tuesday = false;
          updatedData.wednesday = false;
          updatedData.thursday = false;
          updatedData.friday = false;
        } else {
          // Сброс для других значений
          setShowDaySystem(true);
          setUseOnetimeOrder(false);
          setUseCustomDays(false);
          updatedData.system = "";
          updatedData.monday = false;
          updatedData.tuesday = false;
          updatedData.wednesday = false;
          updatedData.thursday = false;
          updatedData.friday = false;
        }
      }
      return updatedData;
    });
  };

  const handleSystemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const availableDates = getAvailableStartDays();
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      date_start_day: availableDates[0] || prev.date_start_day,
    }));
    setUseCustomDays(value === "Own");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatDate = (date: string) => (date ? date.split("T")[0] : "");
    const formattedData = {
      ...formData,
      place: placeId || formData.place,
      date_pickup: formatDate(formData.date_pickup),
      date_delivery: formatDate(formData.date_delivery),
      date_start_day: formatDate(formData.date_start_day),
    };

    try {
      const response = await fetchWithAuth(`${BASE_URL}/order/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      const responseData = await response.json();

      if (response.ok) {
        onSuccess(responseData);
        setSuccessMessage(`Order created successfully: ${responseData}`);
      } else {
        alert("Failed to create order: " + JSON.stringify(responseData));
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Обновляем дату доставки при изменении даты самовывоза
  useEffect(() => {
    if (formData.type_ship !== "one_time" && formData.type_ship !== "quick_order") {
      setFormData((prev) => ({
        ...prev,
        date_delivery: getAvailableDeliveryDates()[0] || prev.date_delivery,
      }));
    }
  }, [formData.date_pickup]);

  // Авто-выбор места, если доступно только одно
  useEffect(() => {
    if (!placeId && places.length === 1) {
      setFormData((prev) => ({ ...prev, place: places[0].id }));
    }
  }, [places, placeId]);

  // Загрузка списка мест
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
  }, [BASE_URL]);

  // Check if exist an active current order
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await fetchWithAuth(`${BASE_URL}/order/check-current-order/`);
        if (response.ok) {
          const currentOrderData = await response.json();
          if (currentOrderData.length != 0) {
            setAlredyCurrentOrder(true)
          }
        } else {
          console.error("Failed to fetch current order");
        }
      } catch (error) {
        console.error("Error fetching current order:", error);
      }
    };

    fetchPlaces();
  }, [BASE_URL]);

  useEffect(() => {
    if (firstStartForm) {
      const availableStartDays = getAvailableStartDays(); // Call function without passing state
      if (availableStartDays.length > 0) {
        setFormData((prev) => ({
          ...prev,
          date_start_day: availableStartDays[0], // Set first available date
          date_pickup: availableStartDays[0], // Set first available date
        }));
      }
    }
  }, [firstStartForm, formData.system, formData.monday, formData.tuesday, formData.wednesday, formData.thursday, formData.friday]);

  return (
      <div className="modal-backdrop">
        <div className="modal-wrapper">
          <div className="modal-content">
            <h3>Create New Order</h3>
            <form onSubmit={handleSubmit}>
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
                    <option value="pickup_ship_one">
                      {currentData.order.type_sipping_clear_for_dirty}
                    </option>
                    <option value="pickup_ship_dif">
                      {currentData.order.type_sipping_1_in_3}
                    </option>
                    <option value="one_time">{currentData.order.one_time}</option>
                    <option value="quick_order">{currentData.order.quick}</option>
                  </select>
                </div>
              </div>

              {/* System or Days of the Week */}
              {!useOnetimeOrder && (
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
                        </select>
                      </div>
                    </div>
                  </div>
              )}

              {useCustomDays && !useOnetimeOrder && (
                  <div className="row mb-3">
                    <div className="col-12">
                      {["monday", "tuesday", "wednesday", "thursday", "friday"].map((day, index, days) => {
                        const hasPrevSelected = index > 0 && formData[days[index - 1] as keyof typeof formData];
                        const hasNextSelected = index < days.length - 1 && formData[days[index + 1] as keyof typeof formData];
                        return (
                            <div className="form-check" key={day}>
                              <input
                                  className="form-check-input"
                                  type="checkbox"
                                  name={day}
                                  checked={formData[day as keyof typeof formData] as boolean}
                                  onChange={handleCheckboxChange}
                                  disabled={
                                      formData.type_ship === "pickup_ship_dif" &&
                                      !formData[day as keyof typeof formData] &&
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
                          onChange={handleStartDayChange}
                          required
                      >
                        {getAvailableStartDays().map((date) => (
                            <option key={date} value={date}>
                              {new Date(date).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                              })}
                            </option>
                        ))}
                      </select>
                    </div>
                  </div>
              )}

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
                            onChange={handlePickupChange}
                            required
                        >
                          {getAvailablePickupDates().map((date) => (
                              <option key={date} value={date}>
                                {new Date(date).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  month: "short",
                                  day: "numeric",
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
                            onChange={handleDeliveryChange}
                            required
                        >
                          {getAvailableDeliveryDates().map((date) => (
                              <option key={date} value={date}>
                                {new Date(date).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
              )}

              {!useOnetimeOrder && (
                  <div className="row mb-3">
                    { alredyCurrentOrder ? (
                        <div className="col-12 mt-2">
                          <p>You already have repeating order. If you would like to create a new repeating order you have to stop the current order.</p>
                        </div>
                    ) : (
                        <>
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
                        </>
                    ) }
                  </div>
              )}

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
                    rows={2}
                    placeholder="Enter your notes here..."
                />
                </div>
              </div>

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
                  {showError && !formData.terms && (
                      <p className="text-danger mt-1">You must accept the Terms of Use</p>
                  )}
                </div>
              </div>

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