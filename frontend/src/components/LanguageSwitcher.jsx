import React, { useState, useContext } from "react";
import { LanguageContext } from "../context/LanguageContext.jsx";

const LanguageSwitcher = ({ currentLanguage, onLanguageChange, availableLanguages }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Управление состоянием выпадающего списка
  // const { currentLanguage, onLanguageChange } = useContext(LanguageContext);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Переключаем состояние выпадающего меню
  };

  return (
    <div className="language-switcher">
      <ul className="lang">
        {/* Текущий язык */}
        <li className="lang__button" onClick={toggleDropdown}>
          <img
            src={`/images/lang-flags/${currentLanguage}-flag.png`}
            alt={currentLanguage}
            width="16"
            height="11"
          />
          <span>
            {
              availableLanguages.find((lang) => lang.lang === currentLanguage)?.prefix || "Language"
            }
          </span>
          <img
            className="arr"
            src="/wp-content/themes/praska/assets/img/arr.png"
            alt="arrow"
          />
        </li>

        {/* Выпадающее меню */}
        {isDropdownOpen && (
          <ul id="menu-yazyki" className="sub__lang">
            {availableLanguages
              .filter((lang) => lang.lang !== currentLanguage) // Исключаем текущий язык из списка
              .map((lang) => (
                <li
                  className="lang-item"
                  key={lang.lang}
                  onClick={() => {
                    onLanguageChange(lang.lang);
                    setIsDropdownOpen(false); // Закрываем меню после выбора
                  }}
                >
                  <img
                    src={`/images/lang-flags/${lang.lang}-flag.png`}
                    alt={lang.lang}
                    width="16"
                    height="11"
                  />
                  <span>{lang.prefix}</span>
                </li>
              ))}
          </ul>
        )}
      </ul>
    </div>
  );
};

export default LanguageSwitcher;