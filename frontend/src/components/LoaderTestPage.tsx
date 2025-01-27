import { useState, useEffect } from "react";
import Loader from "./Loader"; // Ensure the path to Loader is correct

const LoaderTestPage: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Display the loader for 10 seconds for testing
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 10000); // 10 seconds

        // Cleanup the timer on component unmount
        return () => clearTimeout(timer);
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