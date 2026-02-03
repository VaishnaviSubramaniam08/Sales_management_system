import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function StaffManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/auth/users");
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

  const onDelete = async (id) => {
    const user = users.find(u => u._id === id);
    if (!window.confirm(`Delete ${user?.name || 'this user'}? This cannot be undone.`)) return;
    try {
      await api.delete(`/auth/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (e) {
      alert("Failed to delete user");
    }
  };

  const styles = {
    page: { padding: 24, background: "var(--color-bg)", minHeight: "100vh", color: "var(--color-text)", fontFamily: "Segoe UI, sans-serif" },
    titleBar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    title: { fontSize: 24, fontWeight: 700 },
    card: { background: "var(--color-card)", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 6px 18px var(--shadow-card)", borderRadius: 12, padding: 16 },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", borderBottom: "1px solid #eee", padding: 10, position: "sticky", top: 0, background: "var(--color-card)" },
    td: { borderBottom: "1px solid #f3f3f3", padding: 10, fontSize: 14 },
    dangerBtn: { padding: "8px 12px", borderRadius: 6, border: "1px solid #b3261e", color: "#b3261e", background: "transparent", cursor: "pointer", fontWeight: 600 },
    badge: { display: "inline-block", padding: "2px 8px", borderRadius: 999, background: "#eef2ff", color: "#334155", fontSize: 12 },
  };

  return (
    <div style={styles.page}>
      <div style={styles.titleBar}>
        <div style={styles.title}>Staff Management</div>
      </div>

      <div style={styles.card}>
        {loading ? (
          <p>Loading users...</p>
        ) : error ? (
          <p style={{ color: "#b3261e" }}>{error}</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={styles.td}>{u.name}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{u.phone || '—'}</td>
                  <td style={styles.td}><span style={styles.badge}>{u.role}</span></td>
                  <td style={styles.td}>{u.status}</td>
                  <td style={styles.td}>
                    <button
                      style={styles.dangerBtn}
                      onClick={() => onDelete(u._id)}
                      disabled={u.role === 'admin'}
                      title={u.role === 'admin' ? 'Cannot delete admin users' : 'Delete user'}
                    >
                      Delete
                    </button>
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
