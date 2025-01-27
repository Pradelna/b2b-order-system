import { useState } from "react";

interface MenuData {
    about_us: string;
    technology: string;
    prices: string;
    services: string;
    contacts: string;
    button_request_call: string;
}

interface MenuComponentProps {
    menuData: MenuData;
}

const MenuComponent: React.FC<MenuComponentProps> = ({ menuData }) => {
    const [error, setError] = useState<string | null>(null);

    return (
        <div>
            {/* Display error if present */}
            {error && <p className="error">{error}</p>}

            {/* Navigation Content */}
            <div className="header__nav">
                <div className="container">
                    <div className="header__nav__wrap">
                        {/* Logo */}
                        <a href="#" className="logo">
                            <img
                                src="/wp-content/themes/praska/assets/img/logo.png"
                                alt="Logo"
                            />
                        </a>

                        {/* Menu Items */}
                        <ul id="menu-menyu-en" className="header__list">
                            <li className="menu-item">
                                <a href="#about">{menuData.about_us}</a>
                            </li>
                            <li className="menu-item">
                                <a href="#technology">{menuData.technology}</a>
                            </li>
                            <li className="menu-item">
                                <a href="#price">{menuData.prices}</a>
                            </li>
                            <li className="menu-item">
                                <a href="#services">{menuData.services}</a>
                            </li>
                            <li className="menu-item">
                                <a href="#contacts">{menuData.contacts}</a>
                            </li>
                        </ul>

                        {/* Call-to-action Button */}
                        <a className="call capitalize" href="#form">
                            {menuData.button_request_call}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuComponent;