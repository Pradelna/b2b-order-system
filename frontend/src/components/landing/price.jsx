import React from "react";

function Price({ language, priceData }) {
    const currentData = priceData.find(item => item.lang === language);
    if (!currentData || !currentData.price) {
        return null; // Если данных нет, компонент ничего не отображает
    }
    const data = currentData.price;

  return (
    <section id="price" className="banner">
        <div className="container">
            <div className="banner__wrap">
                <h2>{data.title}</h2>
                <p>{data.description}</p>
                <a className="capitalize" href="#form">{data.button_text}</a>
            </div>
        </div>
    </section>
  );
}

export default Price;