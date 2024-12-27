import React from "react";

function Footer({ language, footerData }) {
    if (!footerData) {
        return null; // Возвращаем пустой компонент, если данных нет
      }
    const currentData = footerData.find(item => item.lang === language);
    if (!currentData || !currentData.footer) {
        return null; // Если данных нет, компонент ничего не отображает
    }
    const menuData = currentData.menu;
    if (!currentData || !currentData.menu) {
        return null; // Если данных нет, компонент ничего не отображает
    }
    const data = currentData.menu;

  return (
    <footer className="footer">
        <div className="container">
            <div className="footer__wrap">
                <a href="#" className="logo"><img src="/wp-content/themes/praska/assets/img/logo.png" alt="" /></a>
                <ul id="menu-menyu-en-1" className="footer__list"><li className="menu-item menu-item-type-custom menu-item-object-custom menu-item-31"><a href="#about">{menuData.technology}</a></li>
                      <li className="menu-item menu-item-type-custom menu-item-object-custom menu-item-32"><a href="#technology">{menuData.technology}</a></li>
                    <li className="menu-item menu-item-type-custom menu-item-object-custom menu-item-33"><a href="#price">{menuData.prices}</a></li>
                    <li className="menu-item menu-item-type-custom menu-item-object-custom menu-item-34"><a href="#services">{menuData.services}</a></li>
                    {/* <li className="menu-item menu-item-type-custom menu-item-object-custom menu-item-34"><a href="#arend">{menuData.linen_rent}</a></li>
                    <li className="menu-item menu-item-type-custom menu-item-object-custom menu-item-35"><a href="#vakansii">{menuData.vacancies}</a></li> */}
                    <li className="menu-item menu-item-type-custom menu-item-object-custom menu-item-36"><a href="#contacts">{menuData.contacts}</a></li>
                </ul>                <div className="contact">
                    <a href="tel:+420 734 246 834" className="tel"><img src="/wp-content/themes/praska/assets/img/tel.png" alt="" /><span>+420 734 246 834</span></a>
                    <a href="mailto:pradelna1cz@gmail.com" className="mail"><img src="/wp-content/themes/praska/assets/img/mail.png" alt="" /><span>pradelna1cz@gmail.com</span></a>
                </div>
            </div>
        </div>
    </footer>
  );
}

export default Footer;