import { useState, useEffect, useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import { fetchWithAuth } from "../account/auth";
import { formatViceDate} from "@/components/utils/FormatViceDate";

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
  const [useThirdOrder, setUseThirdOrder] = useState(false);
  const [useClearDirtyOrder, setUseClearDirtyOrder] = useState(false);
  const [useQuickOrder, setUseQuickOrder] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;
  const { currentData } = useContext(LanguageContext);
  const [alredyCurrentOrder, setAlredyCurrentOrder] = useState(false);
  const [firstStartForm, setFirstStartForm] = useState(true);
  const [everyWeek, setEveryWeek] = useState(false);

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

  const localeMapping: { [key: string]: string } = {
    cz: "cs-CZ", // для чешского языка
    ru: "ru-RU", // для русского языка
    en: "en-US", // для английского языка
  };

  // Functions for calculating available start dates
  function getAvailableStartDays() {
    const availableDates: string[] = [];
    const startDate = new Date();

    // if repeated order already exist start from next month
    if (alredyCurrentOrder) {
      // Переключаем на первый день следующего месяца
      startDate.setMonth(startDate.getMonth() + 1); // начинаем с нового месяца
      startDate.setDate(1);
    } else {
      startDate.setDate(startDate.getDate() + 1); // начинаем с завтрашнего дня
    }

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

      if (formData.type_ship === "one_time" && formData.type_ship === "quick" && (dayOfWeek >= 1 && dayOfWeek <= 5)) {
        console.log("it works")
        availableDates.push(date.toISOString().split("T")[0]);
      }
    }
    return availableDates;
  }

  // only working days for a week
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

  // Обработчики событий this maybe no needs
  const handleStartDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, date_start_day: e.target.value }));
  };

  // this maybe no needs
  const handlePickupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      date_pickup: e.target.value,
    }));
    setFirstStartForm(false);
  };

  // this maybe no needs
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

  // week day checkboxes. If user choose delivery 3th day he cant choose two days in a row
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: checked };
      // 🔥 НЕ сбрасываем дни недели, если изменяется НЕ day checkbox
      if (["monday", "tuesday", "wednesday", "thursday", "friday"].includes(name)) {
        if (prev.type_ship === "pickup_ship_dif") {
          const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
          const index = days.indexOf(name);
          if (checked) {
            if (index > 0) updatedFormData[days[index - 1]] = false;
            if (index < days.length - 1) updatedFormData[days[index + 1]] = false;
          }
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
          setUseThirdOrder(true);
          setUseClearDirtyOrder(false);
          setUseOnetimeOrder(false);
          setUseQuickOrder(false);
          setUseCustomDays(true);
          setShowDaySystem(false);
          updatedData.monday = false;
          updatedData.tuesday = false;
          updatedData.wednesday = false;
          updatedData.thursday = false;
          updatedData.friday = false;
          updatedData.every_week = true;
          setEveryWeek(true);
          setUseOnetimeOrder(false);
        } else if (value === "pickup_ship_one") {
          setUseClearDirtyOrder(true);
          setUseThirdOrder(false);
          setUseOnetimeOrder(false);
          setUseQuickOrder(false);
          setShowDaySystem(true);
          setUseOnetimeOrder(false);
          setUseCustomDays(false);
          updatedData.system = "";
          updatedData.monday = false;
          updatedData.tuesday = false;
          updatedData.wednesday = false;
          updatedData.thursday = false;
          updatedData.friday = false;
          updatedData.every_week = true;
          setEveryWeek(true);
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
            setUseClearDirtyOrder(false);
            setUseThirdOrder(false);
            setUseOnetimeOrder(false);
            setUseQuickOrder(true);
            deliveryDate = addWorkingDays(pickupDate, 1);
          } else if (value === "one_time") {
            setUseClearDirtyOrder(false);
            setUseThirdOrder(false);
            setUseOnetimeOrder(true);
            setUseQuickOrder(false);
            deliveryDate = addWorkingDays(pickupDate, 2);
          }
          updatedData.date_delivery = deliveryDate.toISOString().split("T")[0];
          updatedData.monday = false;
          updatedData.tuesday = false;
          updatedData.wednesday = false;
          updatedData.thursday = false;
          updatedData.friday = false;
          updatedData.every_week = false;
          setEveryWeek(false);
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
          updatedData.every_week = false;
          setEveryWeek(false);
          setUseClearDirtyOrder(false);
          setUseThirdOrder(false);
          setUseOnetimeOrder(false);
          setUseQuickOrder(false);
        }
      }
      return updatedData;
    });
  };

  // renew date_start_day field for new date
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

  // send form to database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // get curent value from DOM for pickup field
    const datePickupElement = document.querySelector<HTMLInputElement | HTMLSelectElement>("select[name='date_pickup'], input[name='date_pickup']");
    const displayedDatePickup = datePickupElement ? datePickupElement.value : formData.date_pickup;
    // get curent value from DOM for delivery field
    const dateDeliveryElement = document.querySelector<HTMLInputElement | HTMLSelectElement>("select[name='date_delivery'], input[name='date_delivery']");
    const displayedDateDelivery = dateDeliveryElement ? dateDeliveryElement.value : formData.date_delivery;
    // get curent value from DOM for start day
    const dateStartDayElement = document.querySelector<HTMLInputElement | HTMLSelectElement>("select[name='date_start_day'], input[name='date_start_day']");
    const displayedDateStartDay = dateStartDayElement ? dateStartDayElement.value : formData.date_start_day;

    const formatDate = (date: string) => (date ? date.split("T")[0] : "");
    const formattedData = {
      ...formData,
      place: placeId || formData.place,
      date_pickup: displayedDatePickup,  // Используем дату, отображаемую в браузере
      date_delivery: displayedDateDelivery,
      date_start_day: displayedDateStartDay,
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
          // if active order exists for this place
          if (currentOrderData.length != 0) {
            const exists = currentOrderData.some(order => order.place === placeId);
            if (exists) {
              setAlredyCurrentOrder(true); // this change avaibles start dates and show message in the order form
              console.log("Order with this placeId exists");
            } else {
              console.log("No matching order found");
            };
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

  console.log(currentData);

  return (
      <div className="modal-backdrop">
        <div className="modal-wrapper">
          <div className="modal-content">
            <h3>{ currentData.form["create_order"] || "Vytvořte novou objednávku" }</h3>
            <form onSubmit={handleSubmit}>
              {/* Place Dropdown */}
              <div className="row mb-3">
                <div className="col-12 label-form">
                  <label htmlFor="place">{ currentData.form["place"] || "Misto" }*</label>
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
                    <option value="">{ currentData.form["select_place"] || "Vybrat provozovnu" }</option>
                    {places
                        .filter((place) => place.data_sent)
                        .map((place) => (
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
                  <label htmlFor="type_ship">{ currentData.form["type_ship"] || "Typ závozu" }*</label>
                </div>
                <div className="col-12">
                  <select
                      className="form-control"
                      name="type_ship"
                      value={formData.type_ship}
                      onChange={handleInputChange}
                      required
                  >
                    <option value="">{ currentData.form["select_type"] || "Vyberte typ" }</option>
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

              {useClearDirtyOrder && (
                  <div className="row mb-3">
                    <div className="col-12">
                      <div className="alert alert-success">
                        {currentData.order["note_sh_cl_dr"] || "Prádelna v daný den přijede, " +
                            "vyzvedne špinavé a doručí čisté."}
                      </div>
                    </div>
                  </div>
              )}
              {useThirdOrder && (
                  <div className="row mb-3">
                    <div className="col-12">
                      <div className="alert alert-success">
                        {currentData.order["note_sh_1_3"] || "Vyzvednutí špinavého prádla " +
                            "v určený den a doručení prádla."}
                      </div>
                    </div>
                  </div>
              )}
              {useOnetimeOrder && (
                  <div className="row mb-3">
                    <div className="col-12">
                      <div className="alert alert-success">
                        {currentData.order["note_one_time"] || "Jedná se pouze o jednorázovou objednávku. V 1. " +
                            "den prádelna přijede, vyzvedne špinavé prádlo a 2. den přiveze čisté."}
                      </div>
                    </div>
                  </div>
              )}
              {useQuickOrder && (
                  <div className="row mb-3">
                    <div className="col-12">
                      <div className="alert alert-success">
                        {currentData.order["note_quick"] || "Expresní doručení do 2. dne (V pondělí vyzvedneme, " +
                            "v úterý přivezeme)."}
                      </div>
                    </div>
                  </div>
              )}

              {/* System or Days of the Week */}
              {!useOnetimeOrder && (
                  <div className="row mb-3">
                    <div className={`col-12 days ${showDaySystem ? "display-none" : ""}`}>
                      <p>Choose days</p>
                    </div>
                    <div className={`day-system-hide ${showDaySystem ? "opacity-1" : "opacity-0 height-1 z-index-1"}`}>
                      <div className="col-12 label-form">
                        <label htmlFor="system">{ currentData.form["system"] || "Systém" }*</label>
                      </div>
                      <div className="col-12">
                        <select
                            className="form-control"
                            name="system"
                            value={formData.system}
                            onChange={handleSystemChange}
                            required={!useCustomDays}
                        >
                          <option value="">{ currentData.form["select_system"] || "Zvolte systém" }</option>
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
                      <label htmlFor="date_start_day">{ currentData.form["start_day"] || "Začátek závozu" }*</label>
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
                              {new Date(date).toLocaleDateString(
                                  localeMapping[currentData.lang] || "en-US",
                                  {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                  }
                              )}
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
                                {new Date(date).toLocaleDateString(
                                    localeMapping[currentData.lang] || "en-US",
                                    {
                                      weekday: "long",
                                      month: "short",
                                      day: "numeric",
                                    }
                                )}
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
                                {new Date(date).toLocaleDateString(
                                    localeMapping[currentData.lang] || "en-US",
                                    {
                                      weekday: "long",
                                      month: "short",
                                      day: "numeric",
                                    }
                                )}
                              </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
              )}

              {alredyCurrentOrder && (
                  <div className="row">
                    <div className="col-12">
                      <div className="alert alert-warning">
                        You already have orders for this month.<br />
                        You can create a new for a next month.
                      </div>
                    </div>
                  </div>
              )}

              {!useOnetimeOrder && everyWeek && (
                  <div className="row mb-3">
                    <div className="col-12">
                      <div className="alert alert-warning">
                        { currentData.order["note_every_week"] || "Tato objednávka se bude opakovat každý týden do konce měsíce" }
                      </div>
                    </div>
                  </div>
              )}

              <div className="row mb-3">
                <div className="col-12 label-form">
                  <label>{ currentData.form["note"] || "Poznámka pro řidiče" }</label>
                </div>
                <div className="col-12">
                <textarea
                    className="form-control"
                    name="rp_customer_note"
                    value={formData.rp_customer_note}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder={ currentData.form["type_note"] || "Napište text..." }
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
                  { currentData.customer["terms_use"] || "Podmínky užití" }
                  {showError && !formData.terms && (
                      <p className="text-danger mt-1">You must accept the Terms of Use</p>
                  )}
                </div>
              </div>

              <div className="row mt-3">
                <button className="btn-submit me-2" type="submit">
                  { currentData.buttons["submit"] || "Uložit" }
                </button>
                <button className="btn-link" type="button" onClick={onClose}>
                  { currentData.buttons["cancel"] || "Zrušit" }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default OrderForm;