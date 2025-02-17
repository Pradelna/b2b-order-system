import { useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import Header from "./Header";
import StartBanner from "./landing/StartBanner";
import About from "./landing/About.js";
import Services from "./landing/Services.js";
import Technology from "./landing/Technologies.js";
import Price from "./landing/Price.js";
import Contacts from "./landing/Contacts.js";
import Footer from "./Footer";

const MainPageWithPrefix: React.FC = () => {
    const { language, handleLanguageChange } = useContext(LanguageContext);
    const { lang } = useParams<{ lang: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (lang === "cz") {
            navigate("/"); // Redirect to the main page
        } else if (lang && lang !== language) {
            handleLanguageChange(lang); // Change the language
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
};

export default MainPageWithPrefix;