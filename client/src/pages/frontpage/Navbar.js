import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="topbar">
      <div className="brand">SELVALAKSHMI GARMENTS</div>

      {/* Hamburger for mobile */}
      <div
        className={`hamburger ${menuOpen ? "active" : ""}`}
        onClick={toggleMenu}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Menu */}
      <div className={`menu ${menuOpen ? "active" : ""}`}>
        <Link to="/" className="menuItem" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/collections" className="menuItem" onClick={() => setMenuOpen(false)}>Collections</Link>
        <Link to="/brands" className="menuItem" onClick={() => setMenuOpen(false)}>Brands</Link>
        <Link to="/about" className="menuItem" onClick={() => setMenuOpen(false)}>About</Link>
        <Link to="/login">
          <button className="loginBtn" onClick={() => setMenuOpen(false)}>Login</button>
        </Link>
      </div>
    </nav>
  );
}
