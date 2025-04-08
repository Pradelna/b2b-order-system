import React, {useState, ChangeEvent, FormEvent, useContext} from "react";
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
    const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormErrors({}); // очистим прошлые ошибки

        const errors: { [key: string]: string[] } = {};

        const lang = currentData?.lang || "cz";

        const emailError = {
            cz: "Neplatný formát e-mailu",
            ru: "Неверный формат e-mail",
            en: "Invalid e-mail format",
        };
        const labelEmailError = emailError[lang] || emailError.cz;

        // Простая проверка email
        if (formData.rp_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.rp_email)) {
            errors.rp_email = [labelEmailError];
        }

        if (formData.rp_phone && !/^\+?(\d){6,18}$/.test(formData.rp_phone)) {
            const phoneError = {
                cz: "Číslo telefonu musí být zadáno ve formátu: +420234567890 nebo 01234567890",
                ru: "Номер телефона должен быть введен в формате: +420234567890 или 01234567890",
                en: "The phone number must be entered in the format: +420234567890 or 01234567890",
            };
            const labelPhoneError = phoneError[lang] || phoneError.cz;
            errors.rp_phone = [labelPhoneError];
        }

        if (formData.rp_zip && !/^\d{5,9}$/.test(formData.rp_zip)) {
            const zipError = {
                cz: "Číslo nesmí obsahovat mezery a jiné znaky kromě číslic",
                ru: "Номер не должен содержать пробелы и другие символы кроме цифр",
                en: "The number must not contain spaces or other characters except digits.",
            };
            const labelZipError = zipError[lang] || zipError.cz;
            errors.rp_zip = [labelZipError];
        }

        // Если есть ошибки - не отправляем запрос
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        // Если валидация прошла
        try {
            const response = await fetchWithAuth(`${BASE_URL}/place/create/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                onSuccess(data);
                onClose();
            } else if (response.status === 400) {
                const data = await response.json();
                setFormErrors(data);
            } else {
                const data = await response.json();
                throw new Error(
                    data.detail || currentData?.messages?.filed_form || "Nepodařilo se odeslat formulář"
                );
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
                                        required
                                    />
                                </div>
                            </div>
                        ))}
                        {Object.values(formErrors).flat().map((message, index) => (
                            <p key={index} className="alert alert-danger">
                                {message}
                            </p>
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