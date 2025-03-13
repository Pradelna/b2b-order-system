import React, {useContext} from "react";
import {LanguageContext} from "../../context/LanguageContext";
import {Link} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

const NavButtons: React.FC = () => {
    const { currentData } = useContext(LanguageContext);
    if (!currentData){
        return <p>loading...</p>;
    }

    return (
        <Link to="/account" className="text-decoration-none">
            <p className="back-link">
                <FontAwesomeIcon icon={faChevronLeft} className="icon" />
                <span className="ms-2"><strong>{currentData?.buttons["back"] || "Zpět"}</strong></span>
            </p>

            {/*</div>*/}
        </Link>
    );
};

export default NavButtons;