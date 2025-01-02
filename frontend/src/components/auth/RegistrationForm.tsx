import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export default function RegistrationForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  
  // Сюда вставляем ваш публичный сайт-ключ
  const RECAPTCHA_SITE_KEY = "6LdWEqkqAAAAAF0sgXktyNzI4PphPZByrrMpzBm_"; 

  // Реф на компонент reCAPTCHA (чтобы запросить или сбросить токен)
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      // 1. Получаем токен от reCAPTCHA
      if (recaptchaRef.current) {
        const token = await recaptchaRef.current.executeAsync();
        // После получения токена можно «сбросить» виджет, если нужно
        recaptchaRef.current.reset();

        // 2. Делаем POST-запрос на наш бэкенд, 
        // передавая email, password и сам reCAPTCHA-токен
        const response = await fetch("http://127.0.0.1:8000/api/accounts/register/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            email, 
            password, 
            captchaToken: token  // <-- отправляем на бэкенд
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setMessage("Регистрация прошла успешно!");
        } else {
          setMessage(`Ошибка при регистрации: ${JSON.stringify(data)}`);
        }
      }
    } catch (error) {
      setMessage(`Ошибка запроса: ${error}`);
    }
  };

  return (
    <div>
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <br />

        <label>
          Пароль:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <br />

        {/*
          Эта компонента рендерит невидимую капчу (size="invisible").
          При нажатии на "Зарегистрироваться" вызываем recaptchaRef.current.executeAsync().
        */}
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={RECAPTCHA_SITE_KEY}
          size="invisible"
        />

        <button type="submit">Зарегистрироваться</button>
        <a href="/account/login/">LOGIN</a>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}