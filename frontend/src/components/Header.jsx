import React, { useState, useEffect, useContext } from "react";
import { LanguageContext } from "../context/LanguageContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import MenuComponent from "./MenuComponent";
import AccountMenuComponent from "./AccountMenuComponent";
import LanguageSwitcher from "./LanguageSwitcher";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faUser, faMobileScreen, faEnvelope } from "@fortawesome/free-solid-svg-icons";

function Header() {
  const { language, handleLanguageChange, languageData } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Проверяем, есть ли токен в localStorage
    const token = localStorage.getItem("accessToken");
    setIsAuthenticated(!!token); // Если токен есть, пользователь аутентифицирован
  }, []);

  if (!languageData) {
    return null; // Возвращаем пустой компонент, если данных нет
  }
  const currentData = languageData.find((item) => item.lang === language);
  const menuData = currentData.menu;

  // Обработчик переключения языка с удалением префикса
  const handleLanguageChangeWithPrefixRemoval = (lang) => {
    handleLanguageChange(lang); // Меняем язык
    const newPath = location.pathname.replace(/^\/[a-z]{2}/, ""); // Убираем префикс языка из пути
    navigate(newPath || "/"); // Перенаправляем на путь без префикса
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      navigate("/account"); // Если пользователь залогинен, переходим в аккаунт
    } else {
      navigate("/account/login"); // Если пользователь не залогинен, переходим на логин
    }
  };

  return (
    <header className="header">
      {/* Верхняя часть шапки */}
      <div className="header__top">
        <div className="container">
          <div className="header__top__wrap">
            {/* Компонент переключения языков */}
            <LanguageSwitcher
              currentLanguage={language}
              onLanguageChange={handleLanguageChangeWithPrefixRemoval} // Используем обновлённый обработчик
              availableLanguages={languageData}
            />

            {/* Контактная информация */}
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
              <FontAwesomeIcon icon={faEnvelope } className="icon" />
                <span>pradelna1cz@gmail.com</span>
              </a>
              <button onClick={handleAuthClick} className="header-menu">
                <FontAwesomeIcon icon={faUser} className="icon" />
                <span>{isAuthenticated ? menuData.header_account : "Log in"}</span>
              </button>
            </div>

            {/* Бургер-меню */}
            <button className="burg">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>

      {/* Контакты для мобильных устройств */}
      <div className="header__mobile__contacts">
        <div className="container">
          <div className="header__mobile__contacts__wrap">
            <a href="tel:+420734246834" className="tel">
            <FontAwesomeIcon icon={faMobileScreen} className="icon" />
              <span>+420 734 246 834</span>
            </a>
            <a href="mailto:pradelna1cz@gmail.com" className="mail">
            <FontAwesomeIcon icon={faEnvelope } className="icon" />
              <span>pradelna1cz@gmail.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Динамическое меню */}
      <DynamicMenu menuData={menuData} />
    </header>
  );
}

export default Header;

// Динамическое управление Header
const DynamicMenu = ({ menuData }) => {
  const location = useLocation(); // Определяем текущий маршрут

  // Проверяем, начинается ли путь с "/account"
  if (location.pathname.startsWith("/account")) {
    return <AccountMenuComponent menuData={menuData} />;
  }

  // По умолчанию используем основной Header
  return <MenuComponent menuData={menuData} />;
};