import { useNavigate, useLocation } from "react-router-dom";

export default function BackButton({ customStyle = {} }) {
  const navigate = useNavigate();
  const location = useLocation();

  const styles = {
    wrap: {
      position: "absolute",
      top: "20px",
      left: "20px",
      zIndex: 1000,
      ...customStyle
    },
    btn: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: "var(--color-card, #fff)",
      color: "var(--color-sidebar, #2c3e50)",
      border: "1px solid rgba(0,0,0,0.1)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      borderRadius: "12px",
      padding: "10px 18px",
      cursor: "pointer",
      fontWeight: 600,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    },
    icon: { fontSize: 18 },
    label: { fontSize: 14 },
  };

  const goBack = () => navigate(-1);

  const currentPath = location.pathname.replace(/\/$/, "") || "/";
  const hideOnPaths = ["/", "/collections", "/brands", "/about", "/dashboard", "/admin", "/admin/inventory"];
  
  if (hideOnPaths.includes(currentPath)) return null;

  return (
    <div style={styles.wrap}>
      <button style={styles.btn} onClick={goBack} title={`Back from ${location.pathname}`}>
        <span style={styles.icon}>←</span>
        <span style={styles.label}>Back</span>
      </button>
    </div>
  );
}
