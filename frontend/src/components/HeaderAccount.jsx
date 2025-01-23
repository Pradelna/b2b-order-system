import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext.jsx";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import useLanguageData from "../hooks/useLanguageData";
import MenuComponent from "./MenuComponent";
import AccountMenuComponent from "./AccountMenuComponent";
import LanguageSwitcher from "./LanguageSwitcher";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse, faUser, faMobileScreen, faEnvelope
} from "@fortawesome/free-solid-svg-icons";

function HeaderAccount() {
    const { currentData } = useContext(LanguageContext);
    const menuData = currentData ? currentData.menu : null;

  return (
    <header className="header">
      {/* Верхняя часть шапки */}
      <div className="header__top">
        <div className="container">
          <div className="header__top__wrap">
            {/* Компонент переключения языков */}
            <LanguageSwitcher />
            {/* Контактная информация */}
            <div className="contact">
            <a href="/" className="mail">
                <FontAwesomeIcon icon={faHouse} className="icon" />
                <span>{ menuData.header_home }</span>
              </a>
              <a href="tel:+420734246834" className="tel">
                <FontAwesomeIcon icon={faMobileScreen} className="icon" />
                <span>+420 734 246 834</span>
              </a>
              <a href="mailto:pradelna1cz@gmail.com" className="mail">
                <FontAwesomeIcon icon={faEnvelope } className="icon" />
                <span>pradelna1cz@gmail.com</span>
              </a>
              <a href="/account" className="mail">
              <FontAwesomeIcon icon={faUser} className="icon" />
                <span>{ menuData.header_account }</span>
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




      </header>

  );
}

export default HeaderAccount;
