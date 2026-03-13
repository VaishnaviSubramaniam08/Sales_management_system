import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import BackButton from "../components/BackButton";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [tempToken, setTempToken] = useState("");
  
  const navigate = useNavigate();

  const isFormValid = form.email && form.password.length >= 6;

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      const res = await api.post("auth/login", form);
      
      if (res.data.require2FA) {
        setShow2FA(true);
        setTempToken(res.data.tempToken);
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      if (res.data.user.role.toLowerCase() === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("auth/verify-2fa", { tempToken, code: twoFACode });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      
      if (res.data.user.role.toLowerCase() === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("2FA Verification failed");
    }
  };

  return (
    <>
      <BackButton />
      <div className="login-container">
        <h2>Login</h2>
        
        {error && <p style={{ color: "red", textAlign: "center", marginBottom: "10px" }}>{error}</p>}

        {!show2FA ? (
          <form onSubmit={handleLogin}>
            <div>
              <input
                name="email"
                type="text"
                value={form.email}
                onChange={handleInputChange}
                placeholder="Email/Username"
                required
              />
            </div>

            <div style={{ position: 'relative' }}>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
              />
              <span 
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '10px', 
                  top: '12px', 
                  cursor: 'pointer', 
                  fontSize: '13px', 
                  color: '#666' 
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', fontSize: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: 'auto', marginRight: '8px', marginBottom: '0' }}
                />
                Remember Me
              </label>
              <span 
                onClick={() => alert('Reset link sent!')} 
                style={{ color: 'var(--color-accent)', fontWeight: '600', cursor: 'pointer' }}
              >
                Forgot?
              </span>
            </div>

            <button type="submit" disabled={!isFormValid} style={{ opacity: isFormValid ? 1 : 0.6 }}>
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify2FA}>
            <p style={{ marginBottom: '10px' }}>A verification code has been sent to your email.</p>
            <input
              placeholder="Enter 6-digit code"
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value)}
              required
            />
            <button type="submit">Verify & Login</button>
            <button 
              type="button" 
              onClick={() => setShow2FA(false)} 
              style={{ background: '#666', marginTop: '10px' }}
            >
              Back to Login
            </button>
          </form>
        )}

        <p>
          New user? <Link to="/register">Register</Link>
        </p>
      </div>
    </>
  );
}