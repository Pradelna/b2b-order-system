import { useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext.jsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";

function ButtonAllHistory() {
    const { currentData } = useContext(LanguageContext);

    

    return (
            <div className="col-3">
            <div className="card dashboard-button">
                <div className="card-body button-history">
                <FontAwesomeIcon icon={faClockRotateLeft} className="icon" />
                <p className="text-history">All<br />history of<br />your orders</p>
                </div>
            </div>
            </div>
    );
}
  
export default ButtonAllHistory;