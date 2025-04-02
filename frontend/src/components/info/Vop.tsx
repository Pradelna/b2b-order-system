import React, { useContext } from "react";
import { LanguageContext } from "@/context/LanguageContext";
import VopRu from "./VopRu";
import VopCz from "./VopCz";
import VopEn from "./VopEn";

const Vop: React.FC = () => {
    const { currentData } = useContext(LanguageContext);

    if (!currentData?.lang) {
        return null; // или Loader
    }

    switch (currentData.lang) {
        case "ru":
            return <VopRu />;
        case "cz":
        case "cs":
            return <VopCz />;
        case "en":
            return <VopEn />;
        default:
            return <VopCz />; // fallback на чешский
    }
};

export default Vop;