import React, { useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext.jsx";

function StartBanner() {
  const { currentData } = useContext(LanguageContext);

  if (!currentData || !currentData.start_banner) {
    return null; // Если данных нет, компонент ничего не отображает
  }
  const data = currentData.start_banner;

  return (
    <section className="first__screen">
      <div className="container">
        <div className="first__screen__wrap">
          <div className="first__screen__text">
            {/* Логотип */}
            <a href="#" className="logo">
              <img
                src="/assets/img/logo.png" // Убедитесь, что путь к логотипу корректный
                alt="Laundry Logo"
              />
            </a>
            {/* Заголовок */}
            <h1 dangerouslySetInnerHTML={{ __html: data.title }} />
            {/* Описание */}
            <p>{data.description}</p>
            {/* Кнопки */}
            <div className="first__screen__buttons">
              <a href="#form" className="what">
                {data.button_request_call}
              </a>
              <a href="#form" className="go">
                {data.button_two}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StartBanner;