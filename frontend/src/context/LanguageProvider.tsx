import React, { useState, useEffect, ReactNode } from "react";
import { LanguageContext } from "./LanguageContext";

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguage] = useState<string>(localStorage.getItem("language") || "cz"); // Default language
    const [languageData, setLanguageData] = useState<any[] | null>(null); // Replace `any[]` with your specific type
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        // Fetch language data based on the current language
        const fetchLanguageData = async () => {
            try {
                const response = await fetch(`${BASE_URL}/landing/?lang=${language}`);
                const data = await response.json();
                setLanguageData(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching language data:", err);
                setError("Failed to load language data.");
                setLoading(false);
            }
        };

        fetchLanguageData();
    }, [language]);

    const handleLanguageChange = (lang: string) => {
        if (lang !== language) {
            setLanguage(lang);
            localStorage.setItem("language", lang); // Save the chosen language
        }
    };

    const currentData = languageData?.find((item) => item.lang === language) || null;

    console.log("API URL:", import.meta.env.VITE_API_URL);

    if (!loading && !currentData) {
        console.error("No data found for the current language.");
    }

    return (
        <LanguageContext.Provider
            value={{
                language,
                languageData,
                handleLanguageChange,
                currentData,
                loading,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};