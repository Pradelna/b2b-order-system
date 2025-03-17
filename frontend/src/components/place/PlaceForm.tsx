import {useState, ChangeEvent, FormEvent, useContext} from "react";
import { fetchWithAuth } from "../account/auth.ts";
import { LanguageContext } from "../../context/LanguageContext";

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
    const { currentData } = useContext(LanguageContext);

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
                    <h3>{ currentData.form["add_place"] || "Add New Place" }</h3>
                    <form onSubmit={handleSubmit}>
                        {Object.entries(formData).map(([key, value]) => (
                            <div className="row mb-3" key={key}>
                                <div className="col-sm-4 col-12 label-form">
                                    <label htmlFor={key}>
                                        {(currentData.form[key])}
                                    </label>
                                </div>
                                <div className="col-sm-8 col-12">
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
                            <button className="btn-link" type="button" onClick={onClose}>
                                { currentData.buttons["cancel"] || "Zrušit" }
                            </button>
                            <button className="btn-submit" type="submit">
                                { currentData.buttons["submit"] || "Uložit" }
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PlaceForm;