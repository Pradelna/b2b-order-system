import React, { useState, useContext, ChangeEvent, FormEvent } from "react";
import { LanguageContext } from "@/context/LanguageContext";
import { fetchWithAuth } from "../account/auth.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareXmark } from "@fortawesome/free-solid-svg-icons";
import { Tooltip as ReactTooltip } from "react-tooltip";

interface CustomerData {
    company_name: string;
    company_address: string;
    company_ico: string;
    company_dic: string;
    company_phone: string;
    company_person: string;
}

interface Labels {
    [key: string]: string;
}

interface CustomerEditProps {
    customerData: CustomerData;
    setCustomerData: React.Dispatch<React.SetStateAction<CustomerData | null>>;
    setSuccessMessage: React.Dispatch<React.SetStateAction<string>>;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

const CustomerEdit: React.FC<CustomerEditProps> = ({
                                                       customerData,
                                                       setCustomerData,
                                                       setSuccessMessage,
                                                       setIsEditing,
                                                   }) => {
    const { currentData } = useContext(LanguageContext);
    const [formData, setFormData] = useState<CustomerData>({
        company_name: customerData?.company_name || "",
        company_address: customerData?.company_address || "",
        company_ico: customerData?.company_ico || "",
        company_dic: customerData?.company_dic || "",
        company_phone: customerData?.company_phone || "",
        company_person: customerData?.company_person || "",
    });

    const BASE_URL = import.meta.env.VITE_API_URL;

    const labels: Labels = {
        company_name: currentData.customer.company_name,
        company_address: currentData.customer.company_address,
        company_ico: currentData.customer.company_number,
        company_dic: currentData.customer.vat_number,
        company_phone: currentData.customer.phone,
        company_person: currentData.customer.full_name,
        vop: currentData.customer.vop,
        terms_of_use: currentData.customer.terms_use,
        gdpr: currentData.customer.gdpr,
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetchWithAuth(`${BASE_URL}/customer/data/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to update customer data");
            }

            const updatedData = await response.json();
            setCustomerData(updatedData);
            setSuccessMessage("Customer data updated successfully!");
            setTimeout(() => setSuccessMessage(""), 10000);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating customer data:", error);
        }
    };

    const handleCancel = () => {
        setIsEditing(false); // Exit editing mode without saving
    };

    if (!currentData) {
        return <div>loading...</div>; // Avoid rendering if context data is unavailable
    }

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
                effect="solid"
                className="custom-tooltip"
            />
            <h1 className="detail-page mb-3">Edit Customer Information</h1>
            <form onSubmit={handleSubmit}>
                <div className="row">
                    {Object.keys(formData).map((key) => (
                        <div key={key} className="row form-group">
                            <div className="col-12 col-md-4 label-form">
                                <label className="form-label">{labels[key] || key.replace("_", " ")}</label>
                            </div>
                            <div className="col-12 col-md-8">
                                <input
                                    type="text"
                                    name={key}
                                    value={(formData as any)[key]} // Ensures dynamic access to formData fields
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
                        {currentData.buttons.submit}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CustomerEdit;