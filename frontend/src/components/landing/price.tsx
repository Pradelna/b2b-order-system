import { useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext.js";

interface PriceData {
    title: string;
    description: string;
    button_text: string;
}

interface CurrentData {
    price?: PriceData;
}

const Price: React.FC = () => {
    const { currentData } = useContext(LanguageContext) as { currentData: CurrentData | null };

    if (!currentData || !currentData.price) {
        return null; // Render nothing if data is not available
    }

    const data = currentData.price;

    return (
        <section id="price" className="banner">
            <div className="container">
                <div className="banner__wrap">
                    <h2>{data.title}</h2>
                    <p>{data.description}</p>
                    <a className="capitalize" href="#form">
                        {data.button_text}
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Price;