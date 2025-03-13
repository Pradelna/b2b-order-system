import React, {useContext, useState} from 'react';
import { LanguageContext } from "../../context/LanguageContext";
import {fetchWithAuth} from "../account/auth";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEnvelope} from "@fortawesome/free-solid-svg-icons";

interface PasswordResetFormProps {
    customerEmail: string | null;
    onClose?: () => void;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ customerEmail, onClose }) => {
    const [email, setEmail] = useState(customerEmail || '');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { currentData } = useContext(LanguageContext);
    const BASE_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        try {
            // console.log(formData.email);
            const response = await fetchWithAuth(`${BASE_URL}/accounts/password-reset/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.detail);
                if (onClose) onClose();
            } else {
                setError(data.error || JSON.stringify(data));
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        }
    };

    return (

                    <form onSubmit={handleSubmit}>
                        <h3 style={{ fontSize: "20px" }}>
                            {currentData?.auth.pass_reset || "Reset password"}
                        </h3>
                        {/* Static link for important document */}
                        <div className="row mb-2">
                            <div className="col-lg-6 col-12 mb-2">
                                <label htmlFor="email">Email:</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="form-control"
                                        disabled={!!customerEmail}
                                    />
                            </div>

                            <div className="col-lg-6 col-12 mb-2">
                                <button type="submit" className="btn-upload">
                                    {currentData?.auth.pass_reset || "Reset password"}
                                </button>
                            </div>
                        </div>
                        {message && <p className="alert alert-success">{message}</p>}
                        {error && <p className="alert alert-danger">{error}</p>}
                    </form>

    );
};

export default PasswordResetForm;