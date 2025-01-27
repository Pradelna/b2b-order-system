import { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext.js";
import MenuComponent from "./MenuComponent.js";
import AccountMenuComponent from "./AccountMenuComponent";
import LanguageSwitcher from "./LanguageSwitcher.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faUser, faMobileScreen, faEnvelope } from "@fortawesome/free-solid-svg-icons";

interface MenuData {
  header_home: string;
  header_account: string;
}

const Header: React.FC = () => {
  const { language, handleLanguageChange, languageData } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsAuthenticated(!!token); // Check if the user is authenticated
  }, []);

  if (!languageData) {
    return null; // Return empty component if no language data is available
  }

  const currentData = languageData.find((item) => item.lang === language);
  const menuData: MenuData = currentData?.menu || { header_home: "", header_account: "" };

  const handleLanguageChangeWithPrefixRemoval = (lang: string) => {
    handleLanguageChange(lang); // Change the language
    const newPath = location.pathname.replace(/^\/[a-z]{2}/, ""); // Remove language prefix
    navigate(newPath || "/"); // Redirect without prefix
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      navigate("/account");
    } else {
      navigate("/account/login");
    }
  };

  return (
      <header className="header">
        {/* Top Header */}
        <div className="header__top">
          <div className="container">
            <div className="header__top__wrap">
              {/* Language Switcher */}
              <LanguageSwitcher
                  currentLanguage={language}
                  onLanguageChange={handleLanguageChangeWithPrefixRemoval}
                  availableLanguages={languageData}
              />

              {/* Contact Information */}
              <div className="contact">
                <a href="/" className="mail">
                  <FontAwesomeIcon icon={faHouse} className="icon" />
                  <span>{menuData.header_home}</span>
                </a>
                <a href="tel:+420734246834" className="tel">
                  <FontAwesomeIcon icon={faMobileScreen} className="icon" />
                  <span>+420 734 246 834</span>
                </a>
                <a href="mailto:pradelna1cz@gmail.com" className="mail">
                  <FontAwesomeIcon icon={faEnvelope} className="icon" />
                  <span>pradelna1cz@gmail.com</span>
                </a>
                <button onClick={handleAuthClick} className="header-menu">
                  <FontAwesomeIcon icon={faUser} className="icon" />
                  <span>{isAuthenticated ? menuData.header_account : "Log in"}</span>
                </button>
              </div>

              {/* Burger Menu */}
              <button className="burg">
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Contacts */}
        <div className="header__mobile__contacts">
          <div className="container">
            <div className="header__mobile__contacts__wrap">
              <a href="tel:+420734246834" className="tel">
                <FontAwesomeIcon icon={faMobileScreen} className="icon" />
                <span>+420 734 246 834</span>
              </a>
              <a href="mailto:pradelna1cz@gmail.com" className="mail">
                <FontAwesomeIcon icon={faEnvelope} className="icon" />
                <span>pradelna1cz@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Dynamic Menu */}
        <DynamicMenu menuData={menuData} />
      </header>
  );
};

export default Header;

interface DynamicMenuProps {
  menuData: MenuData;
}

const DynamicMenu: React.FC<DynamicMenuProps> = ({ menuData }) => {
  const location = useLocation();

  if (location.pathname.startsWith("/account")) {
    return <AccountMenuComponent menuData={menuData} />;
  }

  return <MenuComponent menuData={menuData} />;
};