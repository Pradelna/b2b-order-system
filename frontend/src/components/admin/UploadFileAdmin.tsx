import React, { useRef, useState, useEffect, useContext } from 'react';
import { fetchWithAuth } from "../account/auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faFilePdf, faSpinner} from "@fortawesome/free-solid-svg-icons";
import {Skeleton} from "@mui/material";

interface FileData {
    id: number;
    file: string;
}

interface UploadFileAdminProps {
    onUploadSuccess?: () => void;
    customer_id : number;
}

const UploadFileAdmin: React.FC<UploadFileAdminProps> = ({ onUploadSuccess, customer_id }) => {
    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
    const [files, setFiles] = useState<FileData[]>([]); // List of uploaded files
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [isUploading, setIsUploading] = useState<boolean>(false); // State for upload animation
    const BASE_URL = import.meta.env.VITE_API_URL;
    const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;
    const [loading, setLoading] = useState<boolean>(true);
    const [forceWait, setForceWait] = useState<boolean>(true);

    // Fetch the list of uploaded files
    const fetchUploadedFiles = async () => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/admin/adminpanel/customer/documents/list/${customer_id}/`);
            if (!response.ok) throw new Error('Failed to fetch files');
            const data: FileData[] = await response.json();
            setFiles(data);
        } catch (error) {
            console.error('Error loading files:', error);
            setError('Failed to load files');
        }
        setLoading(false);
    };

    // Open file picker
    const handleButtonClick = (id: number) => {
        fileInputRefs.current[id]?.click();
    };

    // Handle file selection and automatic upload
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            setError("Velikost souboru přesahuje 2 MB");
            setSuccess('');
            return;
        }

        setIsUploading(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('customer', customer_id.toString());

        let responseData: any;
        try {
            const response = await fetchWithAuth(`${BASE_URL}/admin/adminpanel/customer/documents/${customer_id}/`, {
                method: 'POST',
                body: formData,
            });
            responseData = await response.json();
            if (response.status === 201) {
                setSuccess('Soubor byl úspěšně nahrán.');
                setTimeout(() => setSuccess(''), 3000);
                setError('');
                onUploadSuccess?.();
                fetchUploadedFiles();
            } else {
                const errorMessage =
                    responseData.details?.file?.[0] ||
                    responseData.error ||
                    'Failed to upload file';
                setError(errorMessage);
                setSuccess('');
            }
        } catch (error) {
            setError('Došlo k chybě. Zkuste to prosím znovu.');
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

        if (!window.confirm('Are you sure you want to delete this file?')) {
            return;
        }

        try {
            const response = await fetchWithAuth(`${BASE_URL}/admin/adminpanel/customer/documents/${fileId}/delete/${customer_id}/`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setSuccess('File deleted successfully');
                setTimeout(() => setSuccess(''), 3000);
                fetchUploadedFiles();
            } else {
                setError('Failed to delete the file');
            }
        } catch (error) {
            setError('Error occurred while deleting the file');
        }
    };

    const downloadFile = async (filename: string) => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/admin/adminpanel/customer/documents/download/${filename}/`);
            if (!response.ok) throw new Error("Download failed");

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

    useEffect(() => {
        if (!customer_id) return;
        fetchUploadedFiles();
        // Ensure skeleton is shown for at least 2 seconds
        const timer = setTimeout(() => setForceWait(false), 1000);
        return () => clearTimeout(timer); // Cleanup
    }, [customer_id]);

    return (
        <div id="upload-component">
            <div className="">
                {error && <p className="alert alert-danger mt-3">{error}</p>}
                {success && <p className="alert alert-success mt-3">{success}</p>}

                {((loading || forceWait)) ? (
                    <>
                        <div className="card dashboard-button">
                            <div className="card-body button-history">
                                <Skeleton
                                    variant="rectangular"
                                    width={150} height={36}
                                    sx={{ borderRadius: "18px", marginBottom: 2 }}
                                />
                                <Skeleton
                                    variant="rectangular"
                                    width={"100%"} height={35}
                                    sx={{ borderRadius: "16px", marginBottom: 1 }}
                                />
                                <Skeleton
                                    variant="rectangular"
                                    width={"100%"} height={35}
                                    sx={{ borderRadius: "16px", marginBottom: 1 }}
                                />
                            </div>
                        </div>
                    </>
                ) : ( <>
                <div className="card">
                    <div className="row">
                        <div className="col-md-3 col-sm-4 col-6">
                                <input
                                    type="file"
                                    id={`file-upload`}
                                    ref={(el) => fileInputRefs.current[customer_id] = el}
                                    style={{ display: 'none' }}
                                    onChange={(e) => handleFileChange(e)}
                                />
                            <button className="btn-upload" onClick={() => handleButtonClick(customer_id)} disabled={isUploading}>
                                {isUploading
                                    ? 'Uploading...'
                                    : 'Upload'}
                            </button>
                        </div>
                        <div className="col-6">
                            {isUploading && (
                                <p><FontAwesomeIcon icon={faSpinner} spin /> Uploading...</p>
                            )}
                        </div>
                    </div>

                    <h3 style={{ fontSize: '20px' }} className="mt-3">
                        Uploaded Files
                    </h3>
                    <div style={{ margin: '0 1px' }} className="row">
                        {files.map((file, index) => (
                            <div className="col-12 form-control mb-2" style={{ display: 'flex' }} key={index}>
                                <span
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    onClick={() => downloadFile(file.file.split('/').pop()?.split('?')[0] || 'document.pdf')}
                                >
                                    <FontAwesomeIcon icon={faFilePdf} className="file-uploaded" />
                                    <span style={{ marginLeft: '5px' }}>{file.file.split('/').pop()?.split('?')[0]}</span>
                                </span>
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
                </>)}
            </div>
        </div>
    );
};

export default UploadFileAdmin;