import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams, Navigate, useNavigate } from "react-router-dom";
import Header from "./Header";
import StartBanner from "./landing/StartBanner";
import About from "./landing/About";
import Services from "./landing/Services";
import Technology from "./landing/Technologies";
import Price from "./landing/Price";
import Contacts from "./landing/Contacts";
import Footer from "./Footer";

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
  
export default MainPageWithPrefix;