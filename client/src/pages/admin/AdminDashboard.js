import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    totalSales: 0,
    totalRevenue: 0,
  });

  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    api.get("/sales/dashboard").then(res => setSummary(res.data));
    api.get("/clothes/alerts/low-stock").then(res => setLowStock(res.data));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
    navigate("/");
  };

  const handleGenerateReport = async () => {
    try {
      const response = await api.get("/sales/report/pdf", {
        responseType: "blob", // Important for binary data
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "sales_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to generate report", err);
      alert("Failed to generate report");
    }
  };

  const styles = {
    page: {
      padding: "25px",
      background: "#f4f6f8",
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "30px",
    },
    title: {
      fontSize: "26px",
      fontWeight: "700",
    },
    logout: {
      background: "#d32f2f",
      color: "#fff",
      padding: "10px 18px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "20px",
      marginBottom: "30px",
    },
    card: {
      background: "#fff",
      padding: "20px",
      borderRadius: "16px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    },
    cardTitle: {
      fontSize: "15px",
      color: "#555",
    },
    cardValue: {
      fontSize: "28px",
      fontWeight: "700",
      marginTop: "8px",
    },
    section: {
      background: "#fff",
      padding: "20px",
      borderRadius: "16px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    },
    lowItem: {
      padding: "10px 0",
      borderBottom: "1px solid #eee",
    },
    actionBtn: {
      padding: "10px 16px",
      borderRadius: "8px",
      border: "none",
      background: "#000",
      color: "#fff",
      cursor: "pointer",
      marginRight: "10px",
      marginTop: "10px",
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>Admin Dashboard</div>
        <button onClick={handleLogout} style={styles.logout}>Logout</button>
      </div>

      {/* Summary Cards */}
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

      {/* Low Stock Section */}
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

        {/* Quick Actions */}
        <div>
          <button style={styles.actionBtn} onClick={() => navigate("/add")}>
            Add Clothes
          </button>

          <button style={styles.actionBtn} onClick={() => navigate("/add-staff")}>
            Add Staff
          </button>

          <button style={styles.actionBtn} onClick={() => navigate("/sales")}>
            View Sales
          </button>

          <button style={styles.actionBtn} onClick={() => navigate("/reports")}>
            View Reports
          </button>

          <button style={styles.actionBtn} onClick={() => navigate("/transactions")}>
            Transactions
          </button>

          <button style={styles.actionBtn} onClick={() => navigate("/dashboard")}>
            Manage Inventory
          </button>
        </div>
      </div>
    </div>
  );
}
