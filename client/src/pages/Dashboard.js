import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import BackButton from "../components/BackButton";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const colors = {
    background: "#f5f5f5",
    sidebar: "#5C4033",
    text: "#333",
    cardBg: "#fff",
    accent: "#A67C52",
    sidebarText: "#fff"
  };

  const styles = {
    layout: {
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif",
      background: colors.background,
      paddingLeft: "260px",
    },
    sidebar: {
      width: "260px",
      background: colors.sidebar,
      color: colors.sidebarText,
      display: "flex",
      flexDirection: "column",
      padding: "30px 20px",
      boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
      position: "fixed",
      height: "100vh",
      left: 0,
      top: 0,
      boxSizing: "border-box",
      zIndex: 1000,
    },
    nav: {
      flex: 1,
      overflowY: "auto",
      marginBottom: "20px",
      paddingRight: "5px",
    },
    brand: {
      fontSize: "20px",
      fontWeight: "bold",
      marginBottom: "40px",
      textAlign: "center",
      letterSpacing: "1px",
    },
    sideBtn: {
      textDecoration: "none",
      color: "rgba(255,255,255,0.7)",
      padding: "12px 16px",
      marginBottom: "8px",
      borderRadius: "8px",
      fontWeight: "600",
      transition: "all 0.3s",
      display: "block",
    },
    activeSideBtn: {
      background: "#A67C52",
      color: "#fff",
    },
    logoutBtn: {
      marginTop: "auto",
      background: "#d32f2f",
      color: "#fff",
      padding: "12px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
    },
    content: {
      padding: "48px 30px 30px",
      minHeight: "100vh",
      position: "relative",
    },
  };

  const menuItems = [
    { label: "Inventory", path: "/dashboard" },
    { label: "Sales", path: "/dashboard/sales" },
    { label: "Returns", path: "/dashboard/returns" },
  ];

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>SELVALAKSHMI GARMENTS</div>
        
        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.sideBtn,
                ...(location.pathname === item.path ? styles.activeSideBtn : {}),
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={styles.content}>
        <BackButton customStyle={{ position: "static", marginBottom: "20px" }} />
        <Outlet />
      </main>
    </div>
  );
}
