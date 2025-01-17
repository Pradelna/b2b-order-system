import React, { useState } from "react";
import { fetchWithAuth } from "../account/auth";

const PlaceForm = ({ onClose, onSuccess }) => { 
    const [formData, setFormData] = useState({
        place_name: "",
        rp_city: "",
        rp_street: "",
        rp_number: "",
        rp_zip: "",
        rp_person: "",
        rp_phone: "",
        rp_email: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();  // ✅ Исправлена ошибка с отменой отправки формы
        try {
            const response = await fetchWithAuth("http://127.0.0.1:8000/api/place/create/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                const data = await response.json();
                onSuccess(data); // ✅ Вызов onSuccess для отображения сообщения на странице
                console.log(data);
                onClose(); // ✅ Закрываем модальное окно
            } else {
                const errorData = await response.json();
                alert("Failed to create place: " + JSON.stringify(errorData));
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3>Add New Place</h3>
                <form onSubmit={handleSubmit}> {/* ✅ Исправлено событие onSubmit */}
                    {Object.entries(formData).map(([key, value]) => (
                        <div className="row mb-3" key={key}>
                            <div className="col-3 label-form">
                                <label htmlFor={key}>{key.replace("rp_", "").replace("_", " ").toUpperCase()}</label>
                            </div>
                            <div className="col-9">
                                <input
                                    className="form-control"
                                    type="text"
                                    name={key}
                                    value={value}
                                    onChange={handleChange}
                                    required={key !== "rp_person" && key !== "rp_phone" && key !== "rp_email"}
                                />
                            </div>
                        </div>
                    ))}

                    {/* Submit and Close Buttons */}
                    <div className="row mt-3">
                        <button className="btn-submit me-2" type="submit">Submit</button>
                        <button className="btn-link" type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlaceForm;