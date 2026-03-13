import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function DamagedStockReport() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [filter, setFilter] = useState({ from: "", to: "" });
    const [actionMsg, setActionMsg] = useState("");

    const fetchData = async (params = {}) => {
        setLoading(true);
        try {
            const res = await api.get("/damaged-inventory", { params });
            setRecords(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleFilter = () => {
        fetchData({ from, to });
        setFilter({ from, to });
    };

    const handleAction = async (id, action) => {
        try {
            await api.put(`/damaged-inventory/${id}/${action}`);
            setActionMsg(`Action '${action}' applied successfully.`);
            fetchData({ from: filter.from, to: filter.to });
        } catch (err) {
            setActionMsg(err.response?.data?.message || "Action failed.");
        }
    };

    const totalDamagedQty = records.filter(r => r.status === "damaged").reduce((s, r) => s + r.quantity, 0);

    const styles = {
        container: { maxWidth: "1000px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" },
        card: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: "20px" },
        table: { width: "100%", borderCollapse: "collapse" },
        th: { borderBottom: "2px solid #f0f0f0", padding: "10px", textAlign: "left", background: "#fafafa", fontWeight: "600" },
        td: { borderBottom: "1px solid #f5f5f5", padding: "10px", verticalAlign: "middle" },
        badge: (status) => ({
            padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold",
            background: status === "damaged" ? "#fde8e8" : status === "written_off" ? "#e0e0e0" : "#d4edda",
            color: status === "damaged" ? "#c81e1e" : status === "written_off" ? "#555" : "#155724"
        }),
        btn: { padding: "6px 14px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "12px", marginRight: "5px" }
    };

    return (
        <div style={styles.container}>
            <h2>Damaged Stock Report</h2>

            {actionMsg && <p style={{ color: "#155724", background: "#d4edda", padding: "10px", borderRadius: "6px" }}>{actionMsg}</p>}

            <div style={styles.card}>
                <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
                    <div>
                        <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>From Date</label>
                        <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>To Date</label>
                        <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }} />
                    </div>
                    <button onClick={handleFilter} style={{ ...styles.btn, padding: "10px 20px", background: "#7b5a2b", color: "#fff", marginTop: "20px" }}>Apply Filter</button>
                </div>
            </div>

            <div style={{ ...styles.card, display: "flex", gap: "40px" }}>
                <div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>Total Damaged Items (Active)</p>
                    <h2 style={{ margin: 0, color: "#c81e1e" }}>{totalDamagedQty}</h2>
                </div>
                <div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>Total Records</p>
                    <h2 style={{ margin: 0 }}>{records.length}</h2>
                </div>
            </div>

            {loading ? <p>Loading...</p> : (
                <div style={styles.card}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Damage ID</th>
                                <th style={styles.th}>Product</th>
                                <th style={styles.th}>Qty</th>
                                <th style={styles.th}>Reason</th>
                                <th style={styles.th}>Sale ID</th>
                                <th style={styles.th}>Staff</th>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Actions (Admin)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.length === 0 && (
                                <tr><td colSpan="9" style={{ ...styles.td, textAlign: "center", color: "#999" }}>No damaged records found</td></tr>
                            )}
                            {records.map(r => (
                                <tr key={r._id}>
                                    <td style={styles.td}><b>{r.damage_id}</b></td>
                                    <td style={styles.td}>{r.product_id ? `${r.product_id.name} (${r.product_id.size || ''} / ${r.product_id.color || ''})` : "N/A"}</td>
                                    <td style={styles.td}>{r.quantity}</td>
                                    <td style={styles.td}><span style={{ color: "#c81e1e" }}>{r.reason}</span></td>
                                    <td style={styles.td}>{r.sale_id?.salesId || "N/A"}</td>
                                    <td style={styles.td}>{r.staff_id?.name || "N/A"}</td>
                                    <td style={styles.td}>{new Date(r.return_date).toLocaleDateString("en-IN")}</td>
                                    <td style={styles.td}><span style={styles.badge(r.status)}>{r.status.replace(/_/g, " ").toUpperCase()}</span></td>
                                    <td style={styles.td}>
                                        {r.status === "damaged" && (<>
                                            <button style={{ ...styles.btn, background: "#6c757d", color: "#fff" }} onClick={() => handleAction(r._id, "write-off")}>Write Off</button>
                                            <button style={{ ...styles.btn, background: "#28a745", color: "#fff" }} onClick={() => handleAction(r._id, "restore")}>Restore to Stock</button>
                                        </>)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
