import React, { useContext } from "react";
import { LanguageContext } from "@/context/LanguageContext";
import GdprEn from "./GdprEn";

const Gdpr: React.FC = () => {
    const { currentData } = useContext(LanguageContext);

    if (!currentData?.lang) {
        return null; // или Loader
    }

    switch (currentData.lang) {
        case "ru":
            return <GdprEn />;
        case "cz":
        case "cs":
            return <GdprEn />;
        case "en":
            return <GdprEn />;
        default:
            return <GdprEn />; // fallback на чешский
    }
};

export default Gdpr;