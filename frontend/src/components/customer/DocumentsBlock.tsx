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
            console.log(files);
        } catch (error) {
            console.error('Error loading files:', error);
        }
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
                        {files.map((file, index) => (
                            <div className="col-12 form-control mb-2" style={{ display: 'flex' }} key={index}>
                                <a href={`http://localhost:8000${file.file}`} target="_blank" rel="noopener noreferrer">
                                    <FontAwesomeIcon icon={faFilePdf} className="file-uploaded" />
                                    <span style={{ marginLeft: "5px" }}>{file.file.split('/').pop()}</span>
                                </a>
                            </div>
                        ))}
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