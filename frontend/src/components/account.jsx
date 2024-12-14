import React from "react";

function Account({ language, languageData }) {
    const currentData = languageData.find(item => item.lang === language);
    const data = currentData['service'];
  if (!data) {
    return null; // Если данных нет, компонент ничего не отображает
  }

  return (
    <section id="services" className="services">
        <div className="container">
            <div className="services__wrap">

                <h2>{data.title}</h2>
                
             <div className="services__item">
                    <img src="/wp-content/uploads/2020/09/services1.png" alt=""/>
                    <div className="services__item__text">
                        <h3>{data.sub_title_1}</h3>
                        <div dangerouslySetInnerHTML={{ __html: data.description_1 }} />
                    </div>
                </div>

             <div className="services__item">
                    <img src="/wp-content/uploads/2020/09/services2.png" alt=""/>
                    <div className="services__item__text">
                      <h3>{data.sub_title_2}</h3>
                      <div dangerouslySetInnerHTML={{ __html: data.description_2 }} />
                    </div>
                </div>

             <div className="services__item">
                    <img src = "/wp-content/uploads/2020/09/services3.png" alt=""/>
                    <div className="services__item__text">
                      <h3>{data.sub_title_3}</h3>
                      <div dangerouslySetInnerHTML={{ __html: data.description_3 }} />
                    </div>
                </div>

             <div className="services__item">
                    <img src="/wp-content/uploads/2020/09/services4.png" alt=""/>
                    <div className="services__item__text">
                      <h3>{data.sub_title_4}</h3>
                      <div dangerouslySetInnerHTML={{ __html: data.description_4 }} />
                    </div>
                </div>

             <div className="services__item">
                    <img src="/wp-content/uploads/2020/09/services5.png" alt=""/>
                    <div className="services__item__text">
                      <h3>{data.sub_title_4}</h3>
                      <div dangerouslySetInnerHTML={{ __html: data.description_4 }} />
                    </div>
                </div>

            </div>
        </div>
    </section>
  );
}

export default Account;