import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      if (res.data.user.role.toLowerCase() === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch {
      alert("Login failed");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>

      <p>
        New user? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}