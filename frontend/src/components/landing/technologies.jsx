import React from "react";

function Technology({ language, techData }) {
    const currentData = techData.find(item => item.lang === language);
    const data = currentData['technologies'];
  if (!data) {
    return null; // Если данных нет, компонент ничего не отображает
  }

  return (
    <section id="technology" className="technology">
        <div className="container">
            <div className="technology__wrap">
                <h2>{data.title}</h2>
                  <p>{data.description}</p>
                <div className="technology__items">

                   <div className="technology__item">
                        <img src="/wp-content/uploads/2020/09/icon5.png" alt=""/>
                        <span  className="title" dangerouslySetInnerHTML={{ __html: data.sub_title_1 }} />
                        <p>{data.description_1}</p>
                    </div>


                   <div className="technology__item">
                        <img src="/wp-content/uploads/2020/09/icon6.png" alt=""/>
                        <span  className="title" dangerouslySetInnerHTML={{ __html: data.sub_title_2 }} />
                        <p>{data.description_2}</p>
                    </div>


                   <div className="technology__item">
                        <img src="/wp-content/uploads/2020/09/icon7.png" alt=""/>
                        <span  className="title" dangerouslySetInnerHTML={{ __html: data.sub_title_3 }} />
                        <p>{data.description_3}</p>
                    </div>

                   <div className="technology__item">
                        <img src="/wp-content/uploads/2020/09/icon8.png" alt=""/>
                        <span  className="title" dangerouslySetInnerHTML={{ __html: data.sub_title_4 }} />
                        <p>{data.description_4}</p>
                    </div>

                   <div className="technology__item">
                        <img src="/wp-content/uploads/2020/09/icon9.png" alt=""/>
                        <span  className="title" dangerouslySetInnerHTML={{ __html: data.sub_title_5 }} />
                        <p>{data.description_5}</p>
                    </div>

                   <div className="technology__item">
                        <img src="/wp-content/uploads/2020/09/icon10.png" alt=""/>
                        <span  className="title" dangerouslySetInnerHTML={{ __html: data.sub_title_6 }} />
                        <p>{data.description_6}</p>
                    </div>

                </div>
            </div>
        </div>
    </section>
  );
}

export default Technology;