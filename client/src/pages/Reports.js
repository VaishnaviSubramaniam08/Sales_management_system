import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export default function Reports() {
    const [loading, setLoading] = useState(false);
    const [sales, setSales] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [filters, setFilters] = useState({
        status: "",
        staffId: "",
        from: "",
        to: ""
    });

    const fetchSales = useCallback(async () => {
        setLoading(true);
        try {
            const { status, staffId, from, to } = filters;
            const res = await api.get("/sales", {
                params: { status, staffId, from, to }
            });
            setSales(res.data);
        } catch (err) {
            console.error("Error fetching sales:", err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const fetchStaff = async () => {
        try {
            const res = await api.get("/auth/users");
            setStaffList(res.data);
        } catch (err) {
            console.error("Error fetching staff:", err);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    useEffect(() => {
        fetchSales();
    }, [filters]);

    const downloadReport = async (type) => {
        setLoading(true);
        try {
            const response = await api.get(`/sales/report/${type}`, {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `sales_report.${type}`);
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
        container: { padding: "30px", fontFamily: "Segoe UI, sans-serif", background: "#fdf6ed", minHeight: "100vh" },
        header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
        title: { fontSize: "28px", fontWeight: "700", color: "#1e293b" },
        filterSection: { background: "#fdf6ed", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: "25px" },
        filterGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", alignItems: "end" },
        label: { display: "block", fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "5px" },
        input: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "14px", boxSizing: "border-box" },
        card: { background: "#fdf6ed", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflow: "hidden" },
        table: { width: "100%", borderCollapse: "collapse" },
        th: { textAlign: "left", background: "#fdf6ed", padding: "12px 16px", fontSize: "12px", textTransform: "uppercase", color: "#64748b", fontWeight: "700" },
        td: { padding: "14px 16px", borderBottom: "1px solid #f1f5f9", fontSize: "14px", color: "#334155" },
        badge: (status) => ({
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: "700",
            background: status === "active" ? "#dcfce7" : "#f1f5f9",
            color: status === "active" ? "#166534" : "#475569"
        }),
        downloadArea: { display: "flex", gap: "10px" },
        btn: { padding: "10px 20px", borderRadius: "6px", border: "none", fontWeight: "600", cursor: "pointer", fontSize: "14px" },
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Sales Tracking & Reports</h2>
                <div style={styles.downloadArea}>
                    <button style={{ ...styles.btn, background: "#7b5a2b", color: "#fff" }} onClick={() => downloadReport("pdf")}>
                        Export PDF
                    </button>
                    <button style={{ ...styles.btn, background: "#10b981", color: "#fff" }} onClick={() => downloadReport("csv")}>
                        Export CSV
                    </button>
                </div>
            </div>

            <div style={styles.filterSection}>
                <div style={styles.filterGrid}>
                    <div>
                        <label style={styles.label}>Staff Status</label>
                        <select 
                            style={styles.input} 
                            value={filters.status} 
                            onChange={e => setFilters({...filters, status: e.target.value})}
                        >
                            <option value="">All Staff</option>
                            <option value="active">Active Staff</option>
                            <option value="inactive">Inactive Staff</option>
                        </select>
                    </div>
                    <div>
                        <label style={styles.label}>Specific Staff</label>
                        <select 
                            style={styles.input}
                            value={filters.staffId}
                            onChange={e => setFilters({...filters, staffId: e.target.value})}
                        >
                            <option value="">Any Staff</option>
                            {staffList.map(s => (
                                <option key={s._id} value={s._id}>{s.name} ({s.status})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={styles.label}>From Date</label>
                        <input 
                            type="date" 
                            style={styles.input} 
                            value={filters.from} 
                            onChange={e => setFilters({...filters, from: e.target.value})} 
                        />
                    </div>
                    <div>
                        <label style={styles.label}>To Date</label>
                        <input 
                            type="date" 
                            style={styles.input} 
                            value={filters.to} 
                            onChange={e => setFilters({...filters, to: e.target.value})} 
                        />
                    </div>
                </div>
            </div>

            <div style={styles.card}>
                {loading ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading sales data...</div>
                ) : sales.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>No sales found for selected filters.</div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Sale ID</th>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Staff Name</th>
                                <th style={styles.th}>Staff Status</th>
                                <th style={styles.th}>Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map(s => (
                                <tr key={s._id}>
                                    <td style={styles.td}>#{String(s._id).slice(-6).toUpperCase()}</td>
                                    <td style={styles.td}>{new Date(s.date).toLocaleDateString()}</td>
                                    <td style={styles.td}><b>{s.soldBy?.name || "Deleted"}</b></td>
                                    <td style={styles.td}>
                                        <span style={styles.badge(s.soldBy?.status)}>
                                            {s.soldBy?.status?.toUpperCase() || "UNKNOWN"}
                                        </span>
                                    </td>
                                    <td style={styles.td}>₹{s.totalAmount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
