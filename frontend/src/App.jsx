import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams, Navigate, useNavigate } from "react-router-dom";
import PrivateRoute from "./components/auth/PrivateRoute";
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
import LoginForm from "./components/auth/LoginForm";
import Loader from "./components/Loader";

import "./App.css";
import Account from "./components/account";

function App() {
  const [language, setLanguage] = useState(localStorage.getItem("language") || "cz"); // Язык по умолчанию
  const [languageData, setLanguageData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Загружаем данные языка
  useEffect(() => {
    fetch(`http://localhost:8000/api/landing/?lang=${language}`)
      .then((response) => response.json())
      .then((data) => {
        setLanguageData(data);
        setLoading(false); // Завершаем загрузку
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

  // Отображаем загрузчик, если данные ещё не загружены
  if (!languageData) {
    return <Loader progress={progress} />;
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
                handleLanguageChange={handleLanguageChange}
              />
            }
          />
          {/* Страница аккаунта с приватным доступом */}
          <Route
            path="/account/*"
            element={
              <PrivateRoute>
                <AccountPage
                  language={language}
                  languageData={languageData}
                  handleLanguageChange={handleLanguageChange}
                />
              </PrivateRoute>
            }
          />
          {/* Страница регистрации */}
          <Route path="/account/auth" element={<RegistrationForm />} />
          {/* Страница активации */}
          <Route path="/activate/:uid/:token" element={<ActivationPage />} />
          {/* Страница входа */}
          <Route path="/account/login" element={<LoginForm />} />
          {/* Страница для неизвестных маршрутов */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function MainPage({ language, languageData, handleLanguageChange }) {
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

function MainPageWithPrefix({ language, languageData, handleLanguageChange }) {
  const { lang } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (lang === "cz") {
      navigate("/"); // Перенаправляем на главную
    } else if (lang !== language) {
      handleLanguageChange(lang); // Меняем язык
    }
  }, [lang, language, handleLanguageChange, navigate]);

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