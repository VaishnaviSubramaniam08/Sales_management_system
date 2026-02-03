import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import BackButton from "../../components/BackButton";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  // Colors sourced from global CSS variables for consistency
  const colors = {
    background: "var(--color-bg)",
    sidebar: "var(--color-sidebar)",
    text: "var(--color-text)",
    cardBg: "var(--color-card)",
    accent: "var(--color-accent)",
    cardShadow: "var(--shadow-card)"
  };

  const styles = {
    layout: {
      display: "flex",
      minHeight: "100vh",
      fontFamily: "var(--font-family-base)",
      color: colors.text,
      background: colors.background,
    },
    sidebar: {
      width: "260px",
      background: colors.sidebar,
      color: colors.background,
      display: "flex",
      flexDirection: "column",
      padding: "20px",
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
    sideTitle: {
      fontSize: "20px",
      fontWeight: "700",
      marginBottom: "25px",
      color: colors.background,
    },
    sideBtn: {
      textDecoration: "none",
      background: "transparent",
      color: colors.background,
      border: "none",
      textAlign: "left",
      padding: "12px 10px",
      marginBottom: "10px",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "600",
      transition: "all 0.3s",
      display: "block",
    },
    logoutBtn: {
      marginTop: "auto",
      background: colors.accent,
      color: colors.sidebar,
      fontWeight: "700",
      padding: "12px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
    },
    content: {
      flex: 1,
      padding: "25px",
      marginLeft: "260px",
      position: "relative",
      minHeight: "100vh",
    },
  };

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sideTitle}>SELVALAKSHMI Admin</div>

        <nav style={styles.nav}>
          {[
            { label: "Dashboard", path: "/admin" },
            { label: "Inventory", path: "/admin/inventory" },
            { label: "Sales", path: "/admin/sales" },
            { label: "Returns", path: "/admin/returns" },
            { label: "Add Clothes", path: "/admin/add" },
            { label: "Reports", path: "/admin/reports" },
            { label: "Transactions", path: "/admin/transactions" },
            { label: "Staff Management", path: "/admin/staff" },
            { label: "Sales Oversight", path: "/admin/sales-oversight" },

            { label: "Review Staff", path: "/admin/review-staff" },
          ].map(btn => (
            <Link
              key={btn.path}
              to={btn.path}
              style={{
                ...styles.sideBtn,
                background: location.pathname === btn.path ? colors.accent : "transparent",
              }}
            >
              {btn.label}
            </Link>
          ))}
        </nav>

        <button
          style={styles.logoutBtn}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <div style={{ marginBottom: "20px" }}>
          <BackButton />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
