import React, { useState, useEffect } from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/footer";
import StartBanner from "./components/landing/StartBanner";
import About from "./components/landing/about";
import Services from "./components/landing/services";
import Technology from "./components/landing/technologies";
import Price from "./components/landing/price";
import Contacts from "./components/landing/contacts";
import MenuComponent from "./components/MenuComponent";

import "./App.css";
import Account from "./components/account";

function App() {
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "cz" // Язык по умолчанию — cz
  );
  const [languageData, setLanguageData] = useState(null); // Данные языков
  const [error, setError] = useState(null);

  // Загрузка данных языков при первом рендере
  useEffect(() => {
    fetch('http://localhost:8000/api/landing/?lang=cz')
        .then((response) => response.json())
        .then((data) => {
            // console.log('Server Response:', data); // Логируйте данные
            setLanguageData(data); // Убедитесь, что структура данных соответствует ожиданиям
        })
        .catch((error) => console.error('Fetch error:', error));
}, []);
  
  // Обработчик изменения языка
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!languageData) {
    return <div>Loading...</div>;
  }



  // Получаем данные для выбранного языка
  const currentLanguageData = languageData.find((lang) => lang.lang === language);

  return (
    <BrowserRouter>
    <div className="App">
      <Header
        language={language}
        handleLanguageChange={handleLanguageChange}
        languageData={languageData}
      />

      
        <Routes>
          <Route
            path="/"
            element={
              <>
               

                
                <StartBanner
                  language={language}
                  bannerData={languageData} />
                
                <About
                  language={language}
                  bannerData={languageData} />
                
                <Services
                  language={language}
                  servicesData={languageData} />
                
                <Technology
                  language={language}
                  techData={languageData} />
                
                <Price
                  language={language}
                  priceData={languageData} />
                
                <Contacts
                  language={language}
                    langData={languageData} />
              </>
            }
          />
          <Route
            path="/account"
            element={
              <Account language={language} languageData={languageData} />
            }
          />

        </Routes>
      
      <Footer
        language={language}
        footerData={languageData} />

      </div>
      </BrowserRouter>
  );
}

export default App;