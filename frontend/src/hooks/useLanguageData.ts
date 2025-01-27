import { useState, useEffect } from "react";
import axios from "../api/axios";

// Define the type for the hook's return value
interface UseLanguageDataResult<T> {
  language: string;
  data: T | null;
  error: string | null;
  handleLanguageChange: (lang: string) => void;
}

/**
 * Custom hook to fetch and manage language-specific data.
 *
 * @param apiEndpoint The API endpoint for fetching language data.
 * @param defaultLanguage The default language (default is "cz").
 * @returns Object containing language, data, error, and a function to change language.
 */
function useLanguageData<T>(apiEndpoint: string, defaultLanguage: string = "cz"): UseLanguageDataResult<T> {
  const [language, setLanguage] = useState<string>(() => {
    // Retrieve the language from local storage or use the default
    return localStorage.getItem("language") || defaultLanguage;
  });

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Function to change the current language.
   * @param lang The new language to set.
   */
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("language", lang); // Cache the selected language
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null); // Reset the error before fetching

        // Check if cached data exists for the current language
        const cacheKey = `${apiEndpoint}_${language}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
          setData(JSON.parse(cachedData) as T); // Use cached data
        } else {
          const response = await axios.get<T>(`${apiEndpoint}?lang=${language}`);
          setData(response.data);
          localStorage.setItem(cacheKey, JSON.stringify(response.data)); // Cache the fetched data
        }
      } catch (err) {
        console.error("Error fetching language data:", err);
        setError("Failed to load language data.");
      }
    };

    fetchData();
  }, [language, apiEndpoint]);

  return { language, data, error, handleLanguageChange };
}

export default useLanguageData;