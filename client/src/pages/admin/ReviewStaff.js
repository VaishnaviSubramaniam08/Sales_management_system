import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ReviewStaff() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await api.get("/auth/pending");
      setPendingUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch pending users");
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await api.put(`/auth/approve/${id}`, { status });
      alert(`User ${status} successfully`);
      fetchPendingUsers();
    } catch (err) {
      alert("Action failed");
    }
  };

  const styles = {
    page: { padding: "25px", background: "#fdf6ed", minHeight: "100vh", fontFamily: "Arial, sans-serif" },
    title: { fontSize: "26px", fontWeight: "700", marginBottom: "20px" },
    card: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", marginBottom: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    info: { display: "flex", flexDirection: "column" },
    name: { fontSize: "18px", fontWeight: "600" },
    email: { color: "#666", fontSize: "14px" },
    actions: { display: "flex", gap: "10px" },
    approveBtn: { background: "#2e7d32", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" },
    rejectBtn: { background: "#d32f2f", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" }
  };

  if (loading) return <div style={styles.page}>Loading...</div>;

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Review Staff Requests</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {pendingUsers.length === 0 ? (
        <p>No pending registration requests.</p>
      ) : (
        pendingUsers.map((user) => (
          <div key={user._id} style={styles.card}>
            <div style={styles.info}>
              <span style={styles.name}>{user.name}</span>
              <span style={styles.email}>{user.email}</span>
              <span style={styles.email}>Phone: {user.phone}</span>
              <span style={styles.email}>Requested Role: <b>{user.role}</b></span>
            </div>
            <div style={styles.actions}>
              <button
                style={styles.approveBtn}
                onClick={() => handleAction(user._id, "approved")}
              >
                Approve
              </button>
              <button
                style={styles.rejectBtn}
                onClick={() => handleAction(user._id, "rejected")}
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
