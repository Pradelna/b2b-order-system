import React, { useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext.jsx";

function Contacts() {
    const { currentData } = useContext(LanguageContext);
    if (!currentData || !currentData.contacts) {
        return null; // Если данных нет, компонент ничего не отображает
    }
    const data = currentData.contacts;

    return (
        <section id="contacts" className="contacts">
            <div className="container">
                <div className="contacts__wrap">
                    <h2>{data.title}</h2>
                    <div className="contacts__info">
                    <p  className="contacts__text" dangerouslySetInnerHTML={{ __html: data.company_address }} />

                        <div  className="map" dangerouslySetInnerHTML={{ __html: data.map_link }} />

                    </div>
                    <form
                        id="form"
                        method="POST"
                        action="#"
                        className="contacts__form"
                    >
                        <input type="hidden" name="project_name" value="Pradelna" />
                        <input type="hidden" name="admin_email" value="info@pradelna1.cz" />
                        <input type="hidden" name="form_subject" value="Новая заявка" />
                        <div className="contacts__form__top">
                            <div className="contacts__form__left">
                                <input type="text" className="name capitalize" name="name" placeholder={data.form_name} required />
                                <input type="text" className="email capitalize" name="email" placeholder={data.form_email} required />
                                <input type="text" className="phone capitalize" name="phone" placeholder={data.form_phone} required />
                            </div>
                            <div className="contacts__form__right">
                                <textarea className=" capitalize" name="message" placeholder={data.form_message}></textarea>
                            </div>
                        </div>
                        <button className=" capitalize">{data.button_text}</button>
                        <p><a href={data.agree_link}>{data.agree}</a></p>
                        
                    </form>
                </div>
            </div>
        </section>
    );
}

export default Contacts;