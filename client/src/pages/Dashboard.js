import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [clothes, setClothes] = useState([]);

  useEffect(() => {
    api.get("/clothes").then(res => setClothes(res.data));
  }, []);

  // ----- Inline Styles -----
  const styles = {
    dashboard: {
      padding: "20px",
      background: "#f5f5f5",
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif",
    },
    dashHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "25px",
    },
    brand: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#222",
    },
    dashLinks: {
      display: "flex",
      alignItems: "center",
    },
    btn: {
      textDecoration: "none",
      padding: "10px 18px",
      borderRadius: "8px",
      marginLeft: "10px",
      background: "#000",
      color: "#fff",
      fontWeight: "600",
    },
    outlineBtn: {
      background: "transparent",
      border: "2px solid #000",
      color: "#000",
    },
    dashMain: {
      background: "#fff",
      padding: "20px",
      borderRadius: "16px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    },
    dashTitle: {
      marginBottom: "20px",
      color: "#333",
    },
    inventoryGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "15px",
    },
    card: {
      background: "#f8f8f8",
      padding: "15px",
      borderRadius: "14px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
    },
    cardName: {
      fontWeight: "700",
      marginBottom: "8px",
    },
    cardQty: {
      color: "#555",
    },
    qtySpan: {
      fontWeight: "700",
      color: "#000",
    },
  };

  return (
    <div style={styles.dashboard}>
      <header style={styles.dashHeader}>
        <div style={styles.brand}>SELVALAKSHMI GARMENTS</div>
        <div style={styles.dashLinks}>
          <Link to="/add" style={styles.btn}>
            Add Clothes
          </Link>
          <Link to="/sales" style={{ ...styles.btn, ...styles.outlineBtn }}>
            Sales
          </Link>
        </div>
      </header>

      <main style={styles.dashMain}>
        <h2 style={styles.dashTitle}>Inventory</h2>

        <div style={styles.inventoryGrid}>
          {clothes.map((c) => (
            <div style={styles.card} key={c._id}>
              <div style={styles.cardName}>{c.name}</div>
              <div style={styles.cardQty}>
                Qty: <span style={styles.qtySpan}>{c.quantity}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
