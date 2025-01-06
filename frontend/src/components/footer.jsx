import React from "react";

function Footer({ language, languageData }) {
    // Проверяем, есть ли данные и соответствуют ли они текущему языку
    if (!languageData || !Array.isArray(languageData)) {
      console.warn("languageData отсутствует или имеет неверный формат:", languageData);
      return null;
    }
  
    const currentData = languageData.find(item => item.lang === language);
  
    if (!currentData) {
      console.warn("Данные для текущего языка не найдены:", language);
      return null;
    }
  
    const { menu } = currentData;
  
    if (!menu) {
      console.warn("Меню отсутствует в данных:", currentData);
      return null;
    }
  
    return (
      <footer className="footer">
        <div className="container">
          <div className="footer__wrap">
            <a href="#" className="logo">
              <img src="/wp-content/themes/praska/assets/img/logo.png" alt="" />
            </a>
            <ul className="footer__list">
              <li>
                <a href="#about">{menu.technology}</a>
              </li>
              <li>
                <a href="#technology">{menu.technology}</a>
              </li>
              <li>
                <a href="#price">{menu.prices}</a>
              </li>
              <li>
                <a href="#services">{menu.services}</a>
              </li>
              <li>
                <a href="#contacts">{menu.contacts}</a>
              </li>
            </ul>
            <div className="contact">
              <a href="tel:+420734246834" className="tel">
                <img src="/wp-content/themes/praska/assets/img/tel.png" alt="" />
                <span>+420 734 246 834</span>
              </a>
              <a href="mailto:pradelna1cz@gmail.com" className="mail">
                <img src="/wp-content/themes/praska/assets/img/mail.png" alt="" />
                <span>pradelna1cz@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  }

export default Footer;