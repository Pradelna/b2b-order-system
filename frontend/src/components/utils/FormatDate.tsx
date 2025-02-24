export const formatDate = (timestampInSeconds: number): string => {
    const date = new Date(timestampInSeconds * 1000); // Convert to milliseconds
    const day = date.getDate().toString().padStart(2, "0"); // Ensure 2-digit format
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
};