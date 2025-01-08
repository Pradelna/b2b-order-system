import React, { useState } from "react";
import { fetchWithAuth } from "../auth.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSquareXmark
} from "@fortawesome/free-solid-svg-icons";
import { Tooltip as ReactTooltip } from 'react-tooltip';

function CustomerEdit({ customerData, setCustomerData, setSuccessMessage, onLogout, setIsEditing }) {
    const [formData, setFormData] = useState({
        company_name: customerData?.company_name || "",
        company_address: customerData?.company_address || "",
        company_ico: customerData?.company_ico || "",
        company_phone: customerData?.company_phone || "",
        // company_email: customerData?.company_email || "",
        company_person: customerData?.company_person || "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const token = localStorage.getItem("accessToken");

        fetchWithAuth("http://localhost:8000/api/customer/data/", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to update customer data");
                }
                return response.json();
            })
            .then((data) => {
                setCustomerData(data);
                setSuccessMessage("Customer data updated successfully!");
                setTimeout(() => setSuccessMessage(""), 5000);
                setIsEditing(false); // ✅ Выход из режима редактирования после сохранения
            })
            .catch((error) => {
                console.error("Error updating customer data:", error);
            });
    };

    const handleCancel = () => {
        setIsEditing(false); // ✅ Закрытие режима редактирования без сохранения
    };

    return (
        <div className="card company-card card-form">
            <FontAwesomeIcon
                icon={faSquareXmark}
                className="settings"
                style={{ cursor: "pointer" }}
                onClick={handleCancel}
                data-tooltip-id="cross-tooltip"
            />
            <ReactTooltip 
                id="cross-tooltip" 
                place="top" 
                content="Close editing"
                className="custom-tooltip"
            />
            <h2>Edit Customer Information</h2>
            <form onSubmit={handleSubmit}>
                <div className="row">
                {Object.keys(formData).map((key) => (
                    <div key={key} className="row form-group mb-3">
                        <div className="col-3 label-form">
                            <label className="form-label">{key.replace('_', ' ')}</label>
                        </div>
                        <div className="col-9">
                            <input
                                type="text"
                                name={key}
                                value={formData[key]}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                    </div>
                ))}
                </div>
                <div className="row">
                    <button type="submit" className="btn-submit me-2">
                        Save Changes
                    </button>
                </div>

            </form>

        </div>
    );
}

export default CustomerEdit;