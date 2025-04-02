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

const FooterAccount: React.FC = () => {
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
        <footer id="footer-account" className="footer">
            <div className="container">
                <div className="">
                    <div className="row">
                        <div className="col-lg-2 col-md-3 col-sm-6 logo-col">
                            <a href="#" className="logo">
                                <img src="/wp-content/themes/praska/assets/img/logo.png" alt="Logo" />
                            </a>
                        </div>
                        <div className="col-lg-7 col-md-5 col-sm-6 col-12">

                        </div>
                        <div className="col-lg-3 col-md-4 col-12">
                            <div className="contact">
                                <h6>Support:</h6>
                                <a href="tel:+420736164797" className="tel">
                                    <FontAwesomeIcon icon={faMobileScreen} className="icon" />
                                    <span>+420 736 164 797</span>
                                </a>
                                <a href="mailto:office@pradelna1.com" className="mail">
                                    <FontAwesomeIcon icon={faEnvelope} className="icon" />
                                    <span>office@pradelna1.com</span>
                                </a>
                            </div>
                        </div>
                    </div>



                </div>
            </div>
        </footer>
    );
};

export default FooterAccount;