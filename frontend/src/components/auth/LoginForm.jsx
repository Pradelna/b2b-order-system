import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import { fetchWithAuth } from "../account/auth";

const LoginForm = ({ language, languageData, handleLanguageChange }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!languageData) {
    console.log("no data")
    return null;
  }
  if (!language) {
    language = "cz"
  }
  const wholeData = languageData.find(item => item.lang === language);
  const messageData = wholeData.auth;

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
        setErrorMessage(`${messageData.author_error} ${errorData.detail || messageData.unknown_error}`);
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
      setErrorMessage(`${messageData.network_error} ${error.message}`);
    }
  };

  return (
    <>
    <Header language={language} languageData={languageData} handleLanguageChange={handleLanguageChange} />
          
    <div className="container margin-top-130 wrapper">
        
      <div style={{ width: "400px", margin: "5rem auto" }}>
        
      {errorMessage && (
          <p className="alert alert-danger">{errorMessage}</p>
        )}
        
        <div className="card card-login">
            <div className="card-body ">
                <div className="text-center">
                    <img src="/wp-content/themes/praska/assets/img/logo.png"
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
                  <button className="btn-submit" type="submit">{messageData.login}</button>
                </div>
                <div className="mt-3 mb-3">
                  <a className="btn-link">{ messageData.forgot_password }</a>
                </div>
                <div className="text-center">
                        {messageData.no_account}?<br />
                        <a href="/account/auth/"><span className="text-color">{messageData.create_one}</span></a>
                </div>
                </form>


                          
            </div>
        </div>


        </div>
    </div>
          
      <Footer language={language} languageData={languageData} />
    </>
  );
};

export default LoginForm;