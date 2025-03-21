import React, {useState, useEffect, useContext} from "react";
import { fetchWithAuth } from "../account/auth";
import {Link, useParams} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileInvoiceDollar,
    faFileArrowDown
} from "@fortawesome/free-solid-svg-icons";
import HeaderAccount from "../HeaderAccount";
import FooterAccount from "../FooterAccount";
import NavButtons from "../account/NavButtons";
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
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { customerId } = useParams<{ customerId: string }>();
    const [forceWait, setForceWait] = useState<boolean>(true);
    const BASE_URL = import.meta.env.VITE_API_URL;
    const { currentData } = useContext(LanguageContext);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, reportId: number) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

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
                        return {...report, files: [...report.files, newFile]};
                    }
                    return report;
                }));
            } else {
                console.error("Upload failed");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
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
            <HeaderAccount customerId={customerId} />
            <div className="container margin-top-90 wrapper invoices-page">
                <div className="row message-block-76">
                    <div className="col-3 back-button">
                        <NavButtons />
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
                                                <p className="mb-1">Orders: {report.orders_count}</p>
                                            </div>
                                            <div className="download-invoice">
                                                {report.files.length > 0 ? (
                                                    report.files.map((file) => (
                                                        <div key={file.id} className="invoice-file-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <a href={`${BASE_URL.replace('/api', '')}${file.file}`} download className="btn btn-download" target="_blank">
                                                                <DarkTooltip title="Download invoice" placement="top" arrow>
                                                                    <FontAwesomeIcon icon={faFileArrowDown} style={{ cursor: "pointer" }} />
                                                                </DarkTooltip>
                                                                <span className="download-invoice-span"> Download</span>
                                                            </a>

                                                            <button className="btn btn-delete" onClick={() => handleFileDelete(report.id, file.id)}>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-muted">No files available</span>
                                                )}
                                            </div>
                                            <div className="upload-invoice mt-2">
                                                <input type="file" id={`file-upload-${report.id}`} onChange={(e) => handleFileUpload(e, report.id)}/>
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