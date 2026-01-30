import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function RegisterStaff() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    try {
      await api.post("/auth/register", {
        ...form,
        role: "staff", // 🔒 force staff role
      });

      alert("Staff account created successfully");
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "450px", margin: "auto" }}>
      <h2>Add Staff</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleRegister}>
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          style={{ width: "100%", padding: "10px", margin: "10px 0" }}
        />

        <input
          name="email"
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          style={{ width: "100%", padding: "10px", margin: "10px 0" }}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={{ width: "100%", padding: "10px", margin: "10px 0" }}
        />

        <button type="submit" style={{ padding: "10px 20px" }}>
          Create Staff
        </button>
      </form>
    </div>
  );
}
