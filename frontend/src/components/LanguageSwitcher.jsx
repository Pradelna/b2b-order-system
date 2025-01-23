import React, { useState, useContext } from "react";
import { LanguageContext } from "../context/LanguageContext.jsx";

const LanguageSwitcher = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Управление состоянием выпадающего списка
  const { language, handleLanguageChange, languageData } = useContext(LanguageContext);
  // console.log("LanguageSwitcher avaibleLanguage", languageData);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Переключаем состояние выпадающего меню
  };

  const updateURLWithoutPrefix = (newLang) => {
    const currentURL = window.location.pathname;

    // Регулярное выражение для поиска языкового префикса в начале URL
    const languagePrefixRegex = /^\/[a-z]{2}(\/|$)/;

    // Проверяем, есть ли языковой префикс и удаляем его
    const baseURL = currentURL.match(languagePrefixRegex)
      ? currentURL.replace(languagePrefixRegex, "/")
      : currentURL;

    // Если выбранный язык `cz`, оставляем URL без префикса
    const updatedURL = newLang === "cz" ? baseURL : `/${newLang}${baseURL}`;

    // Обновляем URL без перезагрузки страницы
    window.history.pushState(null, "", updatedURL);
  };

  return (
    <div className="language-switcher">
      <ul className="lang">
        {/* Текущий язык */}
        <li className="lang__button" onClick={toggleDropdown}>
          <img
            src={`/images/lang-flags/${language}-flag.png`}
            alt={language}
            width="16"
            height="11"
          />
          <span>
            {
              languageData.find((lang) => lang.lang === language)?.prefix || "Language"
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
            {languageData
              .filter((lang) => lang.lang !== language) // Исключаем текущий язык из списка
              .map((lang) => (
                <li
                  className="lang-item"
                  key={lang.lang}
                  onClick={() => {
                    handleLanguageChange(lang.lang);
                    updateURLWithoutPrefix(lang.lang); // Обновляем URL
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