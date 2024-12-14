import { useState, useEffect } from "react";
import axios from "../api/axios";

function useLanguageData(apiEndpoint, defaultLanguage = "cz") {
  const [language, setLanguage] = useState(() => {
    // Проверяем, есть ли язык в кэше
      console.log(localStorage.getItem("language"));
    return localStorage.getItem("language") || defaultLanguage;
  });

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Изменение языка
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang); // Сохраняем выбранный язык в кэш
  };

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null); // Сбрасываем ошибку перед новым запросом

        // Проверяем, есть ли кэшированные данные
        const cachedData = localStorage.getItem(`${apiEndpoint}_${language}`);
        if (cachedData) {
          setData(JSON.parse(cachedData));
        } else {
          const response = await axios.get(`${apiEndpoint}?lang=${language}`);
          setData(response.data);
          localStorage.setItem(
            `${apiEndpoint}_${language}`,
            JSON.stringify(response.data)
          );
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
        setError("Не удалось загрузить данные.");
      }
    };

    fetchData();
  }, [language, apiEndpoint]);

  return { language, data, error, handleLanguageChange };
}

export default useLanguageData;