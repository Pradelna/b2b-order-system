import { useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext.js";

interface StartBannerData {
  title: string;
  description: string;
  button_request_call: string;
  button_two: string;
}

interface CurrentData {
  start_banner?: StartBannerData;
}

const StartBanner: React.FC = () => {
  const { currentData } = useContext(LanguageContext) as { currentData: CurrentData | null };

  if (!currentData || !currentData.start_banner) {
    return null; // Render nothing if no data is available
  }

  const data = currentData.start_banner;

  return (
      <section className="first__screen">
        <div className="container">
          <div className="first__screen__wrap">
            <div className="first__screen__text">
              {/* Logo */}
              <a href="#" className="logo">
                <img
                    src="/wp-content/themes/praska/assets/img/logo.png"
                    alt="Laundry Logo"
                />
              </a>
              {/* Title */}
              <h1 dangerouslySetInnerHTML={{ __html: data.title }} />
              {/* Description */}
              <p>{data.description}</p>
              {/* Buttons */}
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
};

export default StartBanner;