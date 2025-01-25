import React, { useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext.jsx";

function Price() {
    const { currentData } = useContext(LanguageContext);
    if (!currentData || !currentData.price) {
        return null; // Если данных нет, компонент ничего не отображает
    }
    // console.log(`Price currentData - ${currentData}`);
    // console.log(currentData);
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