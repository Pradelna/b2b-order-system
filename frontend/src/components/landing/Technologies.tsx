import { useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext.js";

interface TechnologyData {
    title: string;
    description: string;
    sub_title_1: string;
    description_1: string;
    sub_title_2: string;
    description_2: string;
    sub_title_3: string;
    description_3: string;
    sub_title_4: string;
    description_4: string;
    sub_title_5: string;
    description_5: string;
    sub_title_6: string;
    description_6: string;
}

interface CurrentData {
    technologies?: TechnologyData;
}

const Technology: React.FC = () => {
    const { currentData } = useContext(LanguageContext) as { currentData: CurrentData | null };

    if (!currentData || !currentData.technologies) {
        return null; // Render nothing if no data is available
    }

    const data = currentData.technologies;

    return (
        <section id="technology" className="technology">
            <div className="container">
                <div className="technology__wrap">
                    <h2>{data.title}</h2>
                    <p>{data.description}</p>
                    <div className="technology__items">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                            <div className="technology__item" key={num}>
                                <img
                                    src={`/wp-content/uploads/2020/09/icon${num + 4}.png`}
                                    alt=""
                                />
                                <span
                                    className="title"
                                    dangerouslySetInnerHTML={{
                                        __html: data[`sub_title_${num}` as keyof TechnologyData],
                                    }}
                                />
                                <p>{data[`description_${num}` as keyof TechnologyData]}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Technology;