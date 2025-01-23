import { useEffect, useContext } from "react";
import { LanguageContext } from "../context/LanguageContext.jsx";
import { BrowserRouter, Routes, Route, useParams, Navigate, useNavigate } from "react-router-dom";
import Header from "./Header";
import StartBanner from "./landing/StartBanner";
import About from "./landing/About";
import Services from "./landing/Services";
import Technology from "./landing/Technologies";
import Price from "./landing/Price";
import Contacts from "./landing/Contacts";
import Footer from "./Footer";

function MainPageWithPrefix() {
  const { language, handleLanguageChange } = useContext(LanguageContext);
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
      <Header />
      <StartBanner />
      <About />
      <Services />
      <Technology />
      <Price />
      <Contacts />
      <Footer />
    </>
  );
}
  
export default MainPageWithPrefix;