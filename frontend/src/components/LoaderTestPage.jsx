import React, { useState, useEffect } from "react";
import Loader from "./Loader.jsx"; // Убедитесь, что путь к Loader корректный

const LoaderTestPage = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Лоадер будет отображаться 10 секунд для теста
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 500000); // 10 секунд
    }, []);

    return (
        <div>
            {loading ? (
                <Loader />
            ) : (
                <p>Loader test completed! The loader was shown for 10 seconds.</p>
            )}
        </div>
    );
};

export default LoaderTestPage;