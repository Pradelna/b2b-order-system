import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MenuComponent from "./MenuComponent";
import AccountMenuComponent from "./AccountMenuComponent";
import LanguageSwitcher from "./LanguageSwitcher";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faUser } from "@fortawesome/free-solid-svg-icons";

function Header({ language, handleLanguageChange, languageData }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!languageData) {
    return null; // Возвращаем пустой компонент, если данных нет
  }
  // console.log(languageData);
  // console.log(language);
  // console.log(handleLanguageChange);
  const currentData = languageData.find((item) => item.lang === language);
  const menuData = currentData.menu;

  // Обработчик переключения языка с удалением префикса
  const handleLanguageChangeWithPrefixRemoval = (lang) => {
    handleLanguageChange(lang); // Меняем язык
    const newPath = location.pathname.replace(/^\/[a-z]{2}/, ""); // Убираем префикс языка из пути
    navigate(newPath || "/"); // Перенаправляем на путь без префикса
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
                <img
                  src="/wp-content/themes/praska/assets/img/tel.png"
                  alt="Телефон"
                />
                <span>+420 734 246 834</span>
              </a>
              <a href="mailto:pradelna1cz@gmail.com" className="mail">
                <img
                  src="/wp-content/themes/praska/assets/img/mail.png"
                  alt="Почта"
                />
                <span>pradelna1cz@gmail.com</span>
              </a>
              <a href="/account" className="mail">
                <FontAwesomeIcon icon={faUser} className="icon" />
                <span>{menuData.header_account}</span>
              </a>
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
              <img
                src="/wp-content/themes/praska/assets/img/tel2.png"
                alt="Телефон"
              />
              <span>+420 734 246 834</span>
            </a>
            <a href="mailto:pradelna1cz@gmail.com" className="mail">
              <img src="/assets/img/mail3.png" alt="Почта" />
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

  // Используем разные компоненты для разных маршрутов
  if (location.pathname === "/account") {
    return <AccountMenuComponent menuData={menuData} />;
  }

  // По умолчанию используем основной Header
  return <MenuComponent menuData={menuData} />;
};