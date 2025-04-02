import React, { useContext, useState, useEffect } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
// Импорт Link, если нужно, и другие зависимости

interface ContactsData {
    title: string;
    company_address: string;
    map_link: string;
    form_name: string;
    form_email: string;
    form_phone: string;
    form_message: string;
    button_text: string;
    agree_link: string;
    agree: string;
}

interface CurrentData {
    contacts?: ContactsData;
}

const Contacts: React.FC = () => {
    const { currentData } = useContext(LanguageContext) as { currentData: CurrentData | null };
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const BASE_URL = import.meta.env.VITE_API_URL; // например, "https://your-backend-domain/api"

    // Обработчик отправки формы
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Используем FormData, чтобы собрать данные из формы
        const formData = new FormData(e.currentTarget);
        // Преобразуем FormData в обычный объект
        const formObject = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${BASE_URL}/contacts/send-email/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formObject),
            });
            const text = await response.text();
            console.log("Response text:", text);
            // Попытайтесь распарсить JSON только если текст не пустой
            const resData = text ? JSON.parse(text) : {};
            if (response.ok) {
                {currentData?.lang === "cz" && (
                    setMessage("Email byl úspěšně odeslán!")
                )}
                {currentData?.lang === "en" && (
                    setMessage("Email sent successfully!")
                )}
                {currentData?.lang === "ru" && (
                    setMessage("Email отправлен успешно!")
                )}
            } else {
                setError("Error: " + (resData.error || JSON.stringify(resData)));
            }
        } catch (error) {
            console.error("Error send form:", error);
            alert("An unexpected error occurred.");
        }
    };

    // Эффект для очистки сообщений через 10 секунд
    useEffect(() => {
        if (message || error) {
            const timer = setTimeout(() => {
                setMessage(null);
                setError(null);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [message, error]);

    return (
        <>
            {currentData && currentData.contacts ? (
        <section id="contacts" className="contacts">
            <div className="container">
                <div className="contacts__wrap">
                    <h2>{currentData.contacts.title}</h2>
                    <div className="contacts__info">
                        <p className="contacts__text" dangerouslySetInnerHTML={{ __html: currentData.contacts.company_address }} />
                        <div className="map" dangerouslySetInnerHTML={{ __html: currentData.contacts.map_link }} />
                    </div>
                    {/* Форма отправки данных */}
                    <form id="form" onSubmit={handleSubmit} className="contacts__form">
                        {message && <div className="alert alert-success">{message}</div>}
                        {error && <div className="alert alert-danger">{error}</div>}
                        <input type="hidden" name="project_name" value="Website Pradelna contact form" />
                        <input type="hidden" name="admin_email" value="raketaweb.eu@gmail.com" />
                        <input type="hidden" name="form_subject" value="Nova sprava" />

                        <div className="contacts__form__top">
                            <div className="contacts__form__left">
                                <input
                                    type="text"
                                    className="name capitalize"
                                    name="name"
                                    placeholder={currentData.contacts.form_name}
                                    required
                                />
                                <input
                                    type="email"
                                    className="email capitalize"
                                    name="email"
                                    placeholder={currentData.contacts.form_email}
                                    required
                                />
                                <input
                                    type="text"
                                    className="phone capitalize"
                                    name="phone"
                                    placeholder={currentData.contacts.form_phone}
                                    required
                                />
                            </div>
                            <div className="contacts__form__right">
                <textarea
                    className="capitalize"
                    name="message"
                    placeholder={currentData.contacts.form_message}
                ></textarea>
                            </div>
                        </div>

                        <div className="row contact-form">
                            <div className="col-1">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" name="vop" required />
                                </div>
                            </div>
                            <div className="col-11">
                                <p>
                                    <a href={currentData.contacts.agree_link}>{currentData.contacts.agree}</a>
                                </p>
                            </div>
                        </div>
                        <button type="submit" className="capitalize">{currentData.contacts.button_text}</button>
                    </form>
                </div>
            </div>
        </section>
            ) : (
                null
            )}
        </>
    );
};

export default Contacts;