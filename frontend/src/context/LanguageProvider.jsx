import React, { createContext, useState, useEffect } from "react";
import { LanguageContext } from "./LanguageContext";

// Провайдер контекста
export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem("language") || "cz"); // Язык по умолчанию
    const [languageData, setLanguageData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    // console.log(`LanguageProvider language ${language}`);
    
    
 // Загружаем данные языка
    useEffect(() => {
    fetch(`http://localhost:8000/api/landing/?lang=${language}`)
      .then((response) => response.json())
      .then((data) => {
        setLanguageData(data);
        // console.log(`LanguageProvider data in useEffect ${data}`);
        setLoading(false); // Завершаем загрузку
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setError("Failed to load language data.");
      });
  }, []);
    


  const handleLanguageChange = (lang) => {
    if (lang !== language) {
      setLanguage(lang);
      localStorage.setItem("language", lang); // Сохраняем выбор языка
    }
  };
    

const currentData = languageData?.find(item => item.lang === language);
if (!loading && !currentData) {
    console.error("No data found for the current language.");
}
// console.log(`LanguageProvider currentData ${currentData}`);
// console.log(currentData);

    return (
        <LanguageContext.Provider value={{ language, languageData, handleLanguageChange, currentData, loading }}>
            {children}
        </LanguageContext.Provider>
    );
};