import Header from "./Header";
import StartBanner from "./landing/StartBanner";
import About from "./landing/About.js";
import Services from "./landing/Services.js";
import Technology from "./landing/Technologies.js";
import Price from "./landing/Price.js";
import Contacts from "./landing/Contacts.js";
import Footer from "./Footer";
import Cookies from "./Cookies";
import { Helmet } from "react-helmet";
import { LanguageContext } from "../context/LanguageContext";
import {useContext} from "react";

const MainPage: React.FC = () => {
    const { currentData } = useContext(LanguageContext);

    let title, description, htmlLang;
    if (currentData?.lang === "en") {
        title = "Professional laundry in Prague, washing and dry cleaning";
        description = "Washing and cleaning work uniforms, cleaning feather products, removing stains, basic processing of linen using dry cleaning machines";
        htmlLang = "en-GB";
    } else if (currentData?.lang === "ru") {
        title = "Профессиональная прачечная в Праге, стирка и химчистка";
        description = "Стирка и чистка рабочей формы, спец одежды, чистка перьевых изделий, удаление пятен, основная обработка белья с использованием машин химчистки";
        htmlLang = "ru-RU";
    } else {
        // Язык по умолчанию
        title = "Profesionální prádelna v Praze, praní a chemické čištění";
        description = "Praní a čištění uniforem, oděvů, čištění péřových výrobků, odstranění skvrn, základní ošetření prádla za pomocí strojů na chemické čištění.";
        htmlLang = "cs-CZ";
    }
    return (
        <>
            <Helmet>
                <html lang={htmlLang}></html>
                <title>{title}</title>
                <meta name="description" content={description} />
            </Helmet>
            <Header />
            <StartBanner />
            <About />
            <Services />
            <Technology />
            <Price />
            <Contacts />
            <Footer />
            <Cookies />
        </>
    );
};

export default MainPage;