import React, {useContext} from "react";
import {LanguageContext} from "../../context/LanguageContext";
import {Link} from "react-router-dom";

const NavButtons: React.FC = () => {
    const { currentData } = useContext(LanguageContext);

    return (
        <div className="row">
            <div className="col-6">
                <Link to="/account" className="text-decoration-none">
                    <div className="card text-center">
                        <p className="text-button-nav">{currentData.service.invoices || "Back"}</p>
                    </div>
                </Link>
            </div>
            <div className="col-6">
                <Link to="/invoices" className="text-decoration-none">
                    <div className="card text-center">
                        <p className="text-button-nav">{currentData.service.invoices || "Invoices"}</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default NavButtons;