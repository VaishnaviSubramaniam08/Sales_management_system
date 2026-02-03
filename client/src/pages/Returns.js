import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Returns() {
    const navigate = useNavigate();
    const [saleId, setSaleId] = useState("");
    const [sale, setSale] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // returnItems: { clothId: { qty: 0, reason: "Defective" } }
    const [returnItems, setReturnItems] = useState({});

    const [returnsHistory, setReturnsHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = () => {
        api.get("/returns").then(res => setReturnsHistory(res.data)).catch(err => console.error(err));
    };

    const fetchSale = async () => {
        if (!saleId) return;
        setError("");
        setSuccess("");
        setSale(null);
        setReturnItems({});

        try {
            const res = await api.get(`/sales/${saleId}`);
            setSale(res.data);
        } catch (err) {
            setError("Sale not found");
        }
    };

    const handleCheckItem = (clothId, checked) => {
        setReturnItems(prev => {
            if (checked) {
                return { ...prev, [clothId]: { qty: 1, reason: "Defective" } };
            } else {
                const copy = { ...prev };
                delete copy[clothId];
                return copy;
            }
        });
    };

    const handleQtyChange = (clothId, val, max) => {
        const v = Math.min(max, Math.max(1, Number(val)));
        setReturnItems(prev => ({
            ...prev,
            [clothId]: { ...prev[clothId], qty: v }
        }));
    };

    const handleReasonChange = (clothId, val) => {
        setReturnItems(prev => ({
            ...prev,
            [clothId]: { ...prev[clothId], reason: val }
        }));
    };

    const calculateRefund = () => {
        if (!sale) return 0;
        let total = 0;
        Object.keys(returnItems).forEach(clothId => {
            const item = sale.items.find(i => i.clothId._id === clothId);
            if (item) {
                total += item.price * returnItems[clothId].qty;
            }
        });
        return total;
    };

    const handleSubmitReturn = async () => {
        const refundAmount = calculateRefund();
        const items = Object.keys(returnItems).map(clothId => ({
            clothId,
            quantity: returnItems[clothId].qty,
            reason: returnItems[clothId].reason
        }));

        if (items.length === 0) {
            setError("No items selected for return");
            return;
        }

        try {
            await api.post("/returns/add", {
                saleId: sale._id,
                items,
                refundAmount
            });
            setSuccess(`Return processed! Refund Amount: ₹${refundAmount}`);
            setSale(null);
            setReturnItems({});
            setSaleId("");
            fetchHistory();
        } catch (err) {
            setError(err.response?.data?.error || "Return failed");
        }
    };

    // Styles
    const styles = {
        container: { maxWidth: "800px", margin: "0 auto", padding: "20px", background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", fontFamily: "sans-serif", minHeight: "calc(100vh - 100px)" },
        header: { textAlign: "center", marginBottom: "20px" },
        searchBox: { display: "flex", gap: "10px", marginBottom: "20px" },
        input: { flex: 1, padding: "10px", border: "1px solid #ddd", borderRadius: "5px" },
        btn: { padding: "10px 20px", background: "#333", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
        saleBox: { border: "1px solid #eee", padding: "15px", borderRadius: "8px", marginBottom: "20px" },
        itemRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f0f0" },
        table: { width: "100%", borderCollapse: "collapse", marginTop: "20px" },
        th: { borderBottom: "2px solid #ddd", padding: "10px", textAlign: "left" },
        td: { borderBottom: "1px solid #eee", padding: "10px" },
    };

    return (
        <div style={styles.container}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ ...styles.header, margin: 0 }}>Returns & Exchange</h2>
                <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: "1px solid #333", borderRadius: "4px", padding: "5px 10px", cursor: "pointer" }}>Back to Dashboard</button>
            </div>
            <br />

            {error && <div style={{ color: "red", textAlign: "center", marginBottom: "10px" }}>{error}</div>}
            {success && <div style={{ color: "green", textAlign: "center", marginBottom: "10px" }}>{success}</div>}

            <div style={styles.searchBox}>
                <input
                    placeholder="Enter Sale ID to Find..."
                    value={saleId}
                    onChange={e => setSaleId(e.target.value)}
                    style={styles.input}
                />
                <button onClick={fetchSale} style={styles.btn}>Find Sale</button>
            </div>

            {sale && (
                <div style={styles.saleBox}>
                    <h3>Sale #{sale._id.slice(-6)}</h3>
                    <p>Date: {new Date(sale.date).toLocaleString()} | Original Total: ₹{sale.totalAmount}</p>
                    <p>Status: <b>{sale.status}</b></p>

                    <div style={{ marginTop: "15px" }}>
                        <h4>Select Items to Return:</h4>
                        {sale.items.map(item => (
                            <div key={item.clothId._id} style={styles.itemRow}>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <input
                                        type="checkbox"
                                        checked={returnItems[item.clothId._id] !== undefined}
                                        onChange={e => handleCheckItem(item.clothId._id, e.target.checked)}
                                    />
                                    <span>
                                        <b>{item.clothId.name}</b> (Sold: {item.quantity})
                                    </span>
                                </div>

                                {returnItems[item.clothId._id] && (
                                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                        <input
                                            type="number"
                                            value={returnItems[item.clothId._id].qty}
                                            onChange={e => handleQtyChange(item.clothId._id, e.target.value, item.quantity)}
                                            style={{ width: "50px", padding: "5px" }}
                                        />
                                        <select
                                            value={returnItems[item.clothId._id].reason}
                                            onChange={e => handleReasonChange(item.clothId._id, e.target.value)}
                                            style={{ padding: "5px" }}
                                        >
                                            <option value="Defective">Defective</option>
                                            <option value="Size Issue">Size Issue</option>
                                            <option value="Changed Mind">Changed Mind</option>
                                        </select>
                                    </div>
                                )}
                                <div>₹{item.price}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: "20px", textAlign: "right" }}>
                        <h3>Refund: ₹{calculateRefund()}</h3>
                        <button onClick={handleSubmitReturn} style={{ ...styles.btn, background: "#d32f2f" }}>
                            Confirm Return
                        </button>
                    </div>
                </div>
            )}

            <h3>Recent Returns</h3>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Sale ID</th>
                        <th style={styles.th}>Items</th>
                        <th style={styles.th}>Refund</th>
                    </tr>
                </thead>
                <tbody>
                    {returnsHistory.map(ret => (
                        <tr key={ret._id}>
                            <td style={styles.td}>{new Date(ret.date).toLocaleDateString()}</td>
                            <td style={styles.td}>{ret.saleId ? ret.saleId._id.slice(-6) : "N/A"}</td>
                            <td style={styles.td}>
                                {ret.items.map(i => (
                                    <div key={i._id}>{i.clothId ? i.clothId.name : "Item"} (x{i.quantity}) - {i.reason}</div>
                                ))}
                            </td>
                            <td style={styles.td}>₹{ret.refundAmount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
