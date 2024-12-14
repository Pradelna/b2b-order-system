import React, { useState, useEffect } from "react";
import axios from "../api/axios";

const AccountMenuComponent = ({ menuData }) => {
  const [error, setError] = useState(null);

  return (
    <div>
      {/* Отображение ошибки */}
      {error && <p className="error">{error}</p>}

      {/* Отображение контента */}
        <div>
          {/* Навигационная часть */}
      <div className="header__nav">
        <div className="container">
          <div className="header__nav__wrap">
            {/* Логотип */}
            <a href="#" className="logo">
              <img src="/wp-content/themes/praska/assets/img/logo.png"
                alt="Логотип"
              />
            </a>
          <ul id="menu-menyu-en" className="header__list">
            <li id="menu-item-31" className="menu-item menu-item-type-custom menu-item-object-custom menu-item-31"><a href="#about">Nova objednavka</a></li>
            <li id="menu-item-32" className="menu-item menu-item-type-custom menu-item-object-custom menu-item-32"><a href="#technology">Historie objednavek</a></li>
            <li id="menu-item-36" className="menu-item menu-item-type-custom menu-item-object-custom menu-item-36"><a href="#contacts">{menuData.contacts}</a></li>
          </ul>
                <a className="call capitalize" href="#form">{menuData.button_request_call}</a>
                </div>
        </div>
      </div>
        </div>
    </div>
  );
};

export default AccountMenuComponent;