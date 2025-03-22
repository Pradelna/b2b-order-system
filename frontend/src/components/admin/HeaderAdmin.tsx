import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faDashboard,
    faHouse,
    faUser,
    faEarthAmerica,
    faFileInvoiceDollar, faClockRotateLeft
} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";

const HeaderAdmin: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    return (
        <header className="header">
            {/* Top Header */}
            <div className="header__top">
                <div className="container">
                    <div className="header__top__wrap">



                        {/* Contact Information */}
                        <div className="contact">
                            {location.pathname === "admin/dashboard/" ? (
                                <>
                                    <FontAwesomeIcon icon={faDashboard} className="icon"/>
                                    <span>Dashboard</span>
                                </>
                            ) : (
                                <Link to="/admin/dashboard/" className="mail">
                                    <FontAwesomeIcon icon={faDashboard} className="icon"/>
                                    <span>Dashboard</span>
                                </Link>
                            )}

                            <a href="/" className="mail">
                                <FontAwesomeIcon icon={faHouse} className="icon"/>
                                <span>Webstranka</span>
                            </a>
                        </div>

                        <div className="to-website">
                            <Link to="/" className="mail">
                                <FontAwesomeIcon icon={faEarthAmerica} className="icon"/>
                                <span>Web stránka</span>
                            </Link>
                        </div>

                        <nav className="navbar-bottom">
                            <Link to={`/customer`}>
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

export default HeaderAdmin;