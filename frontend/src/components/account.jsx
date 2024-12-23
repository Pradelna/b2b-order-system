import React,  { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClockRotateLeft, faLocationDot, faBuilding, faIdCard, faPhone, faEnvelope, faUserTie, faReceipt, faCartPlus
} from "@fortawesome/free-solid-svg-icons";



function Account({ language, languageData }) {
    const currentData = languageData.find(item => item.lang === language);
    const data = currentData['service'];
  if (!data) {
    return null; // Если данных нет, компонент ничего не отображает
  }

  const [cardStyle, setCardStyle] = useState({ display: "none" });
  const [cardContent, setCardContent] = useState("");
  const [activeButton, setActiveButton] = useState(null); // Состояние для активной кнопки

  const handleCardClick = (event, content, index) => {
    if (activeButton === index) {
      // Если та же кнопка нажата повторно, скрываем карточку и сбрасываем активное состояние
      setCardStyle({ display: "none" });
      setActiveButton(null);
      return;
    }

    // Получаем размеры кнопки и контейнера
    const buttonRect = event.target.closest(".place-card").getBoundingClientRect();
    const containerRect = document.querySelector(".col-history").getBoundingClientRect();

    const cardHeight = buttonRect.bottom - containerRect.top;

    setCardStyle({
      top: `0px`,
      height: `${cardHeight}px`,
      display: "block",
    });

    setCardContent(content);
    setActiveButton(index); // Устанавливаем текущую активную кнопку
  };

  const places = [
    { name: "Hotel Palace", address: "Sokolovska 15, 831 43" },
    { name: "Hotel Zamok", address: "Ulica 54, 831 43" },
    { name: "Hotel Spa Royal", address: "Prospekt 21, 831 43" },
  ];

  return (
        <div className="container margin-top-130 wrapper">
            <div className="row">
              <div className="col-8">
                <div id="company-top" className="row">
                  
                  <div className="col-6">
                      <div className="card company-card">
                      <h5 className="company-name">
                        <FontAwesomeIcon icon={faBuilding} className="icon" /> <span className="ms-1">Company Name</span>
                      </h5>
                      <p className="company-info">
                        <FontAwesomeIcon icon={faLocationDot} className="icon" /> <span className="ms-2">Prague, Ulica 6</span>
                      </p>
                      <p className="company-info">
                        <FontAwesomeIcon icon={faIdCard} className="icon" /> <span className="ms-1">ICO 44502693</span>
                      </p>
                      <p className="company-info">
                        <FontAwesomeIcon icon={faPhone} className="icon" /> <span className="ms-1">+420 944 764 873</span>
                      </p>
                      <p className="company-info">
                        <FontAwesomeIcon icon={faEnvelope} className="icon" /> <span className="ms-1">hotel@gmail.com</span>
                      </p>
                      <p className="company-info">
                        <FontAwesomeIcon icon={faUserTie} className="icon" /> <span className="ms-1">Petr Kucer</span>
                      </p>
                      </div>
                  </div>
                  
                  <div className="col-3">
                    <div className="card dashboard-button">
                      <div className="card-body button-history">
                      <FontAwesomeIcon icon={faClockRotateLeft} className="icon" />
                        <p className="text-history">All<br />history of<br />your orders</p>
                      </div>
                    </div>
                  </div>

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

                </div>
                
          
                <div className="row mt-5">

                  <div className="col-12">
                    <h4>Your places</h4>
                  </div>
                  
                  {places.map((place, index) => (
                  <div className="col-12" key={index}>
                    
                    <div
                      className={`card dashboard place-card ${
                        activeButton === index ? "active" : ""
                      }`}
                      onClick={(e) => handleCardClick(e, place.name, index)}
                     >
                      <div className="card-body place">
                        <img src="src/assets/dom.webp" alt="" />
                        <h5>{place.name}</h5>
                        <p className="card-text">{place.address}</p>
                        <button className="call dash-button">new order</button>
                      </div>
                    </div>
                    
                  </div>
                  ))}
                  

                </div>
                

              </div>
              
              {/* history */}
              <div className="col-4 col-history">
                
                    <div
                      id="card-history"
                      className={`card ${activeButton !== null ? "active" : ""}`}
                      style={cardStyle}
                    >
                      <div className="card-body card-history">
                      <FontAwesomeIcon icon={faClockRotateLeft} className="icon" />
                        <h5>Orders history for {cardContent}</h5>
                        <div className="history-list mt-4">
                          <p>16.12.2024 delivering</p>
                          <hr />
                          <p>10.12.2024 pick up</p>
                          <hr />
                          <p>04.12.2024 delivering</p>
                          <hr />
                          <p>26.11.2024 pick up</p>
                          </div>
                      </div>
                    </div>
                
              </div>
              {/* history end */}

            </div>

        </div>
  );
}

export default Account;