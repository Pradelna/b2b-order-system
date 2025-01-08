// src/components/UploadFile.jsx
import React, { useRef, useState, useEffect } from 'react';
import { fetchWithAuth } from '../auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSpinner, faFilePdf} from "@fortawesome/free-solid-svg-icons";

const UploadFile = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const [files, setFiles] = useState([]); // Список загруженных файлов
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isUploading, setIsUploading] = useState(false);  // Состояние анимации загрузки

    useEffect(() => {
        fetchUploadedFiles();
    }, []);

    // Загрузка списка файлов
    const fetchUploadedFiles = async () => {
        try {
            const response = await fetchWithAuth(`http://localhost:8000/api/customer/documents/`);
            if (!response.ok) throw new Error('Failed to fetch files');
            const data = await response.json();
            // console.log("Fetched files:", data);
            setFiles(data);
        } catch (error) {
            console.error('Error loading files:', error);
            setError('Failed to load files');
        }
    };

    // Функция для открытия проводника
    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    // Обработчик выбора файла и автоматической загрузки
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        if (file.size > 2 * 1024 * 1024) {  // 2MB ограничение
            setError('The selected file exceeds the maximum size of 2MB.');
            setSuccess('');
            return;
        }

        setIsUploading(true);  // Запуск анимации загрузки
        setError('');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetchWithAuth('http://localhost:8000/api/customer/documents/upload/', {
                method: 'POST',
                body: formData,
            });
    
            const responseData = await response.json();
            console.log('Server Response:', responseData); // Для диагностики
    
            if (response.status === 201) {
                setSuccess('File uploaded successfully!');
                setTimeout(() => setSuccess(''), 3000);
                setError('');
                if (onUploadSuccess) {
                    onUploadSuccess();
                }
                fetchUploadedFiles();
            } else {
                const errorMessage = responseData.details?.file?.[0] || responseData.error || 'Failed to upload file.';
                setError(errorMessage);
                setSuccess('');
            }
        } catch (error) {
            setError('An error occurred while uploading the file. Please try again.');
            setSuccess('');
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);  // Остановка анимации загрузки
        }
    };

        // ✅ Функция для удаления файла
        const handleDeleteFile = async (fileId) => {
            if (!fileId) {
                setError('Invalid file ID.');
                console.error('Invalid file ID:', fileId);
                return;
            }
    
            if (!window.confirm('Are you sure you want to delete this file?')) {
                return;
            }
    
            try {
                const response = await fetchWithAuth(`http://localhost:8000/api/customer/documents/${fileId}/delete/`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    setSuccess('File deleted successfully!');
                    setTimeout(() => setSuccess(''), 3000);
                    fetchUploadedFiles();
                } else {
                    setError('Failed to delete the file.');
                }
            } catch (error) {
                setError('An error occurred while deleting the file.');
            }
        };

    return (
        <div className='row other-card'>

            {error && <p className='alert alert-danger mt-3'>{error}</p>}
            {success && <p className='alert alert-success mt-3'>{success}</p>}

            <div className="card">
                <div className="row">
                <div className="col-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    <button className='btn-upload' onClick={handleButtonClick} disabled={isUploading}>
                        {isUploading ? 'Uploading...' : 'Upload File'}
                    </button>
                </div>
                    <div className="col-4">
                        {/* Анимация загрузки */}
                        {isUploading && (
                            <div className="spinner" style={{ margin: '10px auto' }}>
                                <FontAwesomeIcon
                                    icon={faSpinner}
                                    className="spinner-icon"
                                /> {/*Uploading...*/}
                            </div>
                        )}
                    </div>

                </div>
                

                {/* Список загруженных файлов */}
                <h3 style={{fontSize:"20px"}} className='mt-3'>Uploaded Files</h3>
                <div style={{margin:"0 1px"}} className='row'>
                    {files.map((file, index) => (
                        <div className='col-12 form-control mb-2' style={{display:'flex'}} key={index}>
                            <a href={`http://localhost:8000${file.file}`} target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon
                                    icon={faFilePdf}
                                    className="file-uploaded"
                                /> {file.file.split('/').pop()}
                            </a>
                            <button
                                onClick={() => handleDeleteFile(file.id)}
                                style={{ marginLeft: 'auto', order:'2', fontSize:'10px', color: 'red' }}
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