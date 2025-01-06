import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const ActivationPage = ({ language, languageData }) => {
  if (!languageData) {
    console.log("no data")
    return null;
  }
  if (!language) {
    language = "cz"
  }
  const wholeData = languageData.find(item => item.lang === language);

  const { uid, token } = useParams();
  const [message, setMessage] = useState("link checking...");
  const [loading, setLoading] = useState(true);

  const messageData = wholeData.auth;

  useEffect(() => {
    if (uid && token) {
      axios
        .post("http://127.0.0.1:8000/api/accounts/activate/", {
          uidb64: uid,
          token: token,
        })
        .then((response) => {
          setMessage( messageData.account_activated || response.data.message || "Účet aktivován úspěšně");
        })
        .catch((error) => {
          if (error.response) {
            setMessage(messageData.activation_error || error.response.data.message || "сhyba aktivace");
          } else {
            setMessage(messageData.server_error || "nepodařilo se spojit se serverem");
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setMessage(messageData.invalid_token || "neplatný nebo vypršený odkaz");
      setLoading(false);
    }
  }, [uid, token, messageData.account_activated]);

  console.log(message);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg">
            <div className="card-body text-center">
              {loading ? (
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">loading...</span>
                </div>
              ) : (
                <>
                  <h3 className={`mb-4 ${message === messageData.account_activated ? "text-success" : "text-danger" }`}>
                    {message}
                  </h3>
                  <Link to={`${message === messageData.account_activated ? "/account/" : "/" }`} className="btn-link">
                      {messageData.button_ok}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivationPage;