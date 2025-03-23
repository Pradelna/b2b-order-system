import React, { useContext, useState, useEffect } from "react";
import {useNavigate, useLocation, Link} from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import MenuComponent from "./MenuComponent";
import AccountMenuComponent from "./AccountMenuComponent";
import LanguageSwitcher from "./LanguageSwitcher";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faHouse, faUser, faMobileScreen, faEnvelope, faEarthAmerica} from "@fortawesome/free-solid-svg-icons";
import Loader from "@/components/Loader";

interface MenuData {
  header_home: string;
  header_account: string;
}

interface HeaderProps {
  formCustomer: boolean
}

const Header: React.FC = ({formCustomer}) => {
  const { language, handleLanguageChange, languageData } = useContext(LanguageContext);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  // Если данные ещё загружаются, отображаем Loader
  if (loading) {
    return <Loader />;
  }

  // Если languageData не доступен, показываем сообщение
  if (!languageData || !languageData.length) {
    return <div>No language data available.</div>;
  }
  const currentData = languageData.find((item) => item.lang === language);
  const menuData: MenuData = currentData?.menu || { header_home: "", header_account: "" };

  const handleLanguageChangeWithPrefixRemoval = (lang: string) => {
    handleLanguageChange(lang);
    const newPath = location.pathname.replace(/^\/[a-z]{2}/, "");
    navigate(newPath || "/");
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
                <a href="tel:+420734246834" className="tel">
                  <FontAwesomeIcon icon={faMobileScreen} className="icon" />
                  <span>+420 734 246 834</span>
                </a>
                <a href="mailto:office@pradelna1.com" className="mail">
                  <FontAwesomeIcon icon={faEnvelope} className="icon" />
                  <span>office@pradelna1.com</span>
                </a>
                {(location.pathname === "/account/auth" ||
                    location.pathname === "/account/login" ||
                    location.pathname === "/forgot-password" ||
                    formCustomer) ? (
                    <Link to="/" className="mail">
                      <FontAwesomeIcon icon={faEarthAmerica} className="icon"/>
                      <span>{currentData?.auth.button_error}</span>
                    </Link>
                ) : (
                <button onClick={handleAuthClick} className="header-menu">
                  <FontAwesomeIcon icon={faUser} className="icon" />
                  <span>{isAuthenticated ? menuData?.header_account : (currentData?.auth.login || "Přihlásit se")}</span>
                </button>)}
              </div>

              <div className="to-website">
                {(location.pathname === "/account/auth" ||
                    location.pathname === "/account/login" ||
                    location.pathname === "/forgot-password" ||
                    formCustomer) ? (
                    <Link to="/" className="mail">
                      <FontAwesomeIcon icon={faEarthAmerica} className="icon"/>
                      <span>{currentData?.auth.button_error}</span>
                    </Link>
                ) : (
                    <button onClick={handleAuthClick} className="header-menu">
                      <FontAwesomeIcon icon={faUser} className="icon" />
                      <span>{isAuthenticated ? menuData?.header_account : (currentData?.auth.login || "Přihlásit se")}</span>
                    </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Contacts */}
        {!formCustomer && (
            <div className="header__mobile__contacts">
              <div className="container">
                <div className="header__mobile__contacts__wrap">
                  <a href="tel:+420734246834" className="tel">
                    <FontAwesomeIcon icon={faMobileScreen} className="icon" />
                    <span className="ms-2"> +420 734 246 834</span>
                  </a>
                  <a href="mailto:office@pradelna1.com" className="mail">
                    <FontAwesomeIcon icon={faEnvelope} className="icon" />
                    <span className="ms-2"> office@pradelna1.com</span>
                  </a>
                </div>
              </div>
            </div>
        )}


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

  if (location.pathname.startsWith("/account") || location.pathname === "/forgot-password") {
    return <AccountMenuComponent menuData={menuData} />;
  }
  return <MenuComponent menuData={menuData} />;
};