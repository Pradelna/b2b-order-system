import { useRef, useState, useEffect, useContext } from 'react';
import { LanguageContext } from "../../context/LanguageContext";
import { fetchWithAuth } from "../account/auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";

interface FileData {
    id: number;
    file: string;
}

interface UploadFileProps {
    onUploadSuccess?: () => void;
}

const UploadFile: React.FC<UploadFileProps> = ({ onUploadSuccess }) => {
    const { currentData } = useContext(LanguageContext);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [files, setFiles] = useState<FileData[]>([]); // List of uploaded files
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [isUploading, setIsUploading] = useState<boolean>(false); // State for upload animation

    useEffect(() => {
        fetchUploadedFiles();
    }, []);

    // Fetch the list of uploaded files
    const fetchUploadedFiles = async () => {
        try {
            const response = await fetchWithAuth('http://localhost:8000/api/customer/documents/');
            if (!response.ok) throw new Error('Failed to fetch files');
            const data: FileData[] = await response.json();
            setFiles(data);
        } catch (error) {
            console.error('Error loading files:', error);
            setError('Failed to load files');
        }
    };

    // Open file picker
    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    // Handle file selection and automatic upload
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            setError(currentData?.messages.file_size || 'File size exceeds 2MB');
            setSuccess('');
            return;
        }

        setIsUploading(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetchWithAuth('http://localhost:8000/api/customer/documents/upload/', {
                method: 'POST',
                body: formData,
            });

            const responseData = await response.json();
            if (response.status === 201) {
                setSuccess(currentData?.messages.file_ok || 'File uploaded successfully');
                setTimeout(() => setSuccess(''), 3000);
                setError('');
                onUploadSuccess?.();
                fetchUploadedFiles();
            } else {
                const errorMessage =
                    responseData.details?.file?.[0] ||
                    responseData.error ||
                    currentData?.messages.file_failed ||
                    'Failed to upload file';
                setError(errorMessage);
                setSuccess('');
            }
        } catch (error) {
            setError(currentData?.messages.file_try_again || 'An error occurred. Please try again.');
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    // Handle file deletion
    const handleDeleteFile = async (fileId: number) => {
        if (!fileId) {
            setError('Invalid file ID.');
            return;
        }

        if (!window.confirm(currentData?.messages.file_del_quest || 'Are you sure you want to delete this file?')) {
            return;
        }

        try {
            const response = await fetchWithAuth(`http://localhost:8000/api/customer/documents/${fileId}/delete/`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setSuccess(currentData?.messages.file_deleted || 'File deleted successfully');
                setTimeout(() => setSuccess(''), 3000);
                fetchUploadedFiles();
            } else {
                setError(currentData?.messages.file_failed_delete || 'Failed to delete the file');
            }
        } catch (error) {
            setError(currentData?.messages.file_failed_while_deleting || 'Error occurred while deleting the file');
        }
    };

    return (
        <div className="row other-card">
            {error && <p className="alert alert-danger mt-3">{error}</p>}
            {success && <p className="alert alert-success mt-3">{success}</p>}

            <div className="card">
                <div className="row">
                    <div className="col-3">
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <button className="btn-upload" onClick={handleButtonClick} disabled={isUploading}>
                            {isUploading
                                ? currentData?.buttons.uploading || 'Uploading...'
                                : currentData?.buttons.upload || 'Upload'}
                        </button>
                    </div>
                    <div className="col-4">
                        {isUploading && (
                            <div className="spinner" style={{ margin: '10px auto' }} />
                        )}
                    </div>
                </div>

                <h3 style={{ fontSize: '20px' }} className="mt-3">
                    {currentData?.customer.uploaded_files || 'Uploaded Files'}
                </h3>
                <div style={{ margin: '0 1px' }} className="row">
                    {files.map((file, index) => (
                        <div className="col-12 form-control mb-2" style={{ display: 'flex' }} key={index}>
                            <a href={`http://localhost:8000${file.file}`} target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faFilePdf} className="file-uploaded" />
                                <span style={{ marginLeft: '5px' }}>{file.file.split('/').pop()}</span>
                            </a>
                            <button
                                onClick={() => handleDeleteFile(file.id)}
                                style={{ marginLeft: 'auto', fontSize: '10px', color: 'red' }}
                            >
                                ❌
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UploadFile;