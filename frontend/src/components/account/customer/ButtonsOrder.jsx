import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faCartPlus } from "@fortawesome/free-solid-svg-icons";

function ButtonsOrder({ language, languageData }) {

    

    return (
        <div className="col-3">
                    
        <div className="card dashboard-button mini new-order">
          <div className="card-body text-center">
            <p className="card-title"><FontAwesomeIcon icon={faCartPlus} className="icon" /></p>
            <p className="card-title">new order</p>
          </div>
        </div>
        
        <div className="card dashboard-button mini">
          <div className="card-body text-center">
          <p className="card-title"><FontAwesomeIcon icon={faBuilding} className="icon" /></p>
          <p className="card-title">new place</p>
          </div>
        </div>
        
      </div>
    );
}
  
export default ButtonsOrder;