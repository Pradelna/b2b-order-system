import React, { useState, useEffect } from "react";
import axios from "../api/axios";

const MenuComponent = ({ menuData }) => {
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
            <li id="menu-item-31" className="menu-item menu-item-type-custom menu-item-object-custom menu-item-31"><a href="#about">{menuData.about_us}</a></li>
            <li id="menu-item-32" className="menu-item menu-item-type-custom menu-item-object-custom menu-item-32"><a href="#technology">{menuData.technology}</a></li>
            <li id="menu-item-33" className="menu-item menu-item-type-custom menu-item-object-custom menu-item-33"><a href="#price">{menuData.prices}</a></li>
            <li id="menu-item-34" className="menu-item menu-item-type-custom menu-item-object-custom menu-item-34"><a href="#services">{menuData.services}</a></li>
            {/* <li id="menu-item-37" className="menu-item menu-item-type-custom menu-item-object-custom menu-item-37"><a href="#arend">{menuData.linen_rent}</a></li> */}
            {/* <li id="menu-item-35" className="menu-item menu-item-type-custom menu-item-object-custom menu-item-35"><a href="#vakansii">{menuData.vacancies}</a></li> */}
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

export default MenuComponent;