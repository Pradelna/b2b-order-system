import { useState, useContext } from "react";
import { LanguageContext } from "../context/LanguageContext.js";

interface Language {
  lang: string;
  prefix: string;
}

const LanguageSwitcher: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown state
  const { language, handleLanguageChange, languageData } = useContext(LanguageContext);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Toggle dropdown state
  };

  const updateURLWithoutPrefix = (newLang: string) => {
    const currentURL = window.location.pathname;

    // Regex to detect language prefix at the start of the URL
    const languagePrefixRegex = /^\/[a-z]{2}(\/|$)/;

    // Remove language prefix if it exists
    const baseURL = currentURL.match(languagePrefixRegex)
        ? currentURL.replace(languagePrefixRegex, "/")
        : currentURL;

    // Add or update language prefix in the URL
    const updatedURL = newLang === "cz" ? baseURL : `/${newLang}${baseURL}`;

    // Update URL without reloading the page
    window.history.pushState(null, "", updatedURL);
  };

  if (!languageData) {
    return null; // Do not render if language data is unavailable
  }

  return (
      <div className="language-switcher">
        <ul className="lang">
          {/* Current Language */}
          <li className="lang__button" onClick={toggleDropdown}>
            <img
                src={`/images/lang-flags/${language}-flag.png`}
                alt={language}
                width="16"
                height="11"
            />
            <span>
            {languageData.find((lang: Language) => lang.lang === language)?.prefix || "Language"}
          </span>
            <img
                className="arr"
                src="/wp-content/themes/praska/assets/img/arr.png"
                alt="arrow"
            />
          </li>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
              <ul id="menu-yazyki" className="sub__lang">
                {languageData
                    .filter((lang: Language) => lang.lang !== language) // Exclude current language
                    .map((lang: Language) => (
                        <li
                            className="lang-item"
                            key={lang.lang}
                            onClick={() => {
                              handleLanguageChange(lang.lang);
                              updateURLWithoutPrefix(lang.lang); // Update URL
                              setIsDropdownOpen(false); // Close dropdown
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