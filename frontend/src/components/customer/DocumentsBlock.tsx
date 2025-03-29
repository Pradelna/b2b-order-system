import { useRef, useState, useEffect, useContext } from 'react';
import { LanguageContext } from "../../context/LanguageContext.js";
import { fetchWithAuth } from "../account/auth.ts";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";

interface FileData {
    file: string;
}

const DocumentsBlock: React.FC = () => {
    const { currentData } = useContext(LanguageContext);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [files, setFiles] = useState<FileData[]>([]); // List of uploaded files
    const BASE_URL = import.meta.env.VITE_API_URL;

    // Fetch the list of uploaded files
    const fetchUploadedFiles = async () => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/customer/documents/`);
            if (!response.ok) throw new Error('Failed to fetch files');
            const data: FileData[] = await response.json();
            setFiles(data);
            // console.log(files);
        } catch (error) {
            console.error('Error loading files:', error);
        }
    };

    const downloadFile = async (filename: string) => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/customer/documents/download/${filename}/`, {
                method: "GET"
            });

            if (!response.ok) throw new Error("Failed to download file");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download error:", error);
        }
    };

    const cleanFileName = (fullPath: string): string => {
        return fullPath.split('/').pop()?.split('?')[0] || 'document.pdf';
    };

    useEffect(() => {
        fetchUploadedFiles();
    }, []);

    if (!currentData) {
        return <div>language data not faunded</div>; // Render nothing if currentData is unavailable
    }

    return (
        <div id="document-block">
            <div className="row other-card">
                <div className="card">
                    <h3 style={{ fontSize: "20px" }}>
                        {currentData.customer.important_files}
                    </h3>

                    {/* Display uploaded files */}
                    <div style={{ margin: "0 1px" }} className="row">
                        {files.map((file, index) => {
                            const fileName = cleanFileName(file.file);
                            return (
                                <div
                                    key={index}
                                    className="col-12 form-control mb-2"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => downloadFile(fileName)}
                                >
                                    <FontAwesomeIcon icon={faFilePdf} className="file-uploaded" />
                                    <span style={{ marginLeft: "5px" }}>{fileName}</span>
                                </div>
                            );
                        }
                            )}
                    </div>

                    {/* Static links for important documents */}
                    <div className="row mb-2">
                        <div className="col-12">
                            <div className="form-control">
                                <a href="#" target="_blank" rel="noopener noreferrer">
                                    <FontAwesomeIcon icon={faFilePdf} className="file-uploaded" />
                                    <span style={{ marginLeft: "5px" }}>{currentData.customer.vop}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-2">
                        <div className="col-12">
                            <div className="form-control">
                                <a href="#" target="_blank" rel="noopener noreferrer">
                                    <FontAwesomeIcon icon={faFilePdf} className="file-uploaded" />
                                    <span style={{ marginLeft: "5px" }}>{currentData.customer.terms_use}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <div className="form-control">
                                <a href="#" target="_blank" rel="noopener noreferrer">
                                    <FontAwesomeIcon icon={faFilePdf} className="file-uploaded mr-3" />
                                    <span style={{ marginLeft: "5px" }}>{currentData.customer.gdpr}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentsBlock;