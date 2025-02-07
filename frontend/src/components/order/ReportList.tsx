import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchWithAuth } from "../account/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faFilePdf, faDownload, faSpinner, faFileInvoiceDollar} from "@fortawesome/free-solid-svg-icons";
import HeaderAccount from "../HeaderAccount";
import Footer from "../Footer";

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

const ReportList: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await fetchWithAuth("http://127.0.0.1:8000/api/order/reports/");
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
    }, []);

    if (loading) {
        return <p><FontAwesomeIcon icon={faSpinner} spin /> Loading reports...</p>;
    }

    return (
        <>
            <HeaderAccount />
        <div className="container margin-top-90 wrapper invoices-page">
            <h3 style={{fontSize:"24px"}}>Your Invoices</h3>
            <div className="row">
            {reports.length > 0 ? (
                <div className="order-history col-lg-8 col-md-10 col-12">
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
                                        <a
                                            key={file.id}
                                            href={file.file}
                                            download
                                            className="btn btn-download"
                                            target="_blank"
                                        >
                                            <FontAwesomeIcon icon={faDownload} /> Download
                                        </a>
                                    ))
                                ) : (
                                    <span className="text-muted">No files available</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No reports available.</p>
            )}
            </div>
        </div>
            <Footer />
        </>
    );
};

export default ReportList;