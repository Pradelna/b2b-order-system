import { useEffect } from 'react';

const Cookies: React.FC = () => {
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
                });
            }
        };
        document.body.appendChild(script);
    }, []);

    return (
        <>
            <noscript>
                Free cookie consent management tool by{' '}
                <a href="https://www.termsfeed.com/" rel="nofollow">
                    TermsFeed
                </a>
            </noscript>

            <div className="row text-center">
                <a href="#" id="open_preferences_center">
                    Update cookies preferences
                </a>
            </div>
        </>
    );
};

export default Cookies;