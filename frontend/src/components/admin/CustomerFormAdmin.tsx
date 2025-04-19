import React, { useState, useContext, ChangeEvent, FormEvent } from "react";
import { fetchWithAuth } from "../account/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareXmark } from "@fortawesome/free-solid-svg-icons";
import DarkTooltip from "@/components/utils/DarkTooltip";

interface CustomerData {
    new_company_name: string;
    new_company_address: string;
    new_company_ico: string;
    new_company_dic: string;
    company_name: string;
    company_address: string;
    company_ico: string;
    company_dic: string;
    company_phone: string;
    company_person: string;
    change_data: boolean;
    active: boolean;
    weekend_able: boolean;
    user_id: string;
}

interface Labels {
    [key: string]: string;
}

interface CustomerFormAdminProps {
    customerData: CustomerData;
    setCustomerData: React.Dispatch<React.SetStateAction<CustomerData | null>>;
    setSuccessMessage: React.Dispatch<React.SetStateAction<string>>;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

const CustomerFormAdmin: React.FC<CustomerFormAdminProps> = ({
                                                       customerData,
                                                       setCustomerData,
                                                       setSuccessMessage,
                                                       setIsEditing,
                                                   }) => {
    const [formData, setFormData] = useState<CustomerData>({
        new_company_name: customerData.new_company_name || "",
        new_company_address: customerData.new_company_address || "",
        new_company_ico: customerData.new_company_ico || "",
        new_company_dic: customerData.new_company_dic || "",
        company_name: customerData.company_name || "",
        company_address: customerData.company_address || "",
        company_ico: customerData.company_ico || "",
        company_dic: customerData.company_dic || "",
        company_phone: customerData.company_phone || "",
        company_person: customerData.company_person || "",
        change_data: customerData.change_data,
        active: customerData.active,
        weekend_able: customerData.weekend_able,
        user_id: customerData.user_id,
    });
    const BASE_URL = import.meta.env.VITE_API_URL;
    const customerId = customerData?.user_id;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetchWithAuth(`${BASE_URL}/admin/adminpanel/customer/put/${customerId}/`, {
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

    if (!customerData) return <div>Loading...</div>;

    return (
        <div className="card company-card card-form">
            <DarkTooltip title="Close" placement="top" arrow>
                <FontAwesomeIcon
                    icon={faSquareXmark}
                    className="settings"
                    style={{ cursor: "pointer" }}
                    onClick={handleCancel}
                    data-tooltip-id="cross-tooltip"
                />
            </DarkTooltip>
            <h1 className="detail-page mb-3">Edit Customer Information</h1>
            <form onSubmit={handleSubmit}>
                <div className="row form-customer-edit">

                    <div className="card">
                        <h5>Company name {formData.new_company_name !== formData.company_name && <span style={{color: "red"}}>CHANGES</span>}</h5>
                        <div className="row form-group">
                            <div className="col-lg-2 col-lg-2 col-12 label-form">
                                <label htmlFor="company_name" className="form-label">
                                    Actual
                                </label>
                            </div>
                            <div className="col-lg-10 col-12">
                                <input
                                    type="text"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                        </div>

                        <div className="row form-group">
                            <div className="col-lg-2 col-lg-2 col-12 label-form">
                                <label htmlFor="new_company_name" className="form-label">
                                    New
                                </label>
                            </div>
                            <div className="col-lg-10 col-12">
                                <input
                                    type="text"
                                    name="new_company_name"
                                    value={formData.new_company_name}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={formData.new_company_name !== formData.company_name ? { color: "red" } : {}}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card mt-3">
                        <h5>Company address {formData.new_company_address !== formData.company_address && <span style={{color: "red"}}>CHANGES</span>}</h5>
                        <div className="row form-group">
                            <div className="col-lg-2 col-lg-2 col-12 label-form">
                                <label htmlFor="company_address" className="form-label">
                                    Actual
                                </label>
                            </div>
                            <div className="col-lg-10 col-12">
                                <input
                                    type="text"
                                    name="company_address"
                                    value={formData.company_address}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <div className="row form-group">
                            <div className="col-lg-2 col-lg-2 col-12 label-form">
                                <label htmlFor="new_company_address" className="form-label">
                                    New
                                </label>
                            </div>
                            <div className="col-lg-10 col-12">
                                <input
                                    type="text"
                                    name="new_company_address"
                                    value={formData.new_company_address}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={formData.new_company_address !== formData.company_address ? { color: "red" } : {}}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card mt-3">
                        <h5>Company number IČO {formData.new_company_ico !== formData.company_ico && <span style={{color: "red"}}>CHANGES</span>}</h5>
                        <div className="row form-group">
                            <div className="col-lg-2 col-12 label-form">
                                <label htmlFor="company_ico" className="form-label">
                                    Actual
                                </label>
                            </div>
                            <div className="col-lg-10 col-12">
                                <input
                                    type="text"
                                    name="company_ico"
                                    value={formData.company_ico}
                                    onChange={handleChange}
                                    className="form-control"

                                />
                            </div>
                        </div>
                        <div className="row form-group">
                            <div className="col-lg-2 col-12 label-form">
                                <label htmlFor="new_company_ico" className="form-label">
                                    New
                                </label>
                            </div>
                            <div className="col-lg-10 col-12">
                                <input
                                    type="text"
                                    name="new_company_ico"
                                    value={formData.new_company_ico}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={formData.new_company_ico !== formData.company_ico ? { color: "red" } : {}}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card mt-3">
                        <h5>Vat number DIČ {formData.new_company_dic !== formData.company_dic && <span style={{color: "red"}}>CHANGES</span>}</h5>
                        <div className="row form-group">
                            <div className="col-lg-2 col-12 label-form">
                                <label htmlFor="company_dic" className="form-label">
                                    Actual
                                </label>
                            </div>
                            <div className="col-lg-10 col-12">
                                <input
                                    type="text"
                                    name="company_dic"
                                    value={formData.company_dic}
                                    onChange={handleChange}
                                    className="form-control"

                                />
                            </div>
                        </div>
                        <div className="row form-group">
                            <div className="col-lg-2 col-12 label-form">
                                <label htmlFor="new_company_dic" className="form-label">
                                    New
                                </label>
                            </div>
                            <div className="col-lg-10 col-12">
                                <input
                                    type="text"
                                    name="new_company_dic"
                                    value={formData.new_company_dic}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={formData.new_company_dic !== formData.company_dic ? { color: "red" } : {}}
                                />
                            </div>
                        </div>
                    </div>


                    <div className="row form-group mt-3">
                        <div className="col-lg-2 col-12 label-form">
                            <label htmlFor="company_phone" className="form-label">
                                Telephone
                            </label>
                        </div>
                        <div className="col-lg-10 col-12">
                            <input
                                type="text"
                                name="company_phone"
                                value={formData.company_phone}
                                onChange={handleChange}
                                className="form-control"

                            />
                        </div>
                    </div>

                    <div className="row form-group">
                        <div className="col-lg-2 col-12 label-form">
                            <label htmlFor="company_person" className="form-label">
                                Full name
                            </label>
                        </div>
                        <div className="col-lg-10 col-12">
                            <input
                                type="text"
                                name="company_person"
                                value={formData.company_person}
                                onChange={handleChange}
                                className="form-control"

                            />
                        </div>
                    </div>
                </div>

                <div className="row label-row">

                    <div className="form-customer-edit checkbox-wrapper-19">
                        <input
                            id="change_data"
                            type="checkbox"
                            name="change_data"
                            checked={formData.change_data}
                            onChange={handleChange}
                            className="form-check-input"

                            style={{ opacity: 0 }}
                        />
                        <label htmlFor="change_data" className="check-box" />
                    </div>
                    <label className="checkbox-label-edit-form form-label" style={{paddingLeft: "50px"}}>
                        Data change (if you made changes - remove it, never check this checkbox)
                    </label>

                </div>

                <div className="row label-row">

                    <div className="form-customer-edit checkbox-wrapper-19">
                        <input
                            id="active"
                            type="checkbox"
                            name="active"
                            checked={formData.active}
                            onChange={handleChange}
                            className="form-check-input"

                            style={{ opacity: 0 }}
                        />
                        <label htmlFor="active" className="check-box" />
                    </div>
                    <label className="checkbox-label-edit-form form-label" style={{paddingLeft: "50px"}}>
                        Active
                    </label>

                </div>

                <div className="row label-row">

                    <div className="form-customer-edit checkbox-wrapper-19">
                        <input
                            id="weekend_able"
                            type="checkbox"
                            name="weekend_able"
                            checked={formData.weekend_able}
                            onChange={handleChange}
                            className="form-check-input"

                            style={{ opacity: 0 }}
                        />
                        <label htmlFor="weekend_able" className="check-box" />
                    </div>
                    <label className="checkbox-label-edit-form form-label" style={{paddingLeft: "50px"}}>
                        Weekend able
                    </label>

                </div>

                <div className="row mt-3">
                    <button type="submit" className="btn-submit">
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CustomerFormAdmin;