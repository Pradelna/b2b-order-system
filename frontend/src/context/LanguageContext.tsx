import { createContext } from "react";

// Define the structure of the context data
export interface LanguageContextType {
    language: string;
    languageData: any[] | null; // Replace `any[]` with your specific data type
    handleLanguageChange: (lang: string) => void;
    currentData: any | null; // Replace `any` with the specific type for the current data
    loading: boolean;
}

// Default values for the context
const defaultValues: LanguageContextType = {
    language: "cz",
    languageData: null,
    handleLanguageChange: () => {},
    currentData: null,
    loading: true,
};

// Create the context with default values
export const LanguageContext = createContext<LanguageContextType>(defaultValues);