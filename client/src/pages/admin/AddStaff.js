import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function AddStaff() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      alert("All fields are required");
      return;
    }

    try {
      await api.post("/auth/register", {
        ...form,
        role: "staff",
      });

      alert("✅ Staff account created successfully");
      navigate("/admin");
    } catch {
      alert("❌ Failed to create staff");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>➕ Add Staff Account</h2>
        <p style={styles.subtext}>
          Staff can login and manage sales & stock (no admin rights)
        </p>

        <input
          style={styles.input}
          placeholder="Staff Name"
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          style={styles.input}
          placeholder="Staff Email"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          style={styles.input}
          placeholder="Temporary Password"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button style={styles.button} onClick={handleSubmit}>
          Create Staff
        </button>

        <button
          style={styles.backButton}
          onClick={() => navigate("/admin")}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    background: "#ffffff",
    padding: "30px",
    width: "100%",
    maxWidth: "400px",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },

  heading: {
    textAlign: "center",
    marginBottom: "10px",
    color: "#333",
  },

  subtext: {
    textAlign: "center",
    fontSize: "14px",
    color: "#666",
    marginBottom: "20px",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },

  button: {
    width: "100%",
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "15px",
    cursor: "pointer",
    marginBottom: "10px",
  },

  backButton: {
    width: "100%",
    padding: "8px",
    background: "#e5e7eb",
    color: "#333",
    border: "none",
    borderRadius: "5px",
    fontSize: "14px",
    cursor: "pointer",
  },
};
