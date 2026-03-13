import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function AdminSummary() {
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalRevenue: 0,
  });

  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    api.get("sales/dashboard").then(res => setSummary(res.data));
    api.get("clothes/alerts/low-stock?threshold=5").then(res => setLowStock(res.data));
  }, []);

  const colors = {
    sidebar: "var(--color-sidebar)",
    cardBg: "var(--color-card)",
    cardShadow: "var(--shadow-card)"
  };

  const styles = {
    header: {
      fontSize: "26px",
      fontWeight: "700",
      marginBottom: "25px",
      textTransform: "uppercase",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "20px",
      marginBottom: "30px",
    },
    card: {
      background: colors.cardBg,
      padding: "20px",
      borderRadius: "16px",
      boxShadow: `0 4px 15px ${colors.cardShadow}`,
    },
    cardTitle: {
      fontSize: "14px",
      color: colors.sidebar,
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
    cardValue: {
      fontSize: "28px",
      fontWeight: "700",
      marginTop: "8px",
    },
    section: {
      background: colors.cardBg,
      padding: "20px",
      borderRadius: "16px",
      boxShadow: `0 4px 15px ${colors.cardShadow}`,
      marginBottom: "30px",
    },
    lowItem: {
      padding: "10px 0",
      borderBottom: "1px solid #EEE3DC",
      fontWeight: "500",
    },
  };

  return (
    <>
      <div style={styles.header}>Admin Dashboard Overview</div>

      {/* KPI Cards */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Total Sales</div>
          <div style={styles.cardValue}>{summary.totalSales}</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Total Revenue</div>
          <div style={styles.cardValue}>₹{summary.totalRevenue}</div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div style={styles.section}>
        <h3>Low Stock Alerts</h3>

        {lowStock.length === 0 ? (
          <p>No low-stock items 🎉</p>
        ) : (
          lowStock.map(item => (
            <div key={item._id} style={styles.lowItem}>
              {item.name} – Qty: <b>{item.quantity}</b>
            </div>
          ))
        )}
      </div>
    </>
  );
}
