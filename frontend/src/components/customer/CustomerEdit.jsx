import React, { useState } from "react";
import { fetchWithAuth } from "../account/auth.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSquareXmark
} from "@fortawesome/free-solid-svg-icons";
import { Tooltip as ReactTooltip } from 'react-tooltip';

function CustomerEdit({ customerData, setCustomerData, setSuccessMessage, setIsEditing, langData }) {
    const [formData, setFormData] = useState({
        company_name: customerData?.company_name || "",
        company_address: customerData?.company_address || "",
        company_ico: customerData?.company_ico || "",
        company_dic: customerData?.company_dic || "",
        company_phone: customerData?.company_phone || "",
        // company_email: customerData?.company_email || "",
        company_person: customerData?.company_person || "",
    });
    console.log(langData);
    const labels = {
        company_name: langData.customer.company_name,
        company_address: langData.customer.company_address,
        company_ico: langData.customer.company_number,
        company_dic: langData.customer.vat_number,
        company_phone: langData.customer.phone,
        company_person: langData.customer.full_name,
        vop: langData.customer.vop,
        terms_of_use: langData.customer.terms_use,
        gdpr: langData.customer.gdpr,
      };

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
            <h1 className="detail-page mb-3">Edit Customer Information</h1>
            <form onSubmit={handleSubmit}>
                <div className="row">
                {Object.keys(formData).map((key) => (
                    <div key={key} className="row form-group">
                        <div className="col-12 col-md-4 label-form">
                            <label className="form-label">{labels[key] || key.replace('_', ' ')}</label>
                        </div>
                        <div className="col-12 col-md-8">
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
                    <button type="submit" className="btn-submit">
                        Save Changes
                    </button>
                </div>

            </form>

        </div>
    );
}

export default CustomerEdit;