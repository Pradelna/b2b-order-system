import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams, Navigate, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import HeaderAccount from "./components/HeaderAccount";
import Footer from "./components/footer";
import StartBanner from "./components/landing/StartBanner";
import About from "./components/landing/about";
import Services from "./components/landing/services";
import Technology from "./components/landing/technologies";
import Price from "./components/landing/price";
import Contacts from "./components/landing/contacts";
import RegistrationForm from "./components/auth/RegistrationForm";
import ActivationPage from "./components/auth/ActivationPage"; 

import "./App.css";
import Account from "./components/account";

function App() {
  const [language, setLanguage] = useState(localStorage.getItem("language") || "cz"); // Язык по умолчанию
  const [languageData, setLanguageData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/landing/?lang=${language}`)
      .then((response) => response.json())
      .then((data) => {
        setLanguageData(data);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setError("Failed to load language data.");
      });
  }, [language]);

  const handleLanguageChange = (lang) => {
    if (lang !== language) {
      setLanguage(lang);
      localStorage.setItem("language", lang); // Сохраняем выбор языка
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!languageData) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Главная страница без префикса */}
          <Route
            path="/"
            element={
              <MainPage
                language={language}
                languageData={languageData}
                setLanguage={setLanguage}
                handleLanguageChange={handleLanguageChange}
              />
            }
          />
          {/* Главная страница с префиксом */}
          <Route
            path="/:lang"
            element={
              <MainPageWithPrefix
                language={language}
                languageData={languageData}
                setLanguage={setLanguage}
                handleLanguageChange={handleLanguageChange}
              />
            }
          />
          {/* Страница аккаунта */}
          <Route
            path="/account/*"
            element={
              <AccountPage
                language={language}
                languageData={languageData}
                handleLanguageChange={handleLanguageChange}
              />
            }
          />
          <Route
            path="/account/auth"
            element={<RegistrationForm />}
          />
          <Route path="/activate/:uid/:token" element={<ActivationPage />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function MainPage({ language, languageData, setLanguage, handleLanguageChange }) {
  useEffect(() => {
    const cachedLanguage = localStorage.getItem("language") || "cz"; // Берём язык из localStorage
    setLanguage(cachedLanguage); // Устанавливаем язык из кэша
  }, [setLanguage]);

  return (
    <>
      <Header
        language={language}
        languageData={languageData}
        handleLanguageChange={handleLanguageChange}
      />
      <StartBanner language={language} bannerData={languageData} />
      <About language={language} bannerData={languageData} />
      <Services language={language} servicesData={languageData} />
      <Technology language={language} techData={languageData} />
      <Price language={language} priceData={languageData} />
      <Contacts language={language} langData={languageData} />
      <Footer language={language} footerData={languageData} />
    </>
  );
}

function MainPageWithPrefix({ language, languageData, setLanguage, handleLanguageChange }) {
  const { lang } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (lang === "cz") {
      // Если префикс "cz", перенаправляем на путь без префикса
      navigate("/");
    } else if (lang && lang !== language) {
      // Если язык отличается, устанавливаем его
      setLanguage(lang);
      localStorage.setItem("language", lang);
    }
  }, [lang, language, setLanguage, navigate]);

  return (
    <>
      <Header
        language={language}
        languageData={languageData}
        handleLanguageChange={handleLanguageChange}
      />
      <StartBanner language={language} bannerData={languageData} />
      <About language={language} bannerData={languageData} />
      <Services language={language} servicesData={languageData} />
      <Technology language={language} techData={languageData} />
      <Price language={language} priceData={languageData} />
      <Contacts language={language} langData={languageData} />
      <Footer language={language} footerData={languageData} />
    </>
  );
}

function AccountPage({ language, languageData, handleLanguageChange }) {
  useEffect(() => {
    const cachedLanguage = localStorage.getItem("language"); // Берём язык из localStorage
    if (cachedLanguage) {
      handleLanguageChange(cachedLanguage); // Устанавливаем язык из кэша
    }
  }, [handleLanguageChange]);

  return (
    <>
      <HeaderAccount
        language={language}
        languageData={languageData}
        handleLanguageChange={handleLanguageChange}
      />
      <Account language={language} languageData={languageData} />
      <Footer language={language} footerData={languageData} />
    </>
  );
}

export default App;