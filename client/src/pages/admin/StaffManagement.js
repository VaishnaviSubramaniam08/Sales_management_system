import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function StaffManagement() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("active"); // "active" | "all"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("auth/users");
      setUsers(res.data);
    } catch (e) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onToggleStatus = async (id, currentStatus) => {
    const isDeactivating = currentStatus === "active" || currentStatus === "approved";
    const msg = isDeactivating 
      ? "Are you sure you want to deactivate this staff? They will no longer be able to login."
      : "Reactivate this staff account?";
    
    if (!window.confirm(msg)) return;

    try {
      const newStatus = isDeactivating ? "inactive" : "active";
      await api.put(`auth/users/${id}/status`, { status: newStatus });
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to update status");
    }
  };


  const styles = {
    page: { padding: 24, background: "var(--color-bg)", minHeight: "100vh", color: "var(--color-text)", fontFamily: "Segoe UI, sans-serif" },
    titleBar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
    title: { fontSize: 26, fontWeight: 700, color: "#334155" },
    filterBar: { display: "flex", gap: "10px", marginBottom: "20px" },
    filterBtn: (active) => ({
      padding: "8px 16px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      background: active ? "#7b5a2b" : "#fff",
      color: active ? "#fff" : "#64748b",
      cursor: "pointer",
      fontWeight: "600",
      transition: "all 0.2s"
    }),
    card: { background: "var(--color-card)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderRadius: 12, padding: "20px", overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", color: "#64748b", fontWeight: "600", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" },
    td: { padding: "16px", fontSize: "14px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" },
    badge: (status) => {
      const isActive = status === "active" || status === "approved";
      return {
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "600",
        background: isActive ? "#dcfce7" : "#f1f5f9",
        color: isActive ? "#166534" : "#475569"
      };
    },
    actionBtn: (type) => ({
      padding: "6px 12px",
      borderRadius: "6px",
      border: "1px solid",
      borderColor: type === "danger" ? "#fee2e2" : "#e2e8f0",
      background: "#fff",
      color: type === "danger" ? "#ef4444" : "#475569",
      fontSize: "13px",
      fontWeight: "600",
      cursor: "pointer",
      marginLeft: "8px",
      transition: "all 0.2s"
    }),
  };

  const filteredUsers = filter === "active" 
    ? users.filter(u => u.status === "active" || u.status === "approved")
    : users;

  return (
    <div style={styles.page}>
      <div style={styles.titleBar}>
        <div style={styles.title}>Staff Directory</div>
      </div>

      <div style={styles.filterBar}>
        <button 
          style={styles.filterBtn(filter === "active")} 
          onClick={() => setFilter("active")}
        >
          Show Active Only
        </button>
        <button 
          style={styles.filterBtn(filter === "all")} 
          onClick={() => setFilter("all")}
        >
          Show All Staff
        </button>
      </div>

      <div style={styles.card}>
        {loading ? (
          <p style={{ padding: 20 }}>Updating records...</p>
        ) : error ? (
          <div style={{ padding: 20, color: "#ef4444", background: "#fef2f2", borderRadius: 8 }}>{error}</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Full Name</th>
                <th style={styles.th}>Email Address</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u._id}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>{u.name}</div>
                  </td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{u.phone || '—'}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(u.status)}>
                      {u.status === "active" || u.status === "approved" ? "● Active" : "○ Inactive"}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    {u.role !== 'admin' && (
                      <button
                        style={styles.actionBtn("standard")}
                        onClick={() => onToggleStatus(u._id, u.status)}
                      >
                        {u.status === "active" || u.status === "approved" ? "Deactivate" : "Activate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
