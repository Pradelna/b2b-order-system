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
  faFileInvoiceDollar, faClockRotateLeft
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
                <Link to="/" className="mail">
                  <FontAwesomeIcon icon={faEarthAmerica} className="icon"/>
                  <span>Website</span>
                </Link>
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

              <div className="to-website">
                <Link to="/" className="mail">
                  <FontAwesomeIcon icon={faEarthAmerica} className="icon"/>
                  <span>Website</span>
                </Link>
              </div>

              <nav className="navbar-bottom">
                <Link to={`/customer/${customerId}`}>
                  <FontAwesomeIcon icon={faUser} className="icon"/>
                </Link>
                <Link to="/all-orders">
                  <FontAwesomeIcon icon={faClockRotateLeft} className="icon" />
                </Link>
                <Link to="/invoices">
                  <FontAwesomeIcon icon={faFileInvoiceDollar} className="icon" />
                </Link>
                <Link to="/account">
                  <FontAwesomeIcon icon={faHouse} className="icon" />
                </Link>
              </nav>
            </div>
          </div>
        </div>

      </header>
  );
};

export default HeaderAccount;