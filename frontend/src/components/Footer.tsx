import React, { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faHouse, faUser, faMobileScreen, faEnvelope, faEarthAmerica} from "@fortawesome/free-solid-svg-icons";

interface MenuData {
  technology: string;
  prices: string;
  services: string;
  contacts: string;
}

const Footer: React.FC = () => {
  const { currentData } = useContext(LanguageContext);

  if (!currentData || !currentData.menu) {
    return null; // If data is not available, the component does not render
  }
  const menu: MenuData = currentData.menu;

  if (!menu) {
    console.log("Menu is missing in the data:", currentData);
    return null;
  }

  return (
      <footer className="footer">
        <div className="container">
          <div className="">
            <div className="row">
              <div className="col-lg-2 col-md-3 col-sm-6 logo-col">
                <a href="#" className="logo">
                  <img src="/wp-content/themes/praska/assets/img/logo.png" alt="Logo" />
                </a>
              </div>
              <div className="col-lg-7 col-md-5 col-sm-6 col-12">
                <ul className="footer__list">
                  <li>
                    <a href="#about">{menu.about_us}</a>
                  </li>
                  <li>
                    <a href="#technology">{menu.technology}</a>
                  </li>
                  <li>
                    <a href="#price">{menu.prices}</a>
                  </li>
                  <li>
                    <a href="#services">{menu.services}</a>
                  </li>
                  <li>
                    <a href="#contacts">{menu.contacts}</a>
                  </li>
                </ul>
              </div>
              <div className="col-lg-3 col-md-4 col-12">
                <div className="contact">
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



          </div>
        </div>
      </footer>
  );
};

export default Footer;