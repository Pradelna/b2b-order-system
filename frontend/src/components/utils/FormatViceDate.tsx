export function formatViceDate(dateString: string): string {
    const date = new Date(dateString);

    // Получаем компоненты даты
    const day = String(date.getDate()).padStart(2, "0"); // День с ведущим 0
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Месяцы в JS начинаются с 0
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}