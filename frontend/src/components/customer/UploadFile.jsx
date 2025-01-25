// src/components/UploadFile.jsx
import { useRef, useState, useEffect, useContext } from 'react';
import { LanguageContext } from "../../context/LanguageContext.jsx";
import { fetchWithAuth } from "../account/auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSpinner, faFilePdf} from "@fortawesome/free-solid-svg-icons";

const UploadFile = ({ onUploadSuccess }) => {
    const { currentData } = useContext(LanguageContext);
    console.log(currentData);
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
    // console.log(currentData.messages);
    // Обработчик выбора файла и автоматической загрузки
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        if (file.size > 2 * 1024 * 1024) {  // 2MB ограничение
            setError(currentData.messages.file_size);
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
                setSuccess(currentData.messages.file_ok);
                setTimeout(() => setSuccess(''), 3000);
                setError('');
                if (onUploadSuccess) {
                    onUploadSuccess();
                }
                fetchUploadedFiles();
            } else {
                const errorMessage = responseData.details?.file?.[0] || responseData.error || currentData.messages.file_failed;
                setError(errorMessage);
                setSuccess('');
            }
        } catch (error) {
            setError(currentData.messages.file_try_again);
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
    
            if (!window.confirm(currentData.messages.file_del_quest)) {
                return;
            }
    
            try {
                const response = await fetchWithAuth(`http://localhost:8000/api/customer/documents/${fileId}/delete/`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    setSuccess(currentData.messages.file_deleted);
                    setTimeout(() => setSuccess(''), 3000);
                    fetchUploadedFiles();
                } else {
                    setError(currentData.messages.file_failed_delete);
                }
            } catch (error) {
                setError(currentData.messages.file_failed_while_deleting);
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
                        {isUploading ? currentData.buttons.uploading : currentData.buttons.upload }
                    </button>
                </div>
                    <div className="col-4">
                        {/* Анимация загрузки */}
                        {isUploading && (
                            <div className="spinner" style={{ margin: '10px auto' }}>
                                {/* <FontAwesomeIcon
                                    icon={faSpinner}
                                    className="spinner-icon"
                                /> Uploading... */}
                            </div>
                        )}
                    </div>

                </div>
                

                {/* Список загруженных файлов */}
                <h3 style={{fontSize:"20px"}} className='mt-3'>{currentData.customer.uploaded_files}</h3>
                <div style={{margin:"0 1px"}} className='row'>
                    {files.map((file, index) => (
                        <div className='col-12 form-control mb-2' style={{display:'flex'}} key={index}>
                            <a href={`http://localhost:8000${file.file}`} target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon
                                    icon={faFilePdf}
                                    className="file-uploaded"
                                /> <span style={{marginLeft:"5px"}}>{file.file.split('/').pop()}</span>
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