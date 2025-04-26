import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { faFileImage, faFileLines } from '@fortawesome/free-solid-svg-icons';
import { fetchWithAuth } from '@/components/account/auth';
import DarkTooltip from "../utils/DarkTooltip";

interface Photo {
    id: string;
    order_id: string;
    mime: string;
    file_id: string;
}

interface PhotoDownloadIconProps {
    photo: Photo;
    styleData?: string;
}

const FileDownloadIcon: React.FC<PhotoDownloadIconProps> = ({ photo, styleData }) => {
    // We extract an extension from MIME-type and bring it to the lower register
    const fileExtension = photo?.mime?.split('/')?.[1]?.toLowerCase() || '';
    const BASE_URL = import.meta.env.VITE_API_URL;

    if (!fileExtension) {
        console.error("Invalid MIME type for photo:", photo);
        return null;
    }

    // downloading report images
    const downloadFile = async (fileId: string) => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/order/photos/download/${fileId}/`);

            if (!response.ok) {
                throw new Error("Ошибка при скачивании файла");
            }

            // Получаем Blob из ответа
            const blob = await response.blob();

            // Извлекаем имя файла из заголовка Content-Disposition
            let fileName = `${fileId}.bin`; // значение по умолчанию
            const contentDisposition = response.headers.get("Content-Disposition");
            if (contentDisposition && contentDisposition.indexOf("filename=") !== -1) {
                const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (fileNameMatch && fileNameMatch[1]) {
                    fileName = fileNameMatch[1];
                }
            }

            // Создаем временный URL для Blob и инициируем скачивание
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error of downloading file:", error);
        }
    };

    if (!fileExtension) {
        return null;
    }

    return (
        <div
            className="image-icon"
            style={styleData}
        >
            {(fileExtension === "jpeg" || fileExtension === "jpg" || fileExtension === "png") && (
                <DarkTooltip title="Download report photo" placement="top" arrow>
                    <FontAwesomeIcon
                        icon={faFileImage}
                        style={{ cursor: "pointer" }}
                        onClick={(event) => {
                            event.stopPropagation();
                            downloadFile(photo.file_id);
                        }}
                    />
                </DarkTooltip>
            )}
            {fileExtension === "pdf" && (
                <DarkTooltip title="Download receipt" placement="top" arrow>
                    <FontAwesomeIcon
                        icon={faFileLines}
                        style={{ cursor: "pointer" }}
                        onClick={(event) => {
                            event.stopPropagation();
                            downloadFile(photo.file_id);
                        }}
                    />
                </DarkTooltip>
            )}
        </div>
    );
};

export default FileDownloadIcon;