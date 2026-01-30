import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [clothes, setClothes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/clothes").then(res => setClothes(res.data));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

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
      border: "none",
      cursor: "pointer",
    },
    outlineBtn: {
      background: "transparent",
      border: "2px solid #000",
      color: "#000",
    },
    dangerBtn: {
      background: "#d32f2f",
      color: "#fff",
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
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "40px 20px",
      marginTop: "20px"
    },
    card: {
      background: "transparent",
      display: "flex",
      flexDirection: "column",
      alignItems: "center", // Center everything
    },
    cardName: {
      fontWeight: "600",
      fontSize: "16px",
      marginBottom: "4px",
      textAlign: "center",
      color: "#111",
    },
    cardQty: {
      color: "#666",
      fontSize: "14px",
      textAlign: "center",
    },
    qtySpan: {
      fontWeight: "600",
      color: "#000",
    },
  };

  return (
    <div style={styles.dashboard}>
      <header style={styles.dashHeader}>
        <div style={styles.brand}>SELVALAKSHMI GARMENTS</div>

        <div style={styles.dashLinks}>


          <Link to="/sales" style={{ ...styles.btn, ...styles.outlineBtn }}>
            Sales
          </Link>

          <button
            onClick={handleLogout}
            style={{ ...styles.btn, ...styles.dangerBtn }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={styles.dashMain}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0 }}>Inventory</h2>
          <input
            placeholder="Search clothes..."
            onChange={(e) => api.get(`/clothes?search=${e.target.value}`).then(res => setClothes(res.data))}
            style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", width: "250px" }}
          />
        </div>

        <div style={styles.inventoryGrid}>
          {clothes.map((c) => (
            <div style={styles.card} key={c._id}>
              {/* Image Section */}
              <div style={{
                width: "100%",
                aspectRatio: "3/4",
                marginBottom: "15px",
                borderRadius: "8px",
                overflow: "hidden",
                height: "auto", // Let aspect ratio drive height
                backgroundColor: "#f0f0f0", // Subtle placeholder
                position: "relative"
              }}>
                {c.image ? (
                  <img
                    src={`http://localhost:5000${c.image}`}
                    alt={c.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover", // Cover to match the reference look
                      transition: "transform 0.3s ease",
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                  />
                ) : (
                  <div style={{
                    width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa"
                  }}>
                    No Image
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div style={styles.cardName}>{c.name}</div>
              <div style={styles.cardQty}>
                {c.category} <span style={{ margin: "0 5px" }}>•</span> ₹{c.price}
              </div>
              <div style={{ fontSize: "12px", color: "#888", marginTop: "5px", textAlign: "center" }}>
                {c.quantity} items left
              </div>

              {/* Actions */}
              {localStorage.getItem("role") === "admin" && (
                <div style={{ marginTop: "15px", display: "flex", justifyContent: "center", gap: "10px" }}>
                  <Link to={`/edit/${c._id}`} style={{ textDecoration: "none", fontSize: "12px", background: "#333", color: "white", padding: "8px 16px", borderRadius: "20px" }}>
                    Edit
                  </Link>
                  <button
                    onClick={async () => {
                      if (window.confirm("Are you sure?")) {
                        await api.delete(`/clothes/${c._id}`);
                        setClothes(clothes.filter(x => x._id !== c._id));
                      }
                    }}
                    style={{ border: "none", fontSize: "12px", background: "transparent", color: "#d32f2f", padding: "8px 16px", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
