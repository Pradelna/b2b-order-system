import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App";
import { LanguageProvider } from "./context/LanguageProvider";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Failed to find the root element.");
}

createRoot(rootElement).render(
    <StrictMode>
        <HelmetProvider>
            <LanguageProvider>
                <App />
            </LanguageProvider>
        </HelmetProvider>
    </StrictMode>
);