const BASE_URL = import.meta.env.VITE_API_URL;

// Utility function to refresh the token
export const refreshToken = async (): Promise<string | null> => {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) {
        console.error("No refresh token available");
        return null;
    }

    try {
        const response = await fetch(`${BASE_URL}/token/refresh/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh }),
        });

        if (!response.ok) {
            console.error("Failed to refresh token:", response.status);
            return null;
        }

        const data = await response.json();
        localStorage.setItem("accessToken", data.access); // Update access token
        return data.access;
    } catch (error) {
        console.error("Error refreshing token:", error);
        return null;
    }
};

// Type for request options
interface FetchOptions extends RequestInit {
    headers?: HeadersInit;
}

// Enhanced fetch function with token handling
export const fetchWithAuth = async (url: string, options: FetchOptions = {}): Promise<Response> => {
    let accessToken = localStorage.getItem("accessToken");

    // Check if the request body is FormData
    const isFormData = options.body instanceof FormData;

    // Определяем метод (по умолчанию GET)
    const method = (options.method || "GET").toUpperCase();
    // Prepare headers
    const headers: HeadersInit = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
    };

    // Add Content-Type header if the body is not FormData
    if (!isFormData && !headers["Content-Type"] && !["GET", "HEAD"].includes(method)) {
        headers["Content-Type"] = "application/json";
    }

    try {
        // Perform the initial request
        let response = await fetch(url, {
            ...options,
            method,
            headers,
        });

        // If token is expired or invalid, try refreshing the token
        if (response.status === 401) {
            const newToken = await refreshToken();
            if (newToken) {
                accessToken = newToken;

                // Retry the request with the new token
                const retryHeaders: HeadersInit = {
                    ...options.headers,
                    Authorization: `Bearer ${newToken}`,
                };

                if (!isFormData && !headers["Content-Type"] && !["GET", "HEAD"].includes(method)) {
                    headers["Content-Type"] = "application/json";
                }

                response = await fetch(url, {
                    ...options,
                    method,
                    headers: retryHeaders,
                });
            }
        }

        return response;
    } catch (error) {
        console.error("Error in fetchWithAuth:", error);
        throw error;
    }
};