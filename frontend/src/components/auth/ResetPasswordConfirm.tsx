import React, {useState, useEffect, useContext} from 'react';
import {Link, useParams} from 'react-router-dom';
import {LanguageContext} from "../../context/LanguageContext";

const ResetPasswordConfirm: React.FC = () => {
    const { uidb64, token } = useParams<{ uidb64: string; token: string }>();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const BASE_URL = import.meta.env.VITE_API_URL;
    const [goToLogin, setGoToLogin] = useState(false);
    const {currentData} = useContext(LanguageContext);
    const [matchMessage, setMatchMessage] = useState<string | null>(null); // сообщение о совпадении паролей
    const [passwordComplexityError, setPasswordComplexityError] = useState<string | null>(null);

    // Валидатор сложности пароля
    const validatePassword = (password: string): string | null => {
        if (!password) return null; // если поле пустое, не возвращаем ошибку
        if (password.length < 8) {
            return "Password must be at least 8 characters.";
        }
        if (!/[A-Z]/.test(password)) {
            return "Password must contain at least one uppercase letter.";
        }
        if (!/\d/.test(password)) {
            return "Password must contain at least one number.";
        }
        return null;
    };

    // Проверка сложности нового пароля при его изменении
    useEffect(() => {
        const complexityError = validatePassword(newPassword);
        setPasswordComplexityError(complexityError);
    }, [newPassword]);

    // Проверка совпадения паролей с задержкой 2 секунды (debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (confirmPassword) {
                if (newPassword !== confirmPassword) {
                    setError("Passwords do not match.");
                    setMatchMessage(null);
                } else {
                    setMatchMessage("Passwords match.");
                    setError(null);
                }
            } else {
                setMatchMessage(null);
                setError(null);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [newPassword, confirmPassword]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Дополнительная проверка перед отправкой формы
        // Если поле подтверждения пустое, не отправляем форму
        if (!confirmPassword) {
            setError("Please confirm your password.");
            return;
        }

        // Финальная проверка совпадения паролей
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        // Проверка сложности пароля
        const complexityError = validatePassword(newPassword);
        if (complexityError) {
            setError(complexityError);
            return;
        }
        setMessage(null);
        setError(null);
        try {
            const response = await fetch(`${BASE_URL}/accounts/reset/${uidb64}/${token}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ new_password: newPassword }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage("Password has been reset successfully.");
                setGoToLogin(true);
            } else {
                setError(data.error || JSON.stringify(data));
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        }
    };

    return (
        <div>
            <div className="container margin-top-130 wrapper">
                <div className="form-login">

                    <div style={{minWidth:"100px"}}>
                        {message && <p className="alert alert-success">{message}</p>}
                    </div>

                    {!goToLogin ? (
                    <div className="card card-login">
                        <div className="card-body">
                            <div className="text-center">
                                <a href="/">
                                    <img
                                        src="/wp-content/themes/praska/assets/img/logo.png"
                                        alt="Logo"
                                        style={{ maxWidth: "100%", height: "auto" }}
                                    />
                                </a>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group" style={{ marginBottom: "1rem" }}>
                                    <label>{currentData?.auth.new_pass || "New pass"}:</label>
                                    <br />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="form-control"
                                        required
                                    />
                                    {passwordComplexityError && (
                                        <p className="alert alert-danger mt-2" style={{padding: "5px 10px"}}>{passwordComplexityError}</p>
                                    )}
                                </div>
                                <div className="form-group" style={{ marginBottom: "1rem" }}>
                                    <label>{currentData?.auth.confirm_new_pass || "Confirm New Password"}:</label>
                                    <br />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="form-control"
                                        required
                                    />
                                    <div style={{ marginTop: "8px", minHeight: "36px" }}>
                                        {error && <p className="alert alert-danger" style={{padding: "5px 10px"}}>{error}</p>}
                                        {matchMessage && <p className="alert alert-success" style={{padding: "5px 10px"}}>{matchMessage}</p>}

                                    </div>
                                </div>
                                <div className="">
                                    <button className="btn-submit" type="submit">{currentData?.buttons.submit}</button>
                                </div>
                                <div className="mt-3 mb-3">
                                    <button className="btn-upload" type="button" onClick={() => setShowPassword(!showPassword)}
                                            style={{ minWidth: "140px", width: "auto" }}
                                    >
                                        {showPassword ? (currentData?.buttons.show_pass || "Hide Password") : (currentData?.buttons.show_pass || "Show Password")}
                                    </button>

                                </div>
                            </form>
                        </div>
                    </div>
                    ) : (
                        <div className="card card-login">
                            <div className="card-body">
                                <div className="text-center" style={{ marginBottom: "20px" }}>
                                    <a href="/">
                                        <img
                                            src="/wp-content/themes/praska/assets/img/logo.png"
                                            alt="Logo"
                                            style={{ maxWidth: "100%", height: "auto" }}
                                        />
                                    </a>
                                </div>

                                <div className="">
                                    <Link to="/account/login/">
                                        <button className="btn-submit" type="submit" >{currentData.auth.login}</button>
                                    </Link>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default ResetPasswordConfirm;