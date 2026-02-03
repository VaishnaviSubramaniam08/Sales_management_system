import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import BackButton from "../components/BackButton";
import "./Register.css";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "staff",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.phone) {
      setError("All fields are required");
      return;
    }

    try {
      await api.post("/auth/register", form);

      alert("✅ Registration submitted. Awaiting Admin approval.");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <>
      <BackButton />
      <div className="register-container">
        <h2>Staff Registration</h2>

      {error && <p className="register-error">{error}</p>}

      <form onSubmit={handleRegister}>
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="email"
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
        />

        <input
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
        />

        <select name="role" value={form.role} onChange={handleChange}>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <button type="submit">Register</button>
      </form>

      <p>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </div>
    </>
  );
}
