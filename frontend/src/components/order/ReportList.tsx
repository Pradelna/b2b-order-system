import React, {useState, useEffect, useContext, useCallback} from "react";
import { fetchWithAuth } from "../account/auth";
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

const ReportList: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [customerId, setCustomerId] = useState<Customer | null>(null);
    const [forceWait, setForceWait] = useState<boolean>(true);
    const BASE_URL = import.meta.env.VITE_API_URL;
    const { currentData } = useContext(LanguageContext);

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
                const response = await fetchWithAuth(`${BASE_URL}/order/reports/`);
                if (response.ok) {
                    const data: Report[] = await response.json();
                    // console.log(data);
                    setReports(data.reports);
                    // console.log(data);
                    setCustomerId(data.user_id);
                    // console.log(data[0].customer);
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
                                                        <button
                                                            key={file.id}
                                                            className="btn btn-download me-3"
                                                            onClick={() => downloadFile(file.file)}
                                                        >
                                                            <DarkTooltip title="Download invoice" placement="top" arrow>
                                                                <FontAwesomeIcon
                                                                    icon={faFileArrowDown}
                                                                    style={{ cursor: "pointer" }}
                                                                />
                                                            </DarkTooltip>
                                                        </button>
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

export default ReportList;