import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

type ActivationParams = {
  uid?: string;   // uidb64
  token?: string; // token
};

const ActivationPage: React.FC = () => {
  const { uid, token } = useParams<ActivationParams>();
  const [message, setMessage] = useState<string>("Проверка ссылки...");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Если uid и token есть в URL, отправляем запрос на сервер
    if (uid && token) {
      axios
        .post("http://127.0.0.1:8000/api/accounts/activate/", {
          uidb64: uid,
          token: token,
        })
        .then((response) => {
          // Успех (статус 200)
          setMessage(response.data.message || "Аккаунт активирован!");
        })
        .catch((error) => {
          if (error.response) {
            // Ошибка, пришедшая с сервера
            setMessage(error.response.data.message || "Ошибка активации.");
          } else {
            // Например, проблема с сетью
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
  }, [uid, token]);

  return (
    <div style={{ margin: "2rem" }}>
      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <h3>{message}</h3>
      )}
    </div>
  );
};

export default ActivationPage;