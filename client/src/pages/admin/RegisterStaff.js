import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/ModernUI.css";

export default function RegisterStaff() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [strength, setStrength] = useState({ label: "Weak", color: "#cbd5e0", width: "33%" });

  const calculateStrength = (pass) => {
    if (!pass) return { label: "Weak", color: "#cbd5e0", width: "0%" };
    if (pass.length > 10 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) 
        return { label: "Strong", color: "#00b894", width: "100%" };
    if (pass.length > 6) 
        return { label: "Medium", color: "#fdcb6e", width: "66%" };
    return { label: "Weak", color: "#d63031", width: "33%" };
  };

  useEffect(() => {
    setStrength(calculateStrength(form.password));
  }, [form.password]);

  const isFormValid = form.name && form.email && form.phone.length === 10 && form.password.length >= 6;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      await api.post("auth/register", {
        ...form,
        role: "staff",
      });

      setSuccess("Staff Registered Successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setErrors({ server: err.response?.data?.message || "Registration failed. Email might already exist." });
    }
  };

  return (
    <div className="modern-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modern-card" style={{ width: '100%', maxWidth: '450px' }}>
        <h2 className="modern-title">Staff Registration</h2>

        {success && <div className="modern-success-banner">{success}</div>}
        {errors.server && <p className="modern-error text-center" style={{ marginBottom: '20px' }}>{errors.server}</p>}

        <form onSubmit={handleRegister}>
          <div className="modern-field">
            <label className="modern-label">Full Name</label>
            <input
              name="name"
              placeholder="Enter full name"
              value={form.name}
              onChange={handleInputChange}
              className="modern-input"
              required
            />
          </div>

          <div className="modern-field">
            <label className="modern-label">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="e.g. staff@shop.com"
              value={form.email}
              onChange={handleInputChange}
              className="modern-input"
              required
            />
          </div>

          <div className="modern-field">
            <label className="modern-label">Phone Number</label>
            <input
              name="phone"
              type="number"
              placeholder="10 Digits"
              value={form.phone}
              onChange={handleInputChange}
              className="modern-input"
              required
            />
            {form.phone && form.phone.length !== 10 && <span className="modern-error">Phone must be exactly 10 digits</span>}
          </div>

          <div className="modern-field">
            <label className="modern-label">Role</label>
            <input
              value="Staff"
              readOnly
              className="modern-input"
              style={{ background: '#f8fafc', color: '#64748b', fontWeight: 'bold' }}
            />
          </div>

          <div className="modern-field" style={{ position: 'relative' }}>
            <label className="modern-label">Password</label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleInputChange}
              className="modern-input"
              required
            />
            <span 
              className="password-toggle" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ top: '42px' }}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
            
            <div className="strength-meter">
              <div 
                className="strength-bar" 
                style={{ width: strength.width, backgroundColor: strength.color }}
              ></div>
            </div>
            <span style={{ fontSize: '11px', color: strength.color, fontWeight: 'bold' }}>{strength.label}</span>
          </div>

          <button type="submit" className="modern-button" disabled={!isFormValid}>
            Register Staff member
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '15px', color: '#636e72' }}>
          Already have an account? <Link to="/login" className="modern-link">Login</Link>
        </div>
      </div>

      <style>{`
        .modern-success-banner {
          background: #c6f6d5;
          color: #22543d;
          padding: 15px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 25px;
          font-weight: 600;
        }
        .text-center { text-align: center; }
      `}</style>
    </div>
  );
}
