import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { fetchWithAuth } from "../account/auth";
import Header from "../Header";
import Footer from "../Footer";

export default function RegistrationForm({ language, languageData, handleLanguageChange }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Сюда вставляем ваш публичный сайт-ключ
  const RECAPTCHA_SITE_KEY = "6LdWEqkqAAAAAF0sgXktyNzI4PphPZByrrMpzBm_";

  // Реф на компонент reCAPTCHA (чтобы запросить или сбросить токен)
  const recaptchaRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // 1. Получаем токен от reCAPTCHA
      if (recaptchaRef.current) {
        const token = await recaptchaRef.current.executeAsync();
        // После получения токена можно «сбросить» виджет, если нужно
        recaptchaRef.current.reset();

        // 2. Делаем POST-запрос на наш бэкенд, 
        // передавая email, password и сам reCAPTCHA-токен
        const response = await fetchWithAuth("http://127.0.0.1:8000/api/accounts/register/", {
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
          setMessage("User created. Check your email for activation link.");
        } else {
          setMessage(`Ошибка при регистрации: ${JSON.stringify(data)}`);
        }
      }
    } catch (error) {
      setMessage(`Ошибка запроса: ${error.message || error}`);
    }
  };

  return (
    <>
      <Header 
        language={language} 
        languageData={languageData} 
        handleLanguageChange={handleLanguageChange} 
      />

      <div className="container margin-top-130 wrapper">
        <div style={{ maxWidth: "800px", minWidth: "300px", margin: "5rem auto" }}>
          <div className="card card-login">
            <div className="card-body">
              <div className="text-center">
                {/* Если изображение находится в папке public, используйте относительный путь */}
                <img 
                  src="/wp-content/themes/praska/assets/img/logo.png" 
                  alt="Логотип" 
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email:</label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <br />

                <div className="form-group">
                  <label htmlFor="password">Пароль:</label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <br />

                {/* Эта компонента рендерит невидимую капчу (size="invisible").
                    При нажатии на "Зарегистрироваться" вызываем recaptchaRef.current.executeAsync().
                */}
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  size="invisible"
                />

                <button type="submit" className="btn-submit mb-3">Зарегистрироваться</button>
                <a href="/account/login/" className="btn-link">Войти</a>
              </form>

              {message && <p className="mt-3">{message}</p>}
            </div>
          </div>
        </div>
      </div>

      <Footer 
        language={language} 
        languageData={languageData} 
      />
    </>
  );
}