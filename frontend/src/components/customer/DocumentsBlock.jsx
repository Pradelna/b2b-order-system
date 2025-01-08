// src/components/UploadFile.jsx
import React, { useRef, useState, useEffect } from 'react';
import { fetchWithAuth } from "../account/auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faFilePdf} from "@fortawesome/free-solid-svg-icons";

const DocumentsBlock = ({ langData }) => {
    const fileInputRef = useRef(null);
    const [files, setFiles] = useState([]); // Список загруженных файлов

    useEffect(() => {
        fetchUploadedFiles();
    }, []);

    // Загрузка списка файлов
    const fetchUploadedFiles = async () => {
        try {
            const response = await fetchWithAuth(`http://localhost:8000/api/customer/documents/for-customer/`);
            if (!response.ok) throw new Error('Failed to fetch files');
            const data = await response.json();
            // console.log("Fetched files:", data);
            setFiles(data);
        } catch (error) {
            console.error('Error loading files:', error);
            setError('Failed to load files');
        }
    };

    return (
        <div className='row other-card'>

            <div className="card">

                <h3 style={{fontSize:"20px"}} className='mt-3'>Important documents</h3>
                <div style={{margin:"0 1px"}} className='row'>
                    {files.map((file, index) => (
                        <div className='col-12 form-control mb-2' style={{display:'flex'}} key={index}>
                            <a href={`http://localhost:8000${file.file}`} target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon
                                    icon={faFilePdf}
                                    className="file-uploaded"
                                /> <span style={{marginLeft:"5px"}}>{file.file.split('/').pop()}</span>
                            </a>
                 
                        </div>
                    ))}
                </div>
                <div className="row mb-2">
                    <div className="col-12">
                        <div className="form-control">
                            <a href="#" target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faFilePdf} className="file-uploaded" />
                            <span style={{marginLeft:"5px"}}>{ langData.customer.vop }</span>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="row mb-2">
                    <div className="col-12">
                        <div className="form-control">
                            <a href="#" target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faFilePdf} className="file-uploaded" />
                            <span style={{marginLeft:"5px"}}>{ langData.customer.terms_use }</span>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="form-control">
                            <a href="#" target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faFilePdf} className="file-uploaded mr-3" />
                            <span style={{marginLeft:"5px"}}>{ langData.customer.gdpr }</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DocumentsBlock;