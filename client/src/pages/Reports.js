import React, { useState } from "react";
import api from "../api/axios";

export default function Reports() {
    const [loading, setLoading] = useState(false);

    const downloadReport = async (type) => {
        setLoading(true);
        try {
            const response = await api.get(`/sales/report/${type}`, {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `sales_report.${type}`
            );
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error("Error downloading report", err);
            alert("Failed to download report");
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            padding: "25px",
            textAlign: "center",
            fontFamily: "Segoe UI, sans-serif",
            background: "#fff7ee",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            minHeight: "calc(100vh - 100px)",
        },
        button: {
            padding: "15px 30px",
            margin: "10px",
            fontSize: "18px",
            cursor: "pointer",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
        },
        csvButton: {
            backgroundColor: "#28a745",
        }
    };

    return (
        <div style={styles.container}>
            <h2>Reports & Analytics</h2>
            <p>Generate and download sales reports.</p>

            <div style={{ marginTop: "30px" }}>
                <button
                    style={styles.button}
                    onClick={() => downloadReport("pdf")}
                    disabled={loading}
                >
                    {loading ? "Generating..." : "Download PDF Report"}
                </button>

                <button
                    style={{ ...styles.button, ...styles.csvButton }}
                    onClick={() => downloadReport("csv")}
                    disabled={loading}
                >
                    {loading ? "Generating..." : "Download CSV Report"}
                </button>
            </div>
        </div>
    );
}
