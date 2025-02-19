import { useState, ChangeEvent, FormEvent } from "react";
import { fetchWithAuth } from "../account/auth.ts";

interface PlaceFormProps {
    onClose: () => void;
    onSuccess: (data: Place) => void;
}

interface Place {
    place_name: string;
    rp_city: string;
    rp_street: string;
    rp_number: string;
    rp_zip: string;
    rp_person?: string;
    rp_phone?: string;
    rp_email?: string;
}

const PlaceForm: React.FC<PlaceFormProps> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState<Place>({
        place_name: "",
        rp_city: "",
        rp_street: "",
        rp_number: "",
        rp_zip: "",
        rp_person: "",
        rp_phone: "",
        rp_email: "",
    });

    const BASE_URL = import.meta.env.VITE_API_URL;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault(); // Prevent form submission from refreshing the page
        try {
            const response = await fetchWithAuth(`${BASE_URL}/place/create/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                const data = await response.json();
                onSuccess(data); // Pass the newly created place data to the parent component
                onClose(); // Close the modal
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
            <div className="modal-wrapper">
                <div className="modal-content">
                    <h3>Add New Place</h3>
                    <form onSubmit={handleSubmit}>
                        {Object.entries(formData).map(([key, value]) => (
                            <div className="row mb-3" key={key}>
                                <div className="col-3 label-form">
                                    <label htmlFor={key}>
                                        {key.replace("rp_", "").replace("_", " ").toUpperCase()}
                                    </label>
                                </div>
                                <div className="col-9">
                                    <input
                                        className="form-control"
                                        type="text"
                                        name={key}
                                        value={value}
                                        onChange={handleChange}
                                        required={
                                            key !== "rp_person" && key !== "rp_phone" && key !== "rp_email"
                                        }
                                    />
                                </div>
                            </div>
                        ))}

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

export default PlaceForm;