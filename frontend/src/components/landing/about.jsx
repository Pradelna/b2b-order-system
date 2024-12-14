import React from "react";

function About({ language, bannerData }) {
    const currentData = bannerData.find(item => item.lang === language);
    const data = currentData['about_us'];
  if (!data) {
    return null; // Если данных нет, компонент ничего не отображает
  }

  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about__wrap">
          <div className="about__text">
            <h2>{ data.title }</h2>
            <p>
            { data.description }
            </p>

            <div className="about__items">
              <div className="about__item">
                <img src="/wp-content/uploads/2020/09/icon1-1.png" alt={ data.guarantee_quality } />
                <span dangerouslySetInnerHTML={{ __html: data.guarantee_quality }} />
              </div>
              <div className="about__item">
                <img src="/wp-content/uploads/2020/09/icon2-1.png" alt={ data.fast_service } />
                <span dangerouslySetInnerHTML={{ __html: data.fast_service }} />
              </div>
              <div className="about__item">
                <img src="/wp-content/uploads/2020/09/icon3-1.png" alt={ data.round_clock_service } />
                <span dangerouslySetInnerHTML={{ __html: data.round_clock_service }} />
              </div>
              <div className="about__item">
                <img src="/wp-content/uploads/2020/09/icon4-1.png" alt={ data.super_quality } />
                <span dangerouslySetInnerHTML={{ __html: data.super_quality }} />
              </div>
            </div>
          </div>
          <div className="about__video">
            <img className="bg" src="#" alt="Background Video" />
            <a href="#" className="popup">
              <img src="/wp-content/uploads/2020/09/video-bh-2.png" alt="Play Video" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;