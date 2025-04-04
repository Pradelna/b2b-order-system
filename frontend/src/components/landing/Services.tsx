import { useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext.js";

interface ServiceData {
    title: string;
    sub_title_1: string;
    description_1: string;
    sub_title_2: string;
    description_2: string;
    sub_title_3: string;
    description_3: string;
    sub_title_4: string;
    description_4: string;
}

interface CurrentData {
    service?: ServiceData;
}

const Services: React.FC = () => {
    const { currentData } = useContext(LanguageContext) as { currentData: CurrentData | null };

    if (!currentData || !currentData.service) {
        return null; // Render nothing if service data is unavailable
    }

    const data = currentData.service;

    return (
        <section id="services" className="services">
            <div className="container">
                <div className="services__wrap">
                    <h2>{data.title}</h2>

                    <div className="services__item">
                        <img src="/wp-content/uploads/2020/09/services1.png" alt="Service 1" />
                        <div className="services__item__text">
                            <h3>{data.sub_title_1}</h3>
                            <div dangerouslySetInnerHTML={{ __html: data.description_1 }} />
                        </div>
                    </div>

                    <div className="services__item">
                        <img src="/wp-content/uploads/2020/09/services2.png" alt="Service 2" />
                        <div className="services__item__text">
                            <h3>{data.sub_title_2}</h3>
                            <div dangerouslySetInnerHTML={{ __html: data.description_2 }} />
                        </div>
                    </div>

                    <div className="services__item">
                        <img src="/wp-content/uploads/2020/09/services3.png" alt="Service 3" />
                        <div className="services__item__text">
                            <h3>{data.sub_title_3}</h3>
                            <div dangerouslySetInnerHTML={{ __html: data.description_3 }} />
                        </div>
                    </div>

                    <div className="services__item">
                        <img src="/wp-content/uploads/2020/09/services4.png" alt="Service 4" />
                        <div className="services__item__text">
                            <h3>{data.sub_title_4}</h3>
                            <div dangerouslySetInnerHTML={{ __html: data.description_4 }} />
                        </div>
                    </div>

                    <div className="services__item">
                        <img src="/wp-content/uploads/2020/09/services5.png" alt="Service 5" />
                        <div className="services__item__text">
                            <h3>{data.sub_title_5}</h3>
                            <div dangerouslySetInnerHTML={{ __html: data.description_5 }} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services;