import React, { useContext, useState, useEffect } from "react";
import { LanguageContext } from "../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faUser,
  faMobileScreen,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import Loader from "@/components/Loader";

const HeaderAccount: React.FC = () => {
  const { currentData } = useContext(LanguageContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentData) {
      setLoading(false);
    }
  }, [currentData]);

  if (loading) {
    return <><Loader /></>;
  }

  if (!currentData || !currentData.menu) {
    return null; // Return null if data is missing
  }
  const menuData = currentData?.menu;

  if (!menuData) {
    return null; // If menuData is unavailable, return nothing
  }

  return (
      <header className="header">
        {/* Top Header */}
        <div className="header__top">
          <div className="container">
            <div className="header__top__wrap">
              {/* Language Switcher Component */}
              <LanguageSwitcher />

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
                <a href="/account" className="mail">
                  <FontAwesomeIcon icon={faUser} className="icon" />
                  <span>{menuData.header_account}</span>
                </a>
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
      </header>
  );
};

export default HeaderAccount;