import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function AdminHome() {
  const [summary, setSummary] = useState({ totalSales: 0, totalRevenue: 0 });
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/sales/dashboard"),
      api.get("/clothes/alerts/low-stock?threshold=5"),
    ])
      .then(([s, l]) => {
        setSummary(s.data || { totalSales: 0, totalRevenue: 0 });
        setLowStock(l.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const styles = {
    wrap: { background: "var(--color-bg)", color: "var(--color-text)" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 20 },
    card: { background: "var(--color-card)", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 15px var(--shadow-card)", padding: 16, borderRadius: 12 },
    section: { background: "var(--color-card)", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 15px var(--shadow-card)", padding: 16, borderRadius: 12 },
    lowItem: { padding: "8px 0", borderBottom: "1px solid #EEE3DC" },
  };

  if (loading) return <div className="admin-home" style={styles.wrap}>Loading...</div>;

  return (
    <div className="admin-home" style={styles.wrap}>
      <div style={styles.grid}>
        <div style={styles.card}>
          <div>Total Sales</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{summary.totalSales}</div>
        </div>
        <div style={styles.card}>
          <div>Total Revenue</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>₹{summary.totalRevenue}</div>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={{ marginTop: 0 }}>Low Stock (≤ 5)</h3>
        {lowStock.length === 0 ? (
          <p>No low-stock items.</p>
        ) : (
          lowStock.map((item) => (
            <div key={item._id} style={styles.lowItem}>
              {item.name} — Qty: <b>{item.quantity}</b>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
