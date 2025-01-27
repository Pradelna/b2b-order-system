import { useState, useContext, FormEvent } from "react";
import { LanguageContext } from "../../context/LanguageContext.js";
import { useNavigate } from "react-router-dom";
import Header from "../Header.js";
import Footer from "../Footer.tsx";
import { fetchWithAuth } from "../account/auth";

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const { currentData } = useContext(LanguageContext);

    // Return null if the language data is not available
    if (!currentData || !currentData.auth) {
        return null;
    }

    const messageData = currentData.auth;
    const navigate = useNavigate();

    // Handle login form submission
    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");

        try {
            // Send a POST request using fetchWithAuth
            const response = await fetchWithAuth("http://127.0.0.1:8000/api/token/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(
                    `${messageData.author_error} ${errorData.detail || messageData.unknown_error}`
                );
                return;
            }

            // Assuming response contains { access, refresh } tokens
            const data: { access: string; refresh: string } = await response.json();
            const { access, refresh } = data;

            // Save tokens to localStorage
            localStorage.setItem("accessToken", access);
            localStorage.setItem("refreshToken", refresh);

            // Redirect to /account/
            navigate("/account");
        } catch (error: any) {
            setErrorMessage(`${messageData.network_error} ${error.message}`);
        }
    };

    return (
        <>
            <Header />

            <div className="container margin-top-130 wrapper">
                <div style={{ width: "400px", margin: "5rem auto" }}>
                    {errorMessage && (
                        <p className="alert alert-danger">{errorMessage}</p>
                    )}

                    <div className="card card-login">
                        <div className="card-body">
                            <div className="text-center">
                                <img
                                    src="/wp-content/themes/praska/assets/img/logo.png"
                                    alt="logo"
                                />
                            </div>

                            <form onSubmit={handleLogin}>
                                <div className="form-group" style={{ marginBottom: "1rem" }}>
                                    <label>{messageData.email}:</label>
                                    <br />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{ width: "100%" }}
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: "1rem" }}>
                                    <label>{messageData.password}:</label>
                                    <br />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={{ width: "100%" }}
                                        className="form-control"
                                    />
                                </div>
                                <div className="">
                                    <button className="btn-submit" type="submit">
                                        {messageData.login}
                                    </button>
                                </div>
                                <div className="mt-3 mb-3">
                                    <a className="btn-link">{messageData.forgot_password}</a>
                                </div>
                                <div className="text-center">
                                    {messageData.no_account}?<br />
                                    <a href="/account/auth/">
                                        <span className="text-color">{messageData.create_one}</span>
                                    </a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default LoginForm;