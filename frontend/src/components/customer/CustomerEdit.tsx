import React, { useState, useContext, ChangeEvent, FormEvent } from "react";
import { LanguageContext } from "@/context/LanguageContext";
import { fetchWithAuth } from "../account/auth.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareXmark } from "@fortawesome/free-solid-svg-icons";
import DarkTooltip from "@/components/utils/DarkTooltip";

interface CustomerData {
    new_company_name: string;
    new_company_address: string;
    new_company_ico: string;
    new_company_dic: string;
    company_phone: string;
    company_person: string;
    change_data: boolean;
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
        new_company_name: customerData?.new_company_name || "",
        new_company_address: customerData?.new_company_address || "",
        new_company_ico: customerData?.new_company_ico || "",
        new_company_dic: customerData?.new_company_dic || "",
        company_phone: customerData?.company_phone || "",
        company_person: customerData?.company_person || "",
        change_data: customerData?.change_data ?? false,
    });
    const BASE_URL = import.meta.env.VITE_API_URL;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const lang = currentData?.lang || "cz";
    const editInfo = {
        cz: "Upravit údaje zákazníka",
        ru: "Редактировать информацию о клинте",
        en: "Edit Customer Information",
    };
    const labelEditInfo = editInfo[lang] || editInfo.cz;

    const editMes = {
        cz: "Údaje o zákazníkovi byly úspěšně aktualizovány!",
        ru: "Данные клиента успешно обновлены!",
        en: "Customer data updated successfully!",
    };
    const labelEditMes = editMes[lang] || editMes.cz;

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
            setSuccessMessage(labelEditMes || "Customer data updated successfully!");
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
        return null; // Avoid rendering if context data is unavailable
    }

    return (
        <div className="card company-card card-form">
            <DarkTooltip title={currentData?.form.close || "Zavřít"} placement="top" arrow>
                <FontAwesomeIcon
                    icon={faSquareXmark}
                    className="settings"
                    style={{ cursor: "pointer" }}
                    onClick={handleCancel}
                    data-tooltip-id="cross-tooltip"
                />
            </DarkTooltip>
            <h1 className="detail-page mb-3">{labelEditInfo || "Upravit údaje zákazníka"}</h1>
            <form onSubmit={handleSubmit}>
                <div className="row form-customer-edit">

                    <div className="row form-group">
                        <div className="col-12 col-md-4 label-form">
                            <label htmlFor="new_company_name" className="form-label">
                                {currentData.customer.company_name}
                            </label>
                        </div>
                        <div className="col-12 col-md-8">
                            <input
                                type="text"
                                name="new_company_name"
                                value={formData.new_company_name}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                            {(customerData.new_company_name !== customerData.company_name) && (
                            <p className="alert alert-danger mt-2">
                                {currentData.customer.new_data_wait}<br />
                                {currentData.customer.company_name} {currentData.customer.new_data_faktur}: {customerData.company_name}
                            </p>
                            )}
                        </div>
                    </div>



                    <div className="row form-group">
                        <div className="col-12 col-md-4 label-form">
                            <label htmlFor="new_company_address" className="form-label">
                                {currentData.customer.company_address}
                            </label>
                        </div>
                        <div className="col-12 col-md-8">
                            <input
                                type="text"
                                name="new_company_address"
                                value={formData.new_company_address}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                            {(customerData.new_company_address !== customerData.company_address) && (
                                <p className="alert alert-danger mt-2">
                                    {currentData.customer.new_data_wait}<br />
                                    {currentData.customer.company_address} {currentData.customer.new_data_faktur}: {customerData.company_address}
                                </p>
                            )}
                        </div>
                    </div>


                    <div className="row form-group">
                        <div className="col-12 col-md-4 label-form">
                            <label htmlFor="new_company_ico" className="form-label">
                                {currentData.customer.company_number}
                            </label>
                        </div>
                        <div className="col-12 col-md-8">
                            <input
                                type="text"
                                name="new_company_ico"
                                value={formData.new_company_ico}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                            {(customerData.new_company_ico !== customerData.company_ico) && (
                                <p className="alert alert-danger mt-2">
                                    {currentData.customer.new_data_wait}<br />
                                    {currentData.customer.company_number} {currentData.customer.new_data_faktur}: {customerData.company_ico}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="row form-group">
                        <div className="col-12 col-md-4 label-form">
                            <label htmlFor="new_company_dic" className="form-label">
                                {currentData?.customer?.vat_number || "DIČ"}{" "}
                                {currentData?.form?.optional || "volitelné"}
                            </label>
                        </div>
                        <div className="col-12 col-md-8">
                            <input
                                type="text"
                                name="new_company_dic"
                                value={formData.new_company_dic}
                                onChange={handleChange}
                                className="form-control"
                            />
                            {(customerData.new_company_dic !== customerData.company_dic) && (
                                <p className="alert alert-danger mt-2">
                                    {currentData.customer.new_data_wait}<br />
                                    {currentData.customer.vat_number} {currentData.customer.new_data_faktur}: {customerData.company_dic}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="row form-group">
                        <div className="col-12 col-md-4 label-form">
                            <label htmlFor="company_phone" className="form-label">
                                {currentData.customer.phone}
                            </label>
                        </div>
                        <div className="col-12 col-md-8">
                            <input
                                type="text"
                                name="company_phone"
                                value={formData.company_phone}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                    </div>

                    <div className="row form-group">
                        <div className="col-12 col-md-4 label-form">
                            <label htmlFor="company_person" className="form-label">
                                {currentData.customer.full_name}
                            </label>
                        </div>
                        <div className="col-12 col-md-8">
                            <input
                                type="text"
                                name="company_person"
                                value={formData.company_person}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="row">

                    <div className="form-customer-edit checkbox-wrapper-19">
                        <input
                            id="change_data"
                            type="checkbox"
                            name="change_data"
                            checked={formData.change_data}
                            onChange={handleChange}
                            className="form-check-input"
                            required
                            style={{ opacity: 0 }}
                        />
                        <label htmlFor="change_data" className="check-box" />
                    </div>
                    <label className="checkbox-label-edit-form form-label" style={{paddingLeft: "50px"}}>
                        {currentData.customer.new_data_change}
                    </label>

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