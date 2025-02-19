import React, {useContext, useState, useEffect} from "react";
import {LanguageContext} from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faUser,
  faMobileScreen,
  faEnvelope,
  faEarthAmerica,
  faFileInvoiceDollar
} from "@fortawesome/free-solid-svg-icons";
import Loader from "@/components/Loader";
import {Link} from "react-router-dom";

interface HeaderAccountProps {
  customerId?: CustomerId | null
}

const HeaderAccount: React.FC = ({customerId}) => {
  const {currentData} = useContext(LanguageContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentData) {
      setLoading(false);
    }
  }, [currentData]);

  // Если данные еще не загружены или отсутствует customerId, отображаем "Loading..." или пустой элемент
  if (loading || !currentData || !currentData.menu || !customerId) {
    return <div>Loading...</div>;
  }

  const menuData = currentData?.menu;

  return (
      <header className="header">
        {/* Top Header */}
        <div className="header__top">
          <div className="container">
            <div className="header__top__wrap">
              {/* Language Switcher Component */}
              <LanguageSwitcher/>

              {/* Contact Information */}
              <div className="contact">
                <a href="/" className="mail">
                  <FontAwesomeIcon icon={faEarthAmerica} className="icon"/>
                  <span>website</span>
                </a>
                <a href="/account" className="mail">
                  <FontAwesomeIcon icon={faHouse} className="icon"/>
                  <span>{menuData.header_dashboard || "Panel"}</span>
                </a>
                <Link to="/invoices">
                  <div className="mail">
                    <FontAwesomeIcon icon={faFileInvoiceDollar} className="icon"/>
                    <span>Invoces</span>
                  </div>
                </Link>

                <Link to={`/customer/${customerId}`}>
                  <div className="mail">
                    <FontAwesomeIcon icon={faUser} className="icon"/>
                    <span>{menuData.header_account}</span>
                  </div>
                </Link>
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
                <FontAwesomeIcon icon={faMobileScreen} className="icon"/>
                <span>+420 734 246 834</span>
              </a>
              <a href="mailto:pradelna1cz@gmail.com" className="mail">
                <FontAwesomeIcon icon={faEnvelope} className="icon"/>
                <span>pradelna1cz@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </header>
  );
};

export default HeaderAccount;