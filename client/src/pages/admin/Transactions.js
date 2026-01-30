import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Transactions() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/payments")
            .then(res => {
                setPayments(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch payments", err);
                setLoading(false);
            });
    }, []);

    const styles = {
        container: {
            padding: "30px",
            fontFamily: "Segoe UI, sans-serif",
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
        th: {
            background: "#343a40",
            color: "white",
            padding: "12px",
            textAlign: "left",
        },
        td: {
            padding: "12px",
            borderBottom: "1px solid #ddd",
        },
        statusPaid: {
            color: "green",
            fontWeight: "bold",
        },
        statusPending: {
            color: "orange",
            fontWeight: "bold",
        }
    };

    return (
        <div style={styles.container}>
            <h2>Transaction History</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Transaction ID</th>
                            <th style={styles.th}>Sale ID</th>
                            <th style={styles.th}>Method</th>
                            <th style={styles.th}>Amount</th>
                            <th style={styles.th}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(p => (
                            <tr key={p._id}>
                                <td style={styles.td}>{new Date(p.date).toLocaleString()}</td>
                                <td style={styles.td}>{p.transactionId || "N/A"}</td>
                                <td style={styles.td}>{p.saleId ? p.saleId._id : "N/A"}</td>
                                <td style={styles.td}>{p.method}</td>
                                <td style={styles.td}>₹{p.amount}</td>
                                <td style={styles.td}>
                                    <span style={p.status === "Paid" ? styles.statusPaid : styles.statusPending}>
                                        {p.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
