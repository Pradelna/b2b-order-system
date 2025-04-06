import React, {useContext, useEffect} from 'react';
import { LanguageContext } from "../context/LanguageContext";
import {Link} from "react-router-dom";

const Cookies: React.FC = () => {
    const { currentData } = useContext(LanguageContext);
    const lang = currentData?.lang || "cz";
    const cookies = {
        cz: "Aktualizujte předvolby cookies",
        ru: "Обновите настройки файлов cookie",
        en: "Update cookies preferences",
    };
    const labelCookies = cookies[lang] || cookies.en;

    const gdpr = {
        cz: "Zásady ochrany osobných údajov",
        ru: "Политика конфиденциальности",
        en: "Privacy Policy",
    };
    const labelGdpr = gdpr[lang] || gdpr.en;

    useEffect(() => {
        const script = document.createElement('script');
        script.src = '//www.termsfeed.com/public/cookie-consent/4.2.0/cookie-consent.js';
        script.type = 'text/javascript';
        script.async = true;
        script.charset = 'UTF-8';
        script.onload = () => {
            // @ts-ignore
            if (window.cookieconsent) {
                // @ts-ignore
                window.cookieconsent.run({
                    notice_banner_type: 'simple',
                    consent_type: 'express',
                    palette: 'light',
                    language: 'cs',
                    page_load_consent_levels: ['strictly-necessary'],
                    notice_banner_reject_button_hide: false,
                    preferences_center_close_button_hide: false,
                    page_refresh_confirmation_buttons: false,
                    website_privacy_policy_url:"/info/gdpr",
                });
            }
        };
        document.body.appendChild(script);
    }, []);

    return (
        <div className="cookies">
            <div className="row text-center">
                <a href="#" id="open_preferences_center">
                    {labelCookies || "Aktualizujte předvolby cookies"}
                </a>
            </div>
            <div className="row text-center">
                <Link to="/info/gdpr">
                    {labelGdpr || "Zásady ochrany osobných údajov"}
                </Link>
            </div>
        </div>
    );
};

export default Cookies;