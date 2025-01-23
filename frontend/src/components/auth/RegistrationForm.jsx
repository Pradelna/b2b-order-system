import { useState, useRef, useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext.jsx";
import ReCAPTCHA from "react-google-recaptcha";
import { fetchWithAuth } from "../account/auth";
import Header from "../Header";
import Footer from "../Footer";

export default function RegistrationForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const { currentData } = useContext(LanguageContext);
  if (!currentData) {
    return null; // Если данных нет, компонент ничего не отображает
  }
  const messageData = currentData.auth;

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
          setMessage(messageData.check_email);
        } else {
          // const errorReg = JSON.stringify(data);
          const errorMessage = Object.entries(data)
          .map(([field, messages]) => {
              // Проверяем, массив ли messages и форматируем соответствующе
              const messageText = Array.isArray(messages) ? messages.join(", ") : messages;
              return `${field}: ${messageText}`;
          })
          .join("</br></br>");
          setMessage(<span dangerouslySetInnerHTML={{ __html: `${errorMessage}` }} />);
        }
      }
    } catch (error) {
      setMessage(`Error request: ${error.message || error}`);
    }
  };

  return (
    <>
      <Header />

      <div className="container margin-top-130 wrapper">

        
        <div style={{ width: "400px", margin: "5rem auto" }}>

        {message && <p className={`mt-3 alert ${message === messageData.check_email ? "alert-success" : "alert-danger" }`}>{message}</p>}

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
                  <label htmlFor="email">{ messageData.email}:</label>
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
                  <label htmlFor="password">{messageData.password}:</label>
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

                <button type="submit" className="btn-submit mb-3">{messageData.register}</button>
                <a href="/account/login/" className="btn-link">{messageData.login}</a>
              </form>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}