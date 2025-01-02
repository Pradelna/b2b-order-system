import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      // Отправляем POST-запрос на эндпоинт, где вы выдаёте JWT
      const response = await axios.post("http://127.0.0.1:8000/api/token/", {
        email,
        password,
      });

      // Предполагаем, что вернутся поля { access, refresh } (SimpleJWT)
      const { access, refresh } = response.data;

      // Сохраняем токены (или только access, если refresh не используете)
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      // Перенаправляем на /account/, где уже действует ваш PrivateRoute
      navigate("/account");
    } catch (error: any) {
      if (error.response) {
        // Сервер вернул ошибку (4xx или 5xx)
        setErrorMessage(
          "Ошибка авторизации: " + JSON.stringify(error.response.data)
        );
      } else {
        // Например, нет сети
        setErrorMessage("Ошибка сети: " + error.message);
      }
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h2>Вход в личный кабинет</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Пароль:</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </div>
        <button type="submit">Войти</button>
      </form>

      {errorMessage && <p style={{ color: "red", marginTop: "1rem" }}>{errorMessage}</p>}
    </div>
  );
};

export default LoginForm;