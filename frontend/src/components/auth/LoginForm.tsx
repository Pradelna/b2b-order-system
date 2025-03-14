import React, { useState, useContext, FormEvent } from "react";
import { LanguageContext } from "../../context/LanguageContext.js";
import { useNavigate } from "react-router-dom";
import Header from "../Header.js";
import Footer from "../Footer.tsx";
import { fetchWithAuth } from "../account/auth.ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSquareXmark} from "@fortawesome/free-solid-svg-icons";

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const BASE_URL = import.meta.env.VITE_API_URL;
    const { currentData } = useContext(LanguageContext);
    const navigate = useNavigate();
    // Return null if the language data is not available
    if (!currentData || !currentData.auth) {
        return <div>Loading...</div>;
    }
    const messageData = currentData?.auth;

    // Handle login form submission
    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");

        try {
            // Send a POST request using fetchWithAuth
            const response = await fetchWithAuth(`${BASE_URL}/token/`, {
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
                <div className="form-login">
                    {errorMessage && (
                        <p className="alert alert-danger">{errorMessage}</p>
                    )}

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
                                    <a href="/forgot-password" className="btn-link">{messageData.forgot_password}</a>
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