import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faCartPlus } from "@fortawesome/free-solid-svg-icons";

function ButtonsOrder({ language, languageData, onCreatePlace }) {

    return (
        <div className="col-3">
                    
        {/* Кнопка New Order */}
        <div className="card dashboard-button mini new-order">
          <div className="card-body text-center">
            <p className="card-title"><FontAwesomeIcon icon={faCartPlus} className="icon" /></p>
            <p className="card-title">new order</p>
          </div>
        </div>
        
        {/* Кнопка New Place с добавленным обработчиком клика */}
        <div className="card dashboard-button mini" onClick={onCreatePlace} style={{ cursor: "pointer" }}>
          <div className="card-body text-center">
          <p className="card-title"><FontAwesomeIcon icon={faBuilding} className="icon" /></p>
          <p className="card-title">new place</p>
          </div>
        </div>
        
      </div>
    );
}
  
export default ButtonsOrder;