import {useState, useEffect, useContext, useRef, useCallback} from "react";
import { fetchWithAuth } from "../account/auth";
import {useParams, Link} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileInvoiceDollar,
    faFilePdf, faChevronLeft
} from "@fortawesome/free-solid-svg-icons";
import HeaderAdmin from "./HeaderAdmin";
import FooterAccount from "../FooterAccount";
import {Skeleton} from "@mui/material";
import DarkTooltip from "../utils/DarkTooltip";
import { LanguageContext } from "../../context/LanguageContext";

interface Report {
    id: number;
    report_month: string;
    created_at: string;
    orders_count: number;
    files: ReportFile[];
}

interface ReportFile {
    id: number;
    file: string;
}

const Invoices: React.FC = () => {
    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { customerId } = useParams<{ customerId: string }>();
    const [forceWait, setForceWait] = useState<boolean>(true);
    const [isUploading, setIsUploading] = useState<{ [key: number]: boolean }>({});
    const BASE_URL = import.meta.env.VITE_API_URL;
    const { currentData } = useContext(LanguageContext);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, reportId: number) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        setIsUploading(prev => ({ ...prev, [reportId]: true }));

        try {
            const response = await fetchWithAuth(
                `${BASE_URL}/admin/adminpanel/user/report/${reportId}/upload/`,
                {
                    method: "POST",
                    body: formData
                }
            );

            if (response.ok) {
                const newFile: ReportFile = await response.json();
                setReports(prevReports => prevReports.map(report => {
                    if (report.id === reportId) {
                        return { ...report, files: [...report.files, newFile] };
                    }
                    return report;
                }));
            } else {
                console.error("Upload failed");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setIsUploading(prev => ({ ...prev, [reportId]: false }));
        }
    };

    const handleFileDelete = async (reportId: number, fileId: number) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;

        try {
            const response = await fetchWithAuth(
                `${BASE_URL}/admin/adminpanel/user/report/${reportId}/delete-file/${fileId}/`,
                {
                    method: "DELETE",
                }
            );

            if (response.ok) {
                setReports(prevReports =>
                    prevReports.map(report => {
                        if (report.id === reportId) {
                            return {
                                ...report,
                                files: report.files.filter(file => file.id !== fileId),
                            };
                        }
                        return report;
                    })
                );
            } else {
                console.error("Delete failed");
            }
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };

    // Open file picker
    const handleButtonClick = (reportId: number) => {
        fileInputRefs.current[reportId]?.click();
    };

    const downloadFile = useCallback(async (filename: string) => {
        try {
            const cleanName = filename.split('/').pop()?.split('?')[0] || 'document.pdf';
            const response = await fetchWithAuth(`${BASE_URL}/admin/adminpanel/customer/documents/download/${cleanName}/`);
            if (!response.ok) throw new Error("Download failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = cleanName;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download error:", error);
        }
    }, []);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await fetchWithAuth(`${BASE_URL}/admin/adminpanel/user/reports/${customerId}/`);
                if (response.ok) {
                    const data: Report[] = await response.json();
                    setReports(data);
                } else {
                    console.error("Failed to fetch reports");
                }
            } catch (error) {
                console.error("Error fetching reports:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
        // Ensure skeleton is shown for at least 2 seconds
        const timer = setTimeout(() => setForceWait(false), 1000);
        return () => clearTimeout(timer); // Cleanup
    }, []);

    return (
        <>
            <HeaderAdmin />
            <div className="container margin-top-90 wrapper invoices-page">
                <div className="row message-block-76">
                    <div className="col-3 back-button">
                        <Link to={`/admin/customer-detail/${customerId}`} className="text-decoration-none">
                            <p className="back-link">
                                <FontAwesomeIcon icon={faChevronLeft} className="icon" />
                                <span className="ms-2"><strong>{currentData?.buttons.back || "Zpět"}</strong></span>
                            </p>
                        </Link>
                    </div>

                </div>
                <h3 style={{fontSize:"24px"}}>{currentData?.history?.your_invoices || "Vaše faktury"}</h3>
                <div className="row">

                    {loading || forceWait ? (
                        [...Array(3)].map((_, index) => (

                            <div className="order-history col-lg-8 col-md-10 col-12" key={index}>

                                <div className="card">
                                    <div className="place-icon-skeleton"></div>
                                    <Skeleton
                                        variant="rectangular"
                                        width={140} height={20}
                                        className=""
                                        sx={{ borderRadius: "6px", marginTop: 0 }}
                                    />
                                    <Skeleton
                                        variant="rectangular"
                                        width={200} height={20}
                                        className=""
                                        sx={{ borderRadius: "6px", marginTop: 1 }}
                                    />
                                </div>

                            </div>
                        ))
                    ) : (
                        <>

                            {reports.length > 0 ? (
                                <div className="report-card col-lg-8 col-md-10 col-12">
                                    {reports.map((report) => (
                                        <div
                                            key={report.id}
                                            className="card"
                                        >
                                            <div>
                                                <div className="invoice-icon">
                                                    <FontAwesomeIcon
                                                        icon={faFileInvoiceDollar}
                                                        data-tooltip-id="invoice-tooltip"
                                                    />
                                                </div>
                                                <p><strong>{new Date(report.report_month).toLocaleString("en-US", { month: "long", year: "numeric" })}</strong></p>
                                                <p className="mb-1">{report.orders_count} orders: {report.orders.join(', ')}</p>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-3 col-sm-4 col-6 mb-3">
                                                    <input
                                                        type="file"
                                                        id={`file-upload-${report.id}`}
                                                        ref={el => fileInputRefs.current[report.id] = el}
                                                        style={{ display: 'none' }}
                                                        onChange={(e) => handleFileUpload(e, report.id)}
                                                    />
                                                    <button className="btn-upload" onClick={() => handleButtonClick(report.id)} disabled={isUploading[report.id]}>
                                                        {isUploading[report.id] ? 'Uploading...' : 'Upload'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div style={{ margin: '0 1px' }} className="row">
                                                {report.files.length > 0 ? (
                                                    report.files.map((file) => (
                                                        <div key={file.id} className="col-12 form-control mb-1" style={{ display: 'flex' }}>
                                                            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => downloadFile(file.file)}>
                                                                <FontAwesomeIcon icon={faFilePdf} className="file-uploaded" />
                                                                <span style={{ marginLeft: '5px' }}>{file.file.split('/').pop()?.split('?')[0]}</span>
                                                            </span>

                                                            <button onClick={() => handleFileDelete(report.id, file.id)}
                                                                    style={{ marginLeft: 'auto', fontSize: '10px', color: 'red' }}
                                                            >
                                                                ❌
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-muted">No files available</span>
                                                )}
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>{currentData?.history?.no_invoices || "V momentální chvíli nemáte žádné faktury k zobrazení"}</p>
                            )}
                        </>)}
                </div>
            </div>
            <FooterAccount />
        </>
    );
};

export default Invoices;