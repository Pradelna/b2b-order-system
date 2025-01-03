import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const ActivationPage = ({ languageData }) => {
  const { uid, token } = useParams();
  const [message, setMessage] = useState("Проверка ссылки...");
  const [loading, setLoading] = useState(true);

  const currentData = languageData[0];
  const messageData = currentData["contacts"];

  useEffect(() => {
    if (uid && token) {
      axios
        .post("http://127.0.0.1:8000/api/accounts/activate/", {
          uidb64: uid,
          token: token,
        })
        .then((response) => {
          setMessage(response.data.message || messageData.title || "Аккаунт активирован!");
        })
        .catch((error) => {
          if (error.response) {
            setMessage(error.response.data.message || "Ошибка активации.");
          } else {
            setMessage("Не удалось связаться с сервером.");
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setMessage("Некорректная ссылка активации (не хватает параметров).");
      setLoading(false);
    }
  }, [uid, token, messageData.title]);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg">
            <div className="card-body text-center">
              {loading ? (
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Загрузка...</span>
                </div>
              ) : (
                <>
                  <h3 className={`mb-4 ${message === messageData.title ? "text-success" : "text-danger"}`}>
                    {message}
                  </h3>
                  <Link to="/" className="btn-link">
                    Вернуться на главную
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