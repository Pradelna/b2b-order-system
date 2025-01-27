import React, { useState, useRef, useContext, FormEvent } from "react";
import { LanguageContext } from "../../context/LanguageContext.js";
import ReCAPTCHA from "react-google-recaptcha";
import { fetchWithAuth } from "../account/auth";
import Header from "../Header.js";
import Footer from "../Footer.tsx";

const RegistrationForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string | JSX.Element>("");

  const { currentData } = useContext(LanguageContext);
  if (!currentData) {
    return null; // Return nothing if language data is not available
  }
  const messageData = currentData.auth;

  // Insert your reCAPTCHA site key here
  const RECAPTCHA_SITE_KEY = "6LdWEqkqAAAAAF0sgXktyNzI4PphPZByrrMpzBm_";

  // Ref for the reCAPTCHA component
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      // Retrieve the reCAPTCHA token
      if (recaptchaRef.current) {
        const token = await recaptchaRef.current.executeAsync();
        recaptchaRef.current.reset();

        // Make a POST request to your backend
        const response = await fetchWithAuth("http://127.0.0.1:8000/api/accounts/register/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            captchaToken: token, // Include the reCAPTCHA token
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setMessage(messageData.check_email);
        } else {
          // Format error messages from the backend
          const errorMessage = Object.entries(data)
              .map(([field, messages]) => {
                const messageText = Array.isArray(messages) ? messages.join(", ") : messages;
                return `${field}: ${messageText}`;
              })
              .join("<br><br>");
          setMessage(<span dangerouslySetInnerHTML={{ __html: errorMessage }} />);
        }
      }
    } catch (error: any) {
      setMessage(`Error request: ${error.message || error}`);
    }
  };

  return (
      <>
        <Header />

        <div className="container margin-top-130 wrapper">
          <div style={{ width: "400px", margin: "5rem auto" }}>
            {message && (
                <p
                    className={`mt-3 alert ${
                        message === messageData.check_email ? "alert-success" : "alert-danger"
                    }`}
                >
                  {message}
                </p>
            )}

            <div className="card card-login">
              <div className="card-body">
                <div className="text-center">
                  <img
                      src="/wp-content/themes/praska/assets/img/logo.png"
                      alt="Logo"
                      style={{ maxWidth: "100%", height: "auto" }}
                  />
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="email">{messageData.email}:</label>
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

                  {/* Invisible reCAPTCHA */}
                  <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} size="invisible" />

                  <button type="submit" className="btn-submit mb-3">
                    {messageData.register}
                  </button>
                  <a href="/account/login/" className="btn-link">
                    {messageData.login}
                  </a>
                </form>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </>
  );
};

export default RegistrationForm;