import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import { fetchWithAuth } from "../account/auth";

const LoginForm = ({ language, languageData, handleLanguageChange }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      // Используем fetchWithAuth для отправки POST-запроса
      const response = await fetchWithAuth("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(`Ошибка авторизации: ${errorData.detail || "Неизвестная ошибка"}`);
        return;
      }

      // Предполагаем, что вернутся поля { access, refresh } (SimpleJWT)
      const data = await response.json();
      const { access, refresh } = data;

      // Сохраняем токены
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      // Перенаправляем на /account/
      navigate("/account");
    } catch (error) {
      setErrorMessage(`Ошибка сети: ${error.message}`);
    }
  };

  return (
    <>
    <Header language={language} languageData={languageData} handleLanguageChange={handleLanguageChange} />
          
    <div className="container margin-top-130 wrapper">
        
      <div style={{ maxWidth: "800px", minWidth: "300px", margin: "5rem auto" }}>
        
        <div className="card card-login">
            <div className="card-body ">
                <div className="text-center">
                    <img src="/wp-content/themes/praska/assets/img/logo.png"
                        alt="Логотип"
                    />
                </div>
            
                <form onSubmit={handleLogin}>

                <div className="form-group" style={{ marginBottom: "1rem" }}>
                    <label>your email:</label>
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
                    <label>password:</label>
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
                    <button className="btn-submit" type="submit">log in</button>
                </div>
                <div className="mt-3 mb-3">
                    <a className="btn-link">fogot password?</a>
                </div>
                <div className="text-center">
                        Don't have an account yet?<br />
                        <a href="/account/auth/">create one now</a>
                </div>
                </form>

        {errorMessage && (
          <p style={{ color: "red", marginTop: "1rem" }}>{errorMessage}</p>
        )}
                          
            </div>
        </div>


        </div>
    </div>
          
      <Footer language={language} languageData={languageData} />
    </>
  );
};

export default LoginForm;